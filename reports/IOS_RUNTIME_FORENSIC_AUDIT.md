# iOS Runtime Forensic Audit — Xcode Logs & Performance Diagnosis

**Data:** 2026-02-20  
**Ambiente:** App nativa iOS (Capacitor WKWebView), device reale  
**Modalità:** SOLO ANALISI — nessuna modifica codice, nessun fix  

---

## 1. Executive Summary

Questo report classifica le categorie di log tipicamente osservabili in Xcode quando si esegue l’app M1SSION™ (Capacitor + WKWebView), identifica origine e gravità, e valuta il possibile impatto sulle performance. L’analisi si basa su ispezione del codebase (client, Supabase, Capacitor, Stripe, PWA, geolocation, push) e su comportamenti noti di UIKit, WebKit e Supabase JS. **Non sono stati forniti log Xcode grezzi**: la classificazione è quindi basata su pattern noti e su dove il codice può generare o attivare tali messaggi. Con campioni di log reali, la classificazione può essere raffinata.

**Risultati principali:**
- **StrictMode:** Non attivo (ReactDOM.createRoot senza StrictMode). Niente doppio mount intenzionale.
- **Log in produzione:** Build stamp e alcuni `console.log` in `main.tsx` sono eseguiti a ogni load; in PROD `setupProductionLogging` / `setupProductionConsole` filtrano la maggior parte dei log (solo CRITICAL/SECURITY passano).
- **PWA Stabilizer:** Eseguito anche su iOS native (in `App.tsx`); su Capacitor il SW registration può fallire o essere ridondante — possibile fonte di log "PWA Stabilizer failed" o "SW registration failed".
- **Push:** Flusso con `initNativePush` + auto-register se permission già granted; possibile doppia registrazione se più entry point chiamano `requestPushPermission`/register.
- **Geolocation:** `watchPosition` attivo su mappa (useGeoWatcher, useGeolocation); timeout lunghi (25s) e log numerosi in useGeoWatcher aumentano il rumore in console.
- **Stripe:** Su iOS native i pagamenti Stripe sono bloccati; `assertStripeAllowedOnPlatform` e `isStripeAllowedOnPlatform` generano `console.error`/`console.log` in DEV (e in PROD gli error vengono comunque loggati).
- **LockManager Supabase:** Il client Supabase usa `navigator.locks` per il lock `sb-*-auth-token`; timeout 10s è interno alla libreria. Con realtime + auth refresh concorrenti è possibile vedere "timed out waiting 10000ms".

---

## 2. Classificazione log per categoria

### A) UIKit / AutoLayout

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | UIKit (native), possibilmente view nativa Capacitor (plugin Keyboard, Safe Area, status bar). |
| **Esempio** | "Unable to simultaneously satisfy constraints", constraint conflict su UIToolbar/accessory. |
| **Gravità** | WARNING. |
| **Impatto performance** | NESSUNO–BASSO (solo log; Auto Layout risolve comunque). |
| **Bug reale?** | Spesso no: constraint ambigui che il sistema risolve. Può essere rumore da barra accessorio tastiera (Capacitor Keyboard non usato esplicitamente; l’app usa `useKeyboardInset` / `visualViewport`). |
| **Comune in WKWebView?** | Sì, quando ci sono view ibride (WebView + barre native). |
| **Ignorabile in produzione?** | Sì, se l’UI non mostra glitch. |
| **Rallentamento rendering?** | No; il log è post-layout. |

---

### B) WKWebView / WebContent

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | WebKit (processo WebContent). |
| **Esempio** | Log generici WebContent, "reporter disconnected", messaggi di rete/JS. |
| **Gravità** | INFO / WARNING. |
| **Impatto performance** | NESSUNO (diagnostica). |
| **Bug reale?** | "Reporter disconnected" è tipicamente Web Inspector / debugging, non un bug app. |
| **Comune in WKWebView?** | Sì. |
| **Ignorabile in produzione?** | Sì. |
| **Rallentamento rendering?** | No. |

---

### C) CoreGraphics NaN

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | CoreGraphics (rendering layer) quando riceve NaN da layout/animazioni. |
| **Possibili cause lato app** | CSS `transform` con valore NaN/undefined; Framer Motion con variabile undefined; divisione per zero; width/height undefined in layout. |
| **Gravità** | WARNING – può indicare calcolo errato. |
| **Impatto performance** | MEDIO se ripetuto (layout/repaint inutili). In casi estremi frame drop. |
| **Bug reale?** | Sì, indica un valore numerico non valido passato al rendering. |
| **Comune in WKWebView?** | Possibile con animazioni JS/CSS complesse. |
| **Ignorabile in produzione?** | No; andrebbe individuata la vista/animazione che produce NaN. |
| **Rallentamento rendering?** | Può contribuire a micro-stutter se il compositor scarta frame. |

