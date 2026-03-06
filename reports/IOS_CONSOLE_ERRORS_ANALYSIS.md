# Analisi errori console iOS (Xcode / Capacitor)

Riepilogo: quali sono **gravi** e come risolverli.

---

## Non gravi (puoi ignorare)

| Messaggio | Motivo |
|-----------|--------|
| `Reading from public effective user settings` | Log di sistema, innocuo. |
| `Could not create a sandbox extension for .../App.app` | Limitazione sandbox/Simulator; su dispositivo spesso assente. |
| `NSMapGet ... map table argument is NULL` | Interno WebKit/UIKit, non dipende dal tuo codice. |
| `WebContent Could not register system wide server: -25204` | Servizio di accessibilità, innocuo in dev. |
| `_AXAddToElementCache was called even though the element was in the cache` | Accessibilità, innocuo. |
| `Unable to hide query parameters from script (missing data)` | Interno WebKit, innocuo. |
| `WEBP reader initImage failed err=-50` | Una immagine WEBP non caricata/corrotta; controlla eventuali asset WEBP. |
| `Service "com.apple.CARenderServer" failed bootstrap` / `Failed to initialize application environment context` | Tipico del **Simulator** (rendering), non del dispositivo. |
| `xpc_user_sessions_get_foreground_uid() failed ... Operation not permitted` | Sandbox Simulator, innocuo. |
| `[SW-ANYHOST] Service Worker not supported` | In Capacitor il SW non è usato; **corretto**. |
| `[Stripe] BLOCKED on iOS native - Use Apple IAP` | Comportamento voluto (IAP su iOS). |
| `Ignoring Event: localhost` | Evento su capacitor://localhost, innocuo. |
| `nw_connection_copy_protocol_metadata... on unconnected nw_connection` | Timing di rete, di solito innocuo. |
| `Reporter disconnected` | Debugger Xcode, non bug dell’app. |
| `MADService Client XPC connection invalidated` | Servizio di sistema, innocuo. |
| `nw_read_request_report Receive failed ... Operation timed out` | Timeout di rete normale. |
| `RTIInputSystemClient ... perform input operation requires a valid sessionID` | Keyboard/emoji in transizione, tipico quando la tastiera si apre/chiude. |
| `The variant selector cell index number could not be found` | Tastiera/emoji, innocuo. |
| `Gesture: System gesture gate timed out` | Sistema gesture, innocuo. |
| `[PE] ❌ Exception: {}` | Eccezione vuota dal modulo PE (Pulse Energy); se ricorre spesso, controllare i log lato PE. |

---

## Gravi o da tenere d’occhio

### 1. **Navigator LockManager lock timeout (Supabase auth)** — GRAVE

**Messaggio:**  
`Acquiring an exclusive Navigator LockManager lock "lock:sb-vkjrqirvdvjbemsfzxof-auth-token" timed out waiting 10000ms`

**Effetto:**  
- `Failed to get DNA`  
- `[MicroMissions] DB check error`  
- `Error fetching profile`  
- `Error fetching XP status`  
- `[BattleDefense] Check pending error`  
- `UNHANDLED REJECTION`  

Su iOS (WKWebView/Capacitor) il client Supabase usa la Web Locks API per sincronizzare il token auth. Se più parti dell’app chiamano `getSession()`/auth in parallelo al launch, una richiesta tiene il lock e le altre vanno in timeout dopo 10 s.

**Cosa fare:**

1. **Aggiornare `@supabase/supabase-js`** all’ultima versione (hanno introdotto migliorie sui lock/timeout).
2. **Ridurre le chiamate auth in parallelo al avvio:**  
   Usare **solo** `useAuth()` / contesto auth dove possibile, invece di chiamare direttamente `supabase.auth.getSession()` o `getUser()` in molti componenti in mount. L’AuthProvider è l’unico che dovrebbe fare la prima `getSession()`; gli altri leggono sessione/user dal contesto.
