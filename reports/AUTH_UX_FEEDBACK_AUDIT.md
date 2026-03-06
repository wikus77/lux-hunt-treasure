# AUTH UX FEEDBACK — Read-Only Audit Report

**Data:** 2026-02-20  
**Scope:** iOS (Capacitor WKWebView) — Login/Register toast e validazioni  
**Vincolo:** SOLO LETTURA — nessuna modifica a codice, config, UI copy.  
**Output:** evidenze + proposte fix (non implementate).

---

## 1. Summary (1 pagina)

L’app espone due flussi auth principali: **Login** (`/login` → `Login.tsx` → `StandardLoginForm`) e **Registrazione** (`/register` → `Register.tsx` → `RegistrationForm` + `use-registration`). Esiste un sistema **toast (Sonner)** montato in `App.tsx` e usato in vari punti; sui flussi auth il feedback è **parzialmente presente** ma con gap chiari.

| Flusso        | Feedback su errore              | Validazione client              | Messaggi utente                    |
|---------------|----------------------------------|---------------------------------|------------------------------------|
| **Login**     | Toast su errore (Sonner)         | Email/password obbligatori + regex email | Testo spesso tecnico (`error.message`) |
| **Registrazione** | Toast su errore + errori inline per campo | Nome, email, password (8+ caratteri, maiusc/min/numero), conferma | Toast con messaggio Supabase raw; inline da `validateRegistration` |

**Problemi principali:**

1. **Login:** `StandardLoginForm` mostra `toast.error` con `result.error?.message || 'Credenziali non valide'`. Non esiste un mapping tipo `getErrorMessage()`: l’utente può vedere messaggi Supabase grezzi (es. "Invalid login credentials") invece di frasi localizzate/chiare.
2. **Registrazione:** Stesso pattern: `toast.error` con `standardResult.error?.message`. Validazione client (in `form-validation.ts`) è buona e gli errori di validazione sono mostrati **inline** tramite `FormField`; manca un mapping errori Supabase → messaggi user-friendly.
3. **Pagina alternativa `LoginPage.tsx`:** Non è usata dalle route attuali (Wouter: `/login` → `Login`). Contiene però una `getErrorMessage()` utile (Invalid login credentials → "Email o password non corretti", ecc.): pattern da riusare nel flusso effettivo.
4. **Nessun controllo su `error.status` / `error.code`** nei flussi auth: non c’è distinzione esplicita tra credenziali errate, email non verificata, utente inesistente, rate limit, ecc.
5. **Toast su iOS:** Il Toaster è `position="top-center"`, con safe-area gestita via style; non risultano fix specifici per tastiera aperta o z-index sopra modali fullscreen (login/register usano portal), da verificare su dispositivo.

**Conclusione:** Il feedback (toast + inline) **c’è**, ma i messaggi di errore da backend non sono tradotti in messaggi chiari e coerenti. La soluzione più “in-scope” è introdurre un mapping centralizzato degli errori Supabase (e, opzionalmente, riusare/estendere `getErrorMessage` di `LoginPage`) e usarlo sia in Login che in Register, senza cambiare flusso auth né routing.

---

## 2. Evidenze (tabella)