---

### D) Keyboard / RTIInputSystem

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | iOS RTI (input system), UIKit, eventualmente plugin Capacitor Keyboard. |
| **Esempio** | Log tastiera, accessory view, input. |
| **Gravità** | INFO / WARNING. |
| **Impatto performance** | NESSUNO. |
| **Bug reale?** | Di solito no (comportamento sistema). |
| **Comune in WKWebView?** | Sì. L’app usa `useKeyboardInset` (visualViewport) e non il plugin Capacitor Keyboard; i constraint "Unable to satisfy" possono venire dalla barra accessorio di sistema. |
| **Ignorabile in produzione?** | Sì. |
| **Rallentamento rendering?** | No. |

---

### E) Supabase LockManager

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | Supabase JS client (Web Locks API: `navigator.locks.request` su `sb-<ref>-auth-token`). |
| **Esempio** | "lock: sb-*-auth-token timed out waiting 10000ms". |
| **Gravità** | WARNING – indica contesa sul lock auth. |
| **Impatto performance** | MEDIO: il thread JS che attende il lock può bloccare quella richiesta; non blocca l’intero UI thread ma può ritardare auth/realtime. |
| **Bug reale?** | Possibile: doppie richieste concorrenti (es. refresh token + realtime), o molte subscription che leggono la sessione. |
| **StrictMode** | Non usato; non è la causa di doppio mount. Possibili cause: più tab/channel realtime aperti, auth.getSession() chiamato in parallelo da più hook. |
| **Comune in WKWebView?** | Sì, con Supabase. |
| **Ignorabile in produzione?** | No; se ricorrente va ridotta la concorrenza su auth (singleton session check, debounce). |
| **Rallentamento rendering?** | Solo se il blocco si propaga a callback che aggiornano lo stato UI; di solito no diretto su 60 FPS. |

---

### F) Service Worker / PWA

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | Browser API (SW), codice in `usePWAStabilizer`, `main.tsx`, `silentAutoUpdate`. |
| **Esempio** | "PWA Stabilizer: SW registration failed", "PWA Stabilizer: Initialization failed". |
| **Gravità** | WARNING. |
| **Impatto performance** | BASSO (inizializzazione; nessun retry loop infinito nel codice visto). |
| **Bug reale?** | Su iOS native (Capacitor) il Service Worker può non essere supportato o comportarsi in modo limitato; il fallimento è atteso in quel contesto. |
| **Codice PWA su iOS native** | `usePWAStabilizer` è chiamato in `App.tsx` senza guard `!isCapacitorNative`; quindi SW registration e push web vengono tentati anche in app nativa. Può generare log di fallimento e piccoli overhead. |
| **Comune in WKWebView?** | Sì. |
| **Ignorabile in produzione?** | Sì su native; su web/PWA no se si vogliono push. |
| **Rallentamento rendering?** | No. |

---

### G) Stripe disabled iOS

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | `src/lib/stripe/guard.ts`, `M1UPaymentContent.tsx`, `ApplePayBox.tsx`, `GooglePayBox.tsx`. |
| **Esempio** | "[STRIPE GUARD] ❌ BLOCKED: Stripe payment attempted on iOS native", "Blocked: Stripe payment on iOS native". |
| **Gravità** | ERROR (intenzionale, per compliance). |
| **Impatto performance** | NESSUNO. |
| **Bug reale?** | No; comportamento voluto (solo IAP su iOS). |
| **Log ripetuti** | Se l’utente apre spesso la schermata pagamenti, il log può essere ripetuto; overhead trascurabile. |
| **Comune in WKWebView?** | N/A (logica app). |
| **Ignorabile in produzione?** | Sì (messaggio atteso). |
| **Rallentamento rendering?** | No. |

---

### H) Push notifications

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | Capacitor Push Notifications, `src/lib/nativePush.ts`, `useNativePush`, `usePWAStabilizer` (web push). |
| **Esempio** | "Permission already granted — auto-registering", "register() called", "Token received", "Auto-register". |
| **Gravità** | INFO. |
| **Impatto performance** | NESSUNO. |
| **Doppia register** | `initNativePush` fa auto-register se permission già granted; `requestPushPermission` può essere chiamato da UI: due percorsi verso `PushNotifications.register()`. Se entrambi partono in sequenza rapida, si possono vedere due registrazioni in log (non necessariamente due token diversi). |
| **Comune in WKWebView?** | N/A (Capacitor native). |
| **Ignorabile in produzione?** | Sì. |
| **Rallentamento rendering?** | No. |

