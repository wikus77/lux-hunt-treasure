# LOGIN TOAST DEBUG — Audit report (read-only)

**Data:** 2026-02-20  
**Scope:** Perché il bottone "Accedi" va in loading ma non appare alcun toast in caso di credenziali errate (iOS Capacitor WKWebView).  
**Vincolo:** Solo verifica. Nessuna modifica al codice, nessun refactor, nessun fix.

---

## 1. Flow mappato (diagramma testuale)

```
Route /login (WouterRoutes.tsx)
    │
    └── <Route path="/login" component={Login} />
              │
              ▼
        Login.tsx
    (createPortal(..., document.body) → overlay fullscreen z-[100])
              │
              └── currentScreen === 'login' → renderLoginScreen()
                        │
                        └── <StandardLoginForm verificationStatus={...} />
                                  │
                                  ├── useAuthContext() → login da AuthProvider
                                  ├── handleSubmit(e)
                                  │     ├── validazione → eventuale toast.error + return
                                  │     ├── setIsLoading(true)
                                  │     ├── result = await login(cleanEmail, cleanPassword)
                                  │     ├── if (!result.success) → toast.error(...) ; return
                                  │     ├── else → toast.success(...) ; navigate(...)
                                  │     └── finally → setIsLoading(false)
                                  │
                                  └── Form + Button submit
```

**Percorso reale confermato dal codice:**
- `src/routes/WouterRoutes.tsx` (circa riga 1181): `<Route path="/login" component={Login} />`
- `src/pages/Login.tsx`: import di `StandardLoginForm`, in `renderLoginScreen()` viene renderizzato `<StandardLoginForm verificationStatus={verificationStatus} />`
- `src/components/auth/StandardLoginForm.tsx`: `const { login } = useAuthContext();` e in `handleSubmit` viene chiamato `await login(cleanEmail, cleanPassword)` e poi gestito `result.success`

---

## 2. Snippet handleSubmit

**File:** `src/components/auth/StandardLoginForm.tsx`

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const cleanEmail = sanitizeEmail(email);
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    toast.error('Tutti i campi sono obbligatori');
    return;
  }

  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    toast.error('Formato email non valido');
    return;
  }

  setIsLoading(true);

  try {
    console.log('🔐 SECURE LOGIN ATTEMPT');

    const result = await login(cleanEmail, cleanPassword);

    if (!result.success) {
      console.error('❌ LOGIN ERROR');
      toast.error('Errore di login', {
        description: result.error?.message || 'Credenziali non valide'
      });
      return;
    }

    // ... success path: toast.success, navigate, ecc.
  } catch (error: any) {
    console.error('💥 LOGIN EXCEPTION');
    toast.error('Errore di sistema', {
      description: error.message || 'Si è verificato un errore imprevisto'
    });
  } finally {
    setIsLoading(false);
  }
};
```

**Verifiche:**
- `toast.error` è effettivamente nel ramo `if (!result.success)` (righe 55–60).
- Non c’è alcun `return` prima del toast in quel ramo: si fa `console.error`, poi `toast.error`, poi `return`.
- C’è `try/catch/finally`; in `finally` c’è `setIsLoading(false)`.
- In caso di eccezione (es. `login` che fa throw), si va nel `catch` e viene chiamato `toast.error('Errore di sistema', ...)`.

Quindi, a livello di flusso, il toast di errore **dovrebbe** essere eseguito quando `result.success === false`.

---

## 3. Snippet login() (AuthProvider)

**File:** `src/contexts/auth/AuthProvider.tsx` (circa righe 488–511)

```ts
const login = async (email: string, password: string) => {
  logForensicTimeline('T1_login_submit', { ... });
  log("Login attempt", email);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log("Login error", error.message);
      return { success: false, error };
    }

    log("Login success", data.user?.email);
    return { success: true, session: data.session };
  } catch (error) {
    log("Login exception", error);
    return { success: false, error };
  }
};
```

**Flusso success/error:**
- Se Supabase restituisce `error`: viene fatto `return { success: false, error }`. L’oggetto `error` è quello Supabase (con `message`, eventuale `code`, ecc.).
- Se non c’è `error`: viene fatto `return { success: true, session: data.session }`.
- Se viene lanciata un’eccezione: viene fatto `return { success: false, error }`.

Non c’è alcun percorso in cui, in caso di credenziali errate, venga restituito `{ success: true }`. Quindi in `StandardLoginForm`, con credenziali errate, `result` è sempre `{ success: false, error }` e non si entra nel ramo di successo.

---

## 4. Snippet Toaster mount

**File:** `src/App.tsx` (struttura rilevante)

```tsx
<Router>
  <SoundProvider>
    <AuthProvider>
      <InterestSignalsProvider>
        {/* ... */}
        <WouterRoutes />
        {/* ... */}
        <Toaster />
        {/* ... */}
      </InterestSignalsProvider>
    </AuthProvider>
  </SoundProvider>