| File | Responsabilità | Gestione errori | UX feedback presente? |
|------|----------------|-----------------|------------------------|
| `src/pages/Login.tsx` | Pagina login (opening / signup / login), video, OAuth, contiene form login | Non gestisce errori submit; delega a `StandardLoginForm` | Solo per `verification=success`: `toast.success("Email verificata")`. Nessun toast per errori login. |
| `src/components/auth/StandardLoginForm.tsx` | Form email/password, chiama `AuthContext.login()` | `try/catch`; su `!result.success` toast; `finally` → `setIsLoading(false)` | **Sì:** `toast.error('Errore di login', { description: result.error?.message \|\| 'Credenziali non valide' })`; catch → `toast.error('Errore di sistema', ...)`. Validazione: campi obbligatori + regex email (no `validateLogin()` da `form-validation.ts`). |
| `src/contexts/auth/AuthProvider.tsx` | `login()`, `register()`, reset, resend | `signInWithPassword` / `signUp`: ritorna `{ success: false, error }` (oggetto Supabase), log con `log("Login error", error.message)` | Nessun toast; solo return per il chiamante. |
| `src/pages/Register.tsx` | Pagina registrazione, layout modale, link a login | Nessuna gestione errori; delega a `RegistrationForm` | Nessun toast diretto. |
| `src/components/auth/registration-form.tsx` | Form registrazione (nome, email, password, conferma) | Usa `useRegistration`; passa `errors` a `FormField` per ogni campo | Errori **inline** da validazione (`errors.name`, `errors.email`, ecc.). Nessun toast nel componente. |
| `src/hooks/use-registration.ts` | Submit registrazione: `signUp`, optional bypass captcha | Validazione con `validateRegistration(formData)`; su errore Supabase: `toast.error("Errore", { description: standardResult.error?.message })`; catch: toast generico | **Sì:** toast su errore signUp e su eccezione. Messaggio = `error.message` raw. Validazione client prima del submit. |
| `src/utils/form-validation.ts` | `validateRegistration`, `validateLogin` | Ritorna `{ isValid, errors }` con messaggi in italiano | Usato solo da `use-registration` (registrazione). Login **non** usa `validateLogin()`. |
| `src/components/ui/sonner.tsx` | Toaster Sonner globale, stile M1SSION, gesture swipe | N/A | Provider: `position="top-center"`, `duration={3000}`, stili custom. Montato in `App.tsx`. |
| `src/App.tsx` | Root, router, provider, Toaster | N/A | `<Toaster />` dentro `AuthProvider` → toast disponibili su tutte le route incluso `/login` e `/register`. |
| `src/pages/LoginPage.tsx` | Pagina login/register alternativa (non usata da route) | `useAuth()`; su errore `setErrors({ general: getErrorMessage(error.message) })`; success con `toast()` (useToast) | **Sì:** errore mostrato **inline** (`errors.general` in JSX). Contiene `getErrorMessage()` che mappa "Invalid login credentials" → "Email o password non corretti", "User already registered" → "Email già registrata...", "Email not confirmed" → "Email non verificata...". Pattern utile ma file non in uso per `/login`. |
| `src/hooks/use-auth.ts` | Login/register con `signInWithPassword`/`signUp`, session manager | Ritorna `{ success: false, error }` (oggetto); nessun toast | Non usato da `StandardLoginForm` (che usa `AuthContext`). Usato da `LoginPage.tsx` (non in route). |

---

## 3. Flussi testati (Login / Register)

### Login (flusso effettivo: `/login` → `Login` → `StandardLoginForm`)

1. Utente inserisce email/password e invia.
2. `StandardLoginForm.handleSubmit`:
   - Sanitizza email, controlla non vuoto e regex `/\S+@\S+\.\S+/`.
   - Se fallisce validazione → `toast.error('Tutti i campi sono obbligatori')` o `'Formato email non valido')` e return.
   - Chiama `login(cleanEmail, cleanPassword)` da `AuthContext`.
3. `AuthProvider.login`:
   - `supabase.auth.signInWithPassword({ email, password })`.
   - Se `error` → `return { success: false, error }` (oggetto Supabase).
   - Se ok → `return { success: true, session }`.
4. In `StandardLoginForm`:
   - Se `!result.success` → `toast.error('Errore di login', { description: result.error?.message || 'Credenziali non valide' })`.
   - Se success → `toast.success('Login effettuato con successo')` + redirect.
   - Catch → `toast.error('Errore di sistema', { description: error.message || '...' })`.
   - `finally` → `setIsLoading(false)`.

**Risultato:** L’utente vede sempre un toast in caso di errore, ma la `description` può essere il messaggio tecnico Supabase (es. "Invalid login credentials"). Non c’è distinzione esplicita “utente inesistente” vs “password errata” (Supabase non la espone); si può almeno uniformare il testo in italiano.

### Register (flusso effettivo: `/register` → `Register` → `RegistrationForm` → `use-registration`)

1. Utente compila nome, email, password, conferma e invia.
2. `use-registration.handleSubmit`:
   - `validateRegistration(formData)`: nome obbligatorio; email obbligatoria + regex; password obbligatoria, lunghezza ≥ 8, almeno una maiuscola, una minuscola e un numero; conferma obbligatoria e uguale a password.
   - Se non valido → `setErrors(validation.errors)` e return (solo **inline**, nessun toast).
   - `supabase.auth.signUp(...)`.
   - Se ok e `data.user` → `toast.success("Registrazione completata!")` + redirect.
   - Se errore e message include 'captcha' → tentativo bypass Edge Function; in caso di errore bypass → `toast.error("Errore nel bypass", ...)`.
   - Se entrambi falliscono → `toast.error("Errore", { description: standardResult.error?.message })`.
   - Catch → `toast.error("Errore", { description: error.message || '...' })`.
   - `finally` → `setIsSubmitting(false)`.