---

### I) Geolocation watchPosition

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | `useGeoWatcher.ts`, `useGeolocation.ts`, `geolocationSafe.ts` (Capacitor Geolocation su iOS native). |
| **Esempio** | "Starting geolocation watch", "CRITICAL INIT GEO", "PWA/iOS: Using direct geolocation approach", "Watch position". |
| **Gravità** | INFO. |
| **Impatto performance** | BASSO–MEDIO: watch attivo (polling GPS) consuma CPU/battery; non blocca il thread principale ma può ridurre fluidità se combinato con molto altro. |
| **Sempre attivo?** | Dipende dalla pagina: sulla mappa (MapTiler3D, BuzzMap, ecc.) il watch è attivo quando la geo è abilitata. |
| **Throttled?** | Opzioni con `maximumAge` (es. 60000 ms) riducono gli aggiornamenti; timeout 25000 ms. |
| **Comune in WKWebView?** | Sì. |
| **Ignorabile in produzione?** | Sì (log). Ridurre log verbosi in produzione per meno rumore. |
| **Rallentamento rendering?** | Possibile se callback aggiornano stato React molto spesso; con throttling adeguato impatto limitato. |

---

### J) Console log spam

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | `main.tsx` (build stamp, Sheets/Portals), `usePWAStabilizer`, `useGeoWatcher`, `nativePush`, Stripe guard, AuthProvider, subscription/battle/realtime hooks, ecc. |
| **Gravità** | INFO. |
| **Impatto performance** | BASSO in DEV; in RELEASE `setupProductionLogging` / `setupProductionConsole` sopprimono la maggior parte dei `console.log`. **Attenzione:** i messaggi all’inizio di `main.tsx` (build stamp, Sheets, Portals) vengono eseguiti prima degli override; se non sono wrappati in `import.meta.env.DEV`, appaiono anche in PROD. |
| **Bug reale?** | No; solo verbosità. |
| **Comune in WKWebView?** | Sì. |
| **Ignorabile in produzione?** | Sì; in PROD molti sono già filtrati. |
| **Rallentamento rendering?** | Scrivere in console ha un costo minimo ma non zero; in debug prolungato può sommarsi. |

---

### K) Edge cases critici

| Aspetto | Dettaglio |
|--------|-----------|
| **Origine** | Varie (WebKit, Supabase, rete, JS). |
| **Esempi** | WebP decode err=-50, "reporter disconnected", crash, OOM. |
| **WebP err=-50** | Tipicamente WebKit (decode immagine); può essere formato/corrotto o limite di sistema. Rumore frequente; impatto performance di solito BASSO. |
| **Reporter disconnected** | Web Inspector / debugging; non indica memory leak o JSBridge rotto di per sé. |
| **Comune in WKWebView?** | Sì. |
| **Ignorabile?** | WebP e reporter sì; crash/OOM no. |

---

## 3. Elementi innocui (rumore di sistema)

- **Unable to simultaneously satisfy constraints** (se l’UI è corretta): rumore Auto Layout.
- **Reporter disconnected**: Web Inspector.
- **Stripe BLOCKED** su iOS: messaggio intenzionale, compliance.
- **PWA Stabilizer failed** su Capacitor iOS: atteso se SW non è supportato/limitato.
- **WebP err=-50**: spesso rumore decode WebKit.
- **Log RTI/Keyboard**: comportamento sistema.
- **Molti log INFO** di geo, push, PWA: diagnostica, non errore.

---

## 4. Elementi da investigare

- **LockManager lock timeout (sb-*-auth-token)**: verificare quanti consumer leggono auth in parallelo (realtime channels, getSession, subscription); considerare centralizzazione/riduzione chiamate concorrenti.
- **CoreGraphics NaN**: individuare vista/animazione (Framer Motion, transform, width/height) che riceve undefined/NaN; aggiungere guard numerici dove necessario.
- **Constraint conflict** ricorrenti: se associati a una view specifica (es. toolbar tastiera), verificare con Symbolic Breakpoints su constraint.

---

## 5. Elementi potenzialmente critici

- **Supabase LockManager timeout 10000ms**: può bloccare temporaneamente la richiesta che tiene il lock; ridurre concorrenza su auth.
- **CoreGraphics NaN ripetuti**: possono degradare FPS; trovare e correggere la fonte.
- **Log eccessivi in RELEASE**: i primi log in `main.tsx` (build stamp, Sheets, Portals) potrebbero non passare dal filtro PROD; verificare ordine di esecuzione e wrappare in DEV se necessario.

---

## 6. Analisi performance