</Router>
```

- `<Toaster />` è montato **dentro** `AuthProvider` e **dentro** lo stesso albero che contiene `<WouterRoutes />`.
- Non è condizionato a `user` o a `isAuthenticated`: viene sempre renderizzato.
- Su route `/login`, vengono renderizzati sia `WouterRoutes` (che a sua volta renderizza `Login` → `StandardLoginForm`) sia `Toaster`. Sono sibling nello stesso provider.

**File:** `src/components/ui/sonner.tsx`

- Il componente usa `<Sonner theme={...} position="top-center" ... />` (libreria `sonner`).
- Non ci sono conditional render: il Toaster viene sempre renderizzato.
- Non dipende da stato utente; non ci sono wrapper che nascondono il Toaster in base alla route.

**Conclusione:** Il Toaster è montato e visibile anche su `/login`.

---

## 5. Verifica caso logico (result undefined / ramo else)

- **Forma del ramo:** C’è esattamente `if (!result.success) { ... toast.error ... return; }`. Non c’è un `else` separato per il successo; il codice di successo segue subito dopo il blocco `if`.
- **Se `result` fosse `undefined`:** Si avrebbe `!undefined === true`, quindi si entrerebbe nel blocco e si chiamerebbe `toast.error(..., { description: result.error?.message || '...' })`. Il toast verrebbe comunque invocato (con description "Credenziali non valide" se `result.error` è undefined).
- **`await login()`:** La chiamata è `const result = await login(...)` e il valore di ritorno è usato. `login` in AuthProvider ritorna sempre un oggetto `{ success, ... }` (non throw in condizioni normali), quindi `result` non è undefined nel flusso tipico.
- **Redirect:** Il `navigate(...)` viene chiamato solo nel ramo di successo (dopo `toast.success`). In caso di errore c’è solo `return`, quindi non c’è redirect che possa far unmountare la pagina prima che il toast sia mostrato.

Quindi, dal punto di vista logico, il ramo toast di errore è raggiunto e non c’è un return prematuro che lo eviti.

---

## 6. Ipotesi ordinate per probabilità

### Ipotesi 1 (alta): Toast eseguito ma non visibile su iOS (layout / viewport / stacking)

- **Descrizione:** `toast.error()` viene chiamato correttamente, ma su iOS (WKWebView) il toast non risulta visibile per ragioni di rendering o layout.
- **Evidenze a favore:**
  - La pagina Login è renderizzata con `createPortal(..., document.body)`: l’overlay di login è un figlio diretto di `body` con `className` che include `fixed inset-0` e in `Login.tsx` (contenitore principale) non è esplicitato uno z-index nel snippet letto, ma il contenitore interno della modale ha `z-10`; in `index.css` è presente `.page` con `z-index: 100`. Il overlay fullscreen di Login è `fixed inset-0 z-[100]` (Tailwind → `z-index: 100`). Il container dei toast in `src/styles/toast-animations.css` ha `[data-sonner-toaster] { z-index: 9999 !important; }`, quindi lo stacking non dovrebbe nascondere il toast. Resta possibile che su WKWebView:
    - viewport o safe-area (es. con tastiera aperta) spostino il toast fuori dall’area visibile;
    - `position: fixed` o `env(safe-area-inset-top)` si comportino in modo diverso e il toast finisca sopra/sotto la fold o dietro la status bar;
    - un layer nativo (tastiera, safe area) copra il toast.
- **Come verificare (solo diagnosi):** Su dispositivo iOS, con credenziali errate, controllare in console che compaiano i log `❌ LOGIN ERROR` e che non ci siano errori JavaScript. Ispezionare il DOM per la presenza di un elemento `[data-sonner-toast]` o del container toaster dopo il tentativo di login.

### Ipotesi 2 (media): Problema di timing / batching React su iOS

- **Descrizione:** Su iOS, subito dopo `toast.error()` viene eseguito `return` e `finally` → `setIsLoading(false)`. Un batching aggressivo o un flush del rendering potrebbe in teoria influire su come Sonner aggiorna il suo stato (es. toast aggiunto ma DOM non aggiornato in tempo, o unmount di qualche parte dell’albero che influisce sul portal di Sonner).
- **Evidenze:** Puramente teorico; non c’è nel codice alcun unmount condizionale del Toaster o della route login in caso di errore.
- **Come verificare:** Stesso test di cui sopra; eventualmente ritardare leggermente il `return` (solo in ambiente di debug) per vedere se il toast appare.

### Ipotesi 3 (media-bassa): Theme / provider (es. next-themes) e rendering del Toaster

- **Descrizione:** Il Toaster usa `useTheme()` da `next-themes`. Su WKWebView, in condizioni di idratazione o theme non pronti, il Toaster potrebbe renderizzare in modo anomalo (es. opacity 0, dimensioni 0, colore uguale allo sfondo).
- **Evidenze:** In `sonner.tsx` non c’è conditional render su `theme`; si passa solo `theme={theme as ...}`. Quindi il componente è sempre montato; al più il tema potrebbe essere sbagliato, non l’assenza del toast.
- **Come verificare:** Controllare nel DOM se il nodo del toast esiste e quali stili computed ha (visibilità, dimensioni, colore).

### Ipotesi 4 (bassa): `login()` non restituisce `{ success: false }` in uno scenario edge

- **Descrizione:** In uno scenario anomalo (rete, timeout, comportamento Supabase), `login()` potrebbe non ritornare o ritornare un valore inatteso.
- **Evidenze:** Il codice di `AuthProvider.login` è chiaro: in caso di `error` da `signInWithPassword` si fa sempre `return { success: false, error }`. In caso di throw si fa `return { success: false, error }` nel catch. Non c’è un path che restituisca `success: true` quando le credenziali sono sbagliate.
- **Come verificare:** In sviluppo, loggare `result` subito dopo `await login(...)` in StandardLoginForm (temporaneo, solo per audit) e ripetere con credenziali errate su iOS.

### Ipotesi 5 (bassa): Toast mostrato ma subito rimosso o nascosto

- **Descrizione:** Qualche effetto (es. un listener su auth state, un re-render massiccio) potrebbe far sì che il toast venga rimosso o nascosto subito dopo essere stato mostrato.
- **Evidenze:** In `Login.tsx` l’unico `useEffect` che fa redirect dipende da `isAuthenticated && !isLoading`. Con credenziali errate `isAuthenticated` resta `false`, quindi non si fa redirect. Non risulta codice che chiami esplicitamente una “dismiss” dei toast in risposta all’errore di login.
- **Come verificare:** Aumentare la `duration` del toast in ambiente di test e vedere se resta visibile più a lungo.

---

## 7. Conclusione tecnica: perché il toast non appare

- **Flusso:** Il percorso Route `/login` → `Login.tsx` → `StandardLoginForm.tsx` è confermato. Il bottone “Accedi” invoca `handleSubmit`; lo stato di loading conferma che `handleSubmit` viene eseguito.
- **Logica:** In `handleSubmit`, in caso di credenziali errate, `AuthProvider.login` restituisce `{ success: false, error }`. Il ramo `if (!result.success)` viene quindi eseguito e al suo interno viene chiamato `toast.error('Errore di login', { description: ... })`. Non c’è return prematuro che eviti questa chiamata.
- **Toaster:** Il `<Toaster />` è montato in `App.tsx` dentro `AuthProvider`, non è condizionato all’utente autenticato ed è presente anche sulla route `/login`. Il componente Sonner non ha conditional render che lo nascondano.
- **Redirect:** In caso di errore non viene chiamato `navigate`; l’unico redirect automatico su Login dipende da `isAuthenticated`, che resta `false` con credenziali errate.

Quindi, in base al codice analizzato, **il toast viene invocato** quando le credenziali sono errate. La spiegazione più plausibile per cui l’utente non lo vede su iOS (Capacitor WKWebView) è **di tipo rendering/layout su dispositivo**: il toast viene mostrato ma non è visibile (posizionamento, viewport, safe-area, tastiera, o comportamento di `position: fixed` / stacking in WKWebView). In seconda battuta si può considerare un problema di timing/batching o di theme/provider che influisce sulla visibilità del toast, senza escludere verifiche dirette su dispositivo (DOM, console, stili computed).

---

## 8. Nessuna proposta di fix

Questo documento è solo una diagnosi tecnica (read-only). Non sono state applicate patch, né aggiunti `console.log`, né modificato codice. Eventuali interventi (es. regolare posizione/z-index del toast su iOS, verificare safe-area con tastiera aperta, o log di debug temporanei) vanno decisi e implementati separatamente.

— Fine report —