**Risultato:** Validazione client con messaggi chiari inline. Toast su errore Supabase con messaggio raw (es. "User already registered", "Password should be at least 6 characters"). Nessun mapping a messaggi italiani/chiari.

---

## 4. Gap analysis (perché oggi l’esperienza è incompleta)

1. **Messaggi Supabase non tradotti**
   - Login e Register mostrano `error.message` così com’è. Esempi: "Invalid login credentials", "User already registered", "Email not confirmed", "Password should be at least 6 characters". Per un utente finale (soprattutto su iOS) è preferibile avere messaggi coerenti in italiano e “safe” (senza dettagli tecnici).

2. **Nessun uso di `error.status` / `error.code`**
   - Il codice non distingue esplicitamente per codice (es. 400 vs 401 vs 422). Un mapping centralizzato che usa `error.code` o `error.message` (con fallback) permetterebbe messaggi più precisi (credenziali errate, email già usata, email non verificata, ecc.) senza cambiare flusso.

3. **`validateLogin()` non usato nel Login**
   - `form-validation.ts` espone `validateLogin()` (email obbligatoria + regex, password obbligatoria) ma `StandardLoginForm` fa validazione manuale (solo obbligatorietà + regex email). Coerenza: usare `validateLogin()` anche nel login e, se si vogliono regole password più stringenti in fase login, estendere lì.

4. **Login senza errore inline**
   - In Login l’errore è solo toast. In Register c’è sia toast (errore Supabase) sia inline (validazione). Per coerenza si potrebbe mostrare anche in Login un messaggio sotto il form (come `errors.general` in `LoginPage`) oltre al toast, opzionale.

5. **Toast e contesto iOS**
   - Toaster in `position="top-center"`; login/register sono fullscreen con portal. Su WKWebView andrebbe verificato che il toast sia sopra la tastiera e rispetti safe-area (padding già usati nelle pagine). Non risultano bug aperti nel codice; da testare su dispositivo.

6. **Pagina `LoginPage.tsx` non collegata**
   - Contiene la logica di mapping `getErrorMessage()` e mostra `errors.general` sotto il form. Le route attuali non la usano. Il “fix” più in-scope è portare quel pattern (mapping + eventuale errore generale sotto il form) in `StandardLoginForm` e in `use-registration`, non cambiare routing.

---

## 5. Proposte FIX (NON implementate)

### Fix A — Minimale (riuso toast + messaggi chiari)

- **Login**
  - In `StandardLoginForm.tsx`, subito dopo aver ricevuto `result.success === false`:
    - Introdurre una funzione locale o importata tipo `getAuthErrorMessage(error)` che, dato `result.error`, restituisca un messaggio utente (es. "Invalid login credentials" → "Email o password non corretti", "Email not confirmed" → "Email non verificata. Controlla la casella.", altro → "Credenziali non valide. Riprova.").
    - Chiamare `toast.error('Errore di login', { description: getAuthErrorMessage(result.error) })` invece di usare `result.error?.message` direttamente.
  - Opzionale: usare `validateLogin(formData)` da `form-validation.ts` prima di chiamare `login()` e mostrare errori inline tramite stato (come in Register), oltre al toast per errori di rete/Supabase.

- **Registrazione**
  - In `use-registration.ts`, quando si mostra l’errore dopo `standardResult.error` (e nel catch):
    - Usare lo stesso `getAuthErrorMessage(error)` (o equivalente per signUp: "User already registered" → "Email già registrata. Prova ad accedere.", "Password should be at least 6 characters" → "La password deve avere almeno 6 caratteri.", ecc.) e passarlo come `description` del `toast.error`.
  - Lasciare invariata la validazione client e gli errori inline.

- **Dove implementare**
  - `getAuthErrorMessage`: nuovo file `src/utils/authErrorMessages.ts` (o aggiunta in un utils auth esistente) con una funzione che riceve `error: { message?: string; code?: string }` e ritorna stringa. Chiamata da:
    - `src/components/auth/StandardLoginForm.tsx` (in `handleSubmit` su errore login).
    - `src/hooks/use-registration.ts` (su errore signUp e nel catch).

- **Vantaggio:** Nessun cambio di flusso, nessuna nuova dipendenza; solo messaggi utente migliori e coerenti.