| Domanda | Risposta |
|--------|----------|
| **I log possono rallentare l’app?** | In DEBUG sì (costo di I/O console); in RELEASE la maggior parte è soppressa; alcuni log in `main.tsx` potrebbero restare. |
| **I timeout LockManager possono causare UI freeze?** | Non freeze completo; possono ritardare una singola operazione (auth/realtime). Se quella operazione è sul critical path del primo paint, l’utente può percepire lentezza. |
| **I NaN CoreGraphics possono causare rendering lento?** | Sì, se ripetuti (layout/repaint inutili, possibile frame drop). |
| **Il layout constraint spam può impattare animazioni?** | No diretto; il log è successivo alla risoluzione del layout. |
| **Il watchPosition continuo può ridurre fluidità?** | Può contribuire se i callback aggiornano stato React troppo spesso; con `maximumAge` e throttling l’impatto è limitato. |
| **I log Stripe ripetuti possono generare overhead?** | Trascurabile; sono pochi per azione. |

---

## 7. Probabili cause di rallentamento percepito

1. **Build DEBUG vs RELEASE:** in DEBUG logging, source maps e controlli React aggiungono overhead; misurare sempre in RELEASE/TestFlight.
2. **LockManager timeout:** ritardo su operazioni auth/realtime in scenari con molte subscription o refresh concorrenti.
3. **CoreGraphics NaN:** layout/animazioni con valori non validi che forzano lavoro extra del compositor.
4. **Geolocation watch:** callback frequenti che fanno setState su alberi grandi (es. mappa) senza throttling.
5. **Realtime subscription:** molti channel aperti (leaderboard, battle, profile, M1U, notifiche, ecc.) che generano messaggi e re-render.
6. **PWA/Service Worker:** tentativi di registrazione SW su iOS native inutili ma con piccolo costo a bootstrap.

---

## 8. Priorità di intervento

| Priorità | Elemento | Azione suggerita (solo analisi, nessun fix) |
|----------|----------|---------------------------------------------|
| **Alta** | LockManager timeout | Verificare numero di subscription realtime e chiamate auth concorrenti; documentare flussi. |
| **Alta** | CoreGraphics NaN | Identificare componente/animazione che produce NaN (strumenti Safari/Web Inspector, log condizionali). |
| **Media** | Log in main.tsx in PROD | Verificare se build stamp e log iniziali sono filtrati in produzione; documentare ordine di init. |
| **Media** | PWA Stabilizer su native | Verificare se è desiderabile saltare usePWAStabilizer quando `Capacitor.isNativePlatform()` è true. |
| **Bassa** | Constraint warnings | Solo se correlati a glitch UI visibili. |
| **Bassa** | Console verbosity geo/push | Riduzione log in produzione (già parzialmente gestita). |

---

## 9. Raccomandazioni (solo analisi)

- **StrictMode:** Non attivo; non è la causa di doppio mount o doppie subscription. Se si attivasse in futuro, tenere conto del doppio mount in DEV.
- **Build mode:** Confermare se il rallentamento è percepito in DEBUG o RELEASE; in RELEASE molti log sono già soppressi.
- **LockManager:** Tracciare dove si usa `getSession()` / `getUser()` e quante subscription realtime dipendono dalla sessione; valutare un singolo punto di lettura sessione e canali che si sottoscrivono dopo.
- **CoreGraphics NaN:** Cercare in componenti con `transform`, Framer Motion `animate`, e calcoli che usano `width`/`height` da ref (potrebbero essere 0/undefined al primo render).
- **PWA su native:** Valutare guard `isCapacitorNative()` prima di registrare SW e prima di `registerPush` web in `usePWAStabilizer`.
- **Push:** Verificare che `requestPushPermission` non venga chiamato più volte in rapida successione (es. da più componenti in mount).
- **Geolocation:** Confermare che `maximumAge` e eventuale throttling sui callback siano sufficienti per la mappa senza aggiornamenti eccessivi.

---

## 10. Conclusione tecnica

La maggior parte dei log osservabili in Xcode rientra in **rumore di sistema** (UIKit, WebKit, keyboard, Stripe bloccato, PWA/SW su native) o in **diagnostica intenzionale** (geo, push, auth). **Elementi da non ignorare** sono: **LockManager timeout** (concorrenza auth/realtime) e **CoreGraphics NaN** (calcolo layout/animazioni). Le performance percepite vanno verificate in **build RELEASE**; in DEBUG logging e strumentazione possono spiegare parte del rallentamento. Nessuna modifica al codice è stata applicata in questo audit; le raccomandazioni sono solo analitiche e di verifica.

---

*Fine report — Read-only audit, nessun fix applicato.*