3. **Verificare reti lente:**  
   Su rete lenta la prima `getSession()` può durare a lungo e tenere il lock; in quel caso gli altri timeout sono conseguenza. Controllare che il token sia valido e che non ci siano troppi refresh in parallelo.

Non esiste in Supabase JS un’opzione ufficiale per disattivare i lock; la mitigazione è evitare concorrenza su auth al bootstrap.

---

### 2. **UIScene lifecycle will soon be required** — DA FARE IN SEGUITO

**Messaggio:**  
`UIScene lifecycle will soon be required. Failure to adopt will result in an assert in the future.`

**Significato:**  
Apple richiederà l’uso del lifecycle basato su **UIScene** (SceneDelegate) invece del solo AppDelegate. Oggi è un avviso; in futuro può diventare un assert (crash).

**Cosa fare:**  
Adottare UIScene nel progetto iOS:

1. Aggiungere in **Info.plist** la chiave **UIApplicationSceneManifest** e la configurazione della scena (e.g. Default Configuration con SceneDelegate).
2. Creare **SceneDelegate.swift** che gestisca la finestra (come fa ora l’AppDelegate) e spostare lì la creazione della window se necessario.
3. In **AppDelegate** rimuovere la proprietà `window` e lasciare a SceneDelegate la gestione della scena.

È un refactor nativo iOS; va fatto quando puoi, per evitare problemi con le prossime versioni di iOS.

---

### 3. **PWA Stabilizer: Initialization failed** — RISOLTO IN CODICE

**Messaggio:**  
`❌ PWA Stabilizer: Initialization failed: {}`

**Motivo:**  
Su Capacitor (iOS/Android) non c’è Service Worker; la logica PWA (cleanup, registrazione SW, push via SW) fallisce e veniva loggata come errore.

**Fix applicato:**  
- In **`usePWAStabilizer`**:
  - Se `Capacitor.isNativePlatform()` è true, l’inizializzazione PWA **non viene eseguita** (nessun cleanup, nessuna registrazione SW).
  - In caso di fallimento (es. ambiente senza SW), il log è stato cambiato da `console.error` a `console.warn` (non più “❌ … Initialization failed” come errore).

Così in console non compare più quell’errore su native.

---

### 4. **Unable to simultaneously satisfy constraints (_UIToolbarContentView width == 0 / height == 0)** — OPZIONALE

**Messaggio:**  
`Unable to simultaneously satisfy constraints` con `_UIToolbarContentView:0x... .width == 0` e `.height == 0`, e recupero con “Will attempt to recover by breaking constraint”.

**Motivo:**  
La **toolbar della tastiera iOS** (barra accessoria sopra la tastiera) viene nascosta/ridotta dalla tua app (es. “Keyboard accessory bar hidden” in AppDelegate). Il sistema crea comunque una vista con vincoli che finiscono in conflitto (larghezza/altezza 0).

**Effetto:**  
Solo warning di Auto Layout; l’app di solito continua a funzionare. Possibili micro-glitch visivi sulla tastiera.

**Cosa fare (opzionale):**  
- Se vuoi eliminare il warning: in **AppDelegate** (Swift) rivedere come viene nascosta la barra accessoria (es. evitare di forzare una vista con frame zero, o usare un’altra API per nascondere la toolbar).  
- In alternativa si può lasciare così e ignorare il messaggio.

---

## Riepilogo azioni

| Priorità | Azione |
|----------|--------|
| Alta     | Mitigare lock Supabase: aggiornare supabase-js, usare solo useAuth() al bootstrap, evitare getSession() parallele. |
| Media    | Pianificare adozione UIScene (Info.plist + SceneDelegate) per evitare futuri assert. |
| Fatto    | PWA Stabilizer: skip su Capacitor + log non in errore (fix in `usePWAStabilizer.ts`). |
| Bassa    | Constraint della toolbar tastiera: opzionale, solo se vuoi pulire i warning di layout. |

---

*Report generato in base ai log console iOS (Capacitor/WKWebView) – 2026-03-03.*