### Fix B — Robusto (mappatura per codice + validazioni coerenti)

- **Mapping errori Supabase**
  - In `authErrorMessages.ts` (o simile):
    - Definire una mappa o una serie di `if` su `error.code` e/o su `error.message` (per compatibilità) per: credenziali invalide, email già registrata, email non confermata, password troppo corta/debole, rate limit, errore generico.
    - Esportare una sola funzione `getAuthErrorMessage(error, context?: 'login' | 'register')` per eventuali messaggi diversi tra login e register.

- **Login**
  - In `StandardLoginForm`:
    - Usare `validateLogin()` da `form-validation.ts` prima di `login()`; tenere uno stato `formErrors: Record<string, string>` e passare gli errori ai campi (se il form viene esteso con wrapper tipo `FormField` con prop `error`) e/o mostrare un blocco "Errore generale" sotto il form con `formErrors.general`.
    - Su errore da `login()`: impostare `formErrors.general = getAuthErrorMessage(result.error, 'login')` e/o mostrare toast con lo stesso messaggio (doppio canale: toast + inline).
  - In `form-validation.ts`: eventualmente aggiungere regole login (es. lunghezza minima password per login) se richiesto; altrimenti lasciare solo email + obbligatorietà password.

- **Registrazione**
  - Già valida con `validateRegistration` e inline; aggiungere solo:
    - Sostituire tutti i punti in cui si usa `standardResult.error?.message` o `error.message` con `getAuthErrorMessage(error, 'register')` in `use-registration.ts`.
  - Opzionale: mostrare anche un messaggio generale sotto il form (stato `generalError`) oltre al toast, per coerenza con il login.

- **Validazioni password/email**
  - Email: già validata con regex in `form-validation.ts` e in `StandardLoginForm`. Mantenere un solo formato (es. `^[^\s@]+@[^\s@]+\.[^\s@]+$`) in `form-validation.ts` e riusarlo ovunque.
  - Password (registrazione): già 8+ caratteri, almeno una maiuscola, una minuscola, un numero. Documentare in report/UI se si vogliono anche caratteri speciali.
  - Password (login): attualmente solo “obbligatoria”; nessun minimo lunghezza. Se si vuole coerenza con Supabase (min 6), si può aggiungere in `validateLogin()` il controllo `password.length >= 6` e messaggio "La password deve avere almeno 6 caratteri".

---

## 6. Matrix validazioni Password/Email

| Regola | Dove implementata oggi | Raccomandazione |
|--------|------------------------|------------------|
| Email obbligatoria | Login: StandardLoginForm (manuale). Register: `validateRegistration` | Centralizzare in `validateLogin` / `validateRegistration` e riusare. |
| Email formato valido | Login: `/\S+@\S+\.\S+/.test`. Register: `emailRegex` in `form-validation.ts` | Uniformare a un solo regex (es. in `form-validation.ts`) e usarlo in entrambi. |
| Password obbligatoria | Login: check su `cleanPassword`. Register: `validateRegistration` | Login: usare `validateLogin()` che già lo prevede. |
| Password lunghezza (registrazione) | `form-validation.ts`: `password.length < 8` | Mantenere; opzionale aggiungere “almeno un carattere speciale” se richiesto. |
| Password maiusc/min/numero (registrazione) | `form-validation.ts` | Mantenere. |
| Conferma password | `validateRegistration` | Già presente. |
| Messaggio “credenziali errate” | Solo in `LoginPage.getErrorMessage` (file non in uso) | Spostare in `getAuthErrorMessage()` e usare in `StandardLoginForm`. |
| Messaggio “email già registrata” | Solo in `LoginPage.getErrorMessage` | Idem, in `getAuthErrorMessage(..., 'register')` e in `use-registration`. |

**File e funzioni da toccare (solo come piano, non applicate):**

- `src/utils/form-validation.ts`: eventuale estensione `validateLogin` (es. min length password) e uso stesso regex email.
- `src/utils/authErrorMessages.ts` (nuovo): `getAuthErrorMessage(error, context?)`.
- `src/components/auth/StandardLoginForm.tsx`: chiamata `getAuthErrorMessage(result.error)` per toast; opzionale `validateLogin` + stato errori inline.
- `src/hooks/use-registration.ts`: sostituzione `standardResult.error?.message` e `error.message` con `getAuthErrorMessage(..., 'register')`.

---

## 7. Note iOS (safe-area, keyboard, z-index)

- **Safe-area:** Le pagine Login e Register usano `createPortal(..., document.body)` con padding `env(safe-area-inset-top/bottom/left/right)`; il Toaster è in `App.tsx` con `position="top-center"` e stili custom. Non risultano override che nascondono il toast; su dispositivo conviene verificare che il toast non vada sotto notch o barra di stato.
- **Keyboard:** Non c’è logica esplicita che sposta il toast quando la tastiera è aperta (es. `position="bottom-center"` quando la tastiera è visibile). Se in test il toast viene coperto, si può valutare di usare `position="bottom-center"` per gli errori auth o di aumentare l’offset in base a `visualViewport`.
- **Z-index:** Modali login/register sono in portal con `z-[100]`. Il Toaster Sonner usa la sua coda di toast; verificare che il layer toast sia sopra le modali (es. z-index del container Sonner > 100) se necessario.
- **WKWebView:** Toast e gesture (swipe to dismiss) in `sonner.tsx` sono compatibili con touch; non risultano branch specifici per Capacitor. Se si riscontrano problemi di focus o tap, si può valutare di dare al toast un `tabIndex` o di usare `aria-live` per screen reader.

---

## 8. Change plan (patch possibili — NON applicate)

1. **Creare `src/utils/authErrorMessages.ts`**
   - Funzione `getAuthErrorMessage(error: { message?: string; code?: string }, context?: 'login' | 'register'): string`.
   - Mapping per: Invalid login credentials, User already registered, Email not confirmed, Password too short / weak, rate limit, generico. Ritorno sempre stringa in italiano.

2. **Patch `StandardLoginForm.tsx`**
   - Importare `getAuthErrorMessage`.
   - Su `!result.success`: `toast.error('Errore di login', { description: getAuthErrorMessage(result.error, 'login') })`.
   - Nel catch: `toast.error('Errore di sistema', { description: getAuthErrorMessage(error, 'login') || 'Si è verificato un errore imprevisto' })`.
   - Opzionale: prima del submit chiamare `validateLogin({ email: cleanEmail, password: cleanPassword })` e mostrare errori inline; in caso di errore auth mostrare anche un testo sotto il form con `getAuthErrorMessage(result.error)`.

3. **Patch `use-registration.ts`**
   - Importare `getAuthErrorMessage`.
   - Dove si fa `toast.error("Errore", { description: standardResult.error?.message })` sostituire con `description: getAuthErrorMessage(standardResult.error, 'register')`.
   - Nel catch: `description: getAuthErrorMessage(error, 'register') || 'Si è verificato un errore. Riprova più tardi.'`.
   - Opzionale: stesso messaggio anche in uno stato “generalError” da mostrare sotto il form in `RegistrationForm`.

4. **Patch `form-validation.ts` (opzionale)**
   - Allineare regex email tra `validateLogin` e `validateRegistration` (stesso pattern).
   - In `validateLogin` aggiungere, se si vuole, controllo `password.length >= 6` con messaggio "La password deve avere almeno 6 caratteri".

5. **Verifica Toaster (solo test)**
   - Su dispositivo iOS con tastiera aperta su login/register: confermare che il toast sia visibile e leggibile; in caso contrario valutare posizione o offset in `sonner.tsx`.

---

## Check di chiusura

- **Dove introdurre toast/popup:** Toast sono già usati; le patch proposte riguardano solo il **testo** del toast (mapping errori). Opzionale: messaggio errore generale anche **sotto il form** (inline) in Login e Register.
- **Messaggi da mostrare:**
  - Credenziali errate → "Email o password non corretti" (o equivalente).
  - Utente inesistente / account non trovato → stesso messaggio di credenziali (Supabase non distingue), oppure "Account non trovato. Verifica email o registrati."
  - Email invalida → già gestita da validazione client: "Formato email non valido" / "L'email è obbligatoria".
  - Password non conforme (registrazione) → già inline da `validateRegistration`; in più, per errori Supabase: "La password deve avere almeno 6 caratteri" (o 8 se allineato a client).
  - Email già registrata → "Email già registrata. Prova ad accedere."
  - Email non verificata → "Email non verificata. Controlla la tua casella email."
- **Soluzione più in-scope:** Fix A (messaggi tradotti con `getAuthErrorMessage` in Login e Register, senza cambiare flusso né routing). Fix B se si vogliono validazioni login allineate a `form-validation` e messaggio generale anche inline.

— Fine report —
