# Welcome Bonus (500 → 150 M1U) + Modale + i18n — Audit read-only

**Data:** 2026-02-20  
**Ambiente:** App nativa iOS (Capacitor WKWebView).  
**Modalità:** SOLO LETTURA — nessuna modifica a codice, routing, layout, i18n, stato o Supabase.

---

## 1. Origine valore 500 M1U

| Dove | File | Riga | Modalità |
|------|------|------|----------|
| **Client** | `src/hooks/useWelcomeBonus.ts` | 19 | `const WELCOME_BONUS_AMOUNT = 500;` — costante locale hardcoded |
| **Server** | `supabase/functions/claim-welcome-bonus/index.ts` | 13 | `const WELCOME_BONUS_AMOUNT = 500;` — costante locale hardcoded |

- **Né env né feature flag:** il valore non viene da variabili d’ambiente né da config Supabase.
- **Né da user metadata:** l’importo non è letto da `profiles` o da altri metadati utente.
- **Uso:** Nel client la costante alimenta lo stato del hook (`amount`), il testo nel modal e la chiamata all’Edge Function. L’Edge Function usa la propria costante per `admin_credit_m1u` (`p_amount: WELCOME_BONUS_AMOUNT`) e per la risposta (`amount`, `newBalance`).
- **DB:** La colonna `profiles.welcome_bonus_claimed` (migration `20251219_welcome_bonus.sql`) traccia solo se il bonus è stato riscosso (boolean); l’importo 500 non è memorizzato in DB.
- **Impatto se cambiato a 150:** occorre aggiornare **entrambi** i punti (hook client + Edge Function); altrimenti UI e accredito reale divergono.

---

## 2. Logica reale di assegnazione bonus

- **Quando:** Dopo login/registrazione, se `profiles.welcome_bonus_claimed !== true` e il flag locale `m1ssion_welcome_bonus_shown:{userId}` non è `'shown'` o `'claimed'`.
- **Dove:** `WelcomeBonusManager` (in `App.tsx`, dentro `InterestSignalsProvider`) quando `needsBonus === true` renderizza `WelcomeBonusModal`. L’utente vede il modal e clicca “BUONA CACCIA” → `claimBonus()` → `supabase.functions.invoke('claim-welcome-bonus')` (senza body; l’utente è identificato dal JWT).
- **Backend:** L’Edge Function `claim-welcome-bonus` verifica JWT, legge `profiles.welcome_bonus_claimed` e `m1_units`, se non già claimed chiama `admin_credit_m1u` con `p_amount: 500` e `p_reason: 'welcome_bonus'`, poi aggiorna `profiles.welcome_bonus_claimed = true`.
- **Conclusione:** L’assegnazione è business logic (DB + RPC); la UI mostra solo l’importo e avvia il claim. Per passare a 150 M1U servono due modifiche (client + Edge Function); non basta solo UI.

---

## 3. Perché è “inline” e non modale

- **In realtà è già una modale (overlay fullscreen):**  
  `WelcomeBonusModal` renderizza un `<motion.div className="fixed inset-0 z-[99999] ...">` con sfondo scuro e blur — quindi è un overlay a schermo intero, non un blocco di testo nel flusso della pagina.
- **“Inline” nel senso della struttura React:**  
  Il modal **non** usa `createPortal(..., document.body)`. È un figlio del tree React: `App` → `InterestSignalsProvider` → `WelcomeBonusManager` → (se `needsBonus`) `WelcomeBonusModal`. Quindi il nodo DOM del modal sta **dentro** `#root`, come sibling di `WouterRoutes`, `Toaster`, ecc. In questo senso è “inline” nell’albero, non portaled su `body`.
- **Perché è strutturato così:**  
  Il componente è stato implementato come overlay fisso (z-99999) dentro l’app, senza portal. Non c’è un requisito architetturale che imponga il portal; è una scelta implementativa.
- **Condizionamenti:**  
  - Stato: `needsBonus` (da hook + DB + localStorage).  
  - First-login: sì, legato a “primo bonus non ancora riscosso”.  
  - Persistenza: `localStorage` (`m1ssion_welcome_bonus_shown:{userId}`) e `profiles.welcome_bonus_claimed`.  
  - Nessun uso di portal; nessuna dipendenza da altri modali per la visibilità.
- **Se si “convertisse” in modale portaled:**  
  Si intende quindi: rendere il modal un overlay portaled su `body` (come il Toaster). Cosa servirebbe:
  - **a)** Wrapping in `createPortal(<WelcomeBonusModal />, document.body)` (o equivalente) — unico cambiamento strutturale necessario per il rendering.
  - **b)** La gestione stato (needsBonus, claim, dismiss) resta nel hook/manager; non cambia.
  - **c)** Dismissal: già gestita (chiude con animazione, setta localStorage e stato).
  - **d)** First-login flag: già usato dal hook; invariato.
  - **e)** z-index: già 99999; con portal su body si evitano conflitti di stacking con #root.
  - **f)** Safe-area iOS: il modal è `fixed inset-0` con padding; eventuali safe-area vanno verificate su device.
  - **g)** Stacking: con portal su body il modal sarebbe sibling di Login overlay e Toaster; z-99999 resta adeguato.

---

## 4. Impatto tecnico conversione a modale (portaled)

- **Layout:** Nessun impatto sul layout delle pagine; il contenuto è già fuori dal flusso (fixed overlay).
- **Scroll:** Nessun impatto; il modal copre la viewport e non è in uno scroll container.
- **Animazioni:** Framer Motion (AnimatePresence, motion.div) continua a funzionare anche con portal; nessun cambiamento logico.
- **Onboarding:** Il flusso “dopo login → eventuale DNA → Welcome Bonus” è gestito da stato e ordine di mount; il portal non lo altera.
- **UX:** Stessa UX: overlay fullscreen, CTA “BUONA CACCIA”, animazione slot e chiusura.
- **Stacking:**  
  - Con portal su `body`: stesso livello di Login overlay e Toaster; z-99999 garantisce visibilità sopra gli altri layer.  
  - Bottom nav / Header: già sotto z-99999; nessun cambiamento atteso.  
  - Altri modali: stesso contesto di stacking; comportamento coerente.  
  - Toaster: già portaled; nessun conflitto.
- **Rischio regressioni:** Basso, purché il portal venga applicato solo al wrapper del modal e lo stato/gestione eventi restino invariati.
- **Complessità:** Bassa (stesso pattern usato per Toaster e Login).
- **Modifica architetturale:** Solo punto di mount (portal su body); nessun cambio di flusso dati o di business logic.

---

## 5. Complessità stimata

| Intervento | Difficoltà | Note |
|------------|------------|------|
| Cambio 500 → 150 M1U | **BASSA** | Due costanti (hook + Edge Function); ridareploy della function. |
| Passaggio a modale portaled (createPortal su body) | **BASSA** | Un wrapper in `WelcomeBonusManager` o nel modal; nessun refactor di logica. |
| Introduzione i18n nel Welcome Bonus | **MEDIA** | Aggiungere chiavi in en/it/fr e sostituire le stringhe hardcoded nel modal; verificare su iOS. |
| Cambio copy + importo (es. “150 M1U” + nuovi testi) | **BASSA** | Se i18n è già presente; altrimenti media come sopra. |

---

## 6. Stato reale i18n

- **Libreria:** `i18next` + `react-i18next` (inizializzazione in `src/i18n/i18n.ts`).
- **Inizializzazione:** `initI18n()` usa `getDefaultLocale()` che:
  - con `m1_locale_mode === 'manual'` usa `localStorage.getItem('m1_locale')`;
  - con `'auto'` (default) usa `getDeviceLocale()` → `navigator.languages[0]` o `navigator.language` o `navigator.userLanguage`, normalizzato a `en` | `it` | `fr`.
- **Lingua iOS:** Su iOS WKWebView, `navigator.language` / `navigator.languages` riflettono in genere la lingua di sistema. Quindi con dispositivo in inglese l’app può essere inizializzata in EN.
- **Welcome Bonus e i18n:**  
  `WelcomeBonusModal` **non** usa `useTranslation` né `t()`. Tutte le stringhe sono **hardcoded in italiano** nel JSX, ad esempio:
  - "BENVENUTO IN M1SSION™"
  - "Ciao ... La caccia al tesoro globale ti aspetta."
  - "BONUS DI BENVENUTO"
  - "Come regalo di benvenuto riceverai"
  - "per esplorare il gioco e iniziare la tua missione"
  - "BUONA CACCIA"
  - "ATTIVAZIONE..."
  - "ACCREDITO IN CORSO..."
  - "BONUS ATTIVATO!"
  - "Buona caccia, Agente!"
  - Fallback nome: `user?.user_metadata?.full_name || 'Agente'`
- **File di traduzione:** In `src/locales/{en,it,fr}/common.json` **non** esistono chiavi dedicate al welcome bonus (né "welcome_bonus_title", né "welcome_bonus_amount", né frasi equivalenti). Esistono solo chiavi generiche (es. "welcome_back_episode", "tutorial_home_subtitle", "shop_bonus_badge", ecc.).
- **Conclusione:** Il sistema i18n è attivo e usa la lingua del device (o override manuale); il Welcome Bonus non ne fa uso ed è interamente in italiano fisso.

---

## 7. Perché non rispetta lingua iOS

- **Causa diretta:** Il componente Welcome Bonus **non usa affatto i18n**: nessuna chiamata a `t('...')`, nessuna chiave in `common.json`. Quindi la lingua dell’app (anche se EN per dispositivo iOS in inglese) non influenza questo modal.
- **Classificazione:**
  - **a) Testo hardcoded:** Sì — tutte le stringhe del modal sono literal in italiano nel sorgente.
  - **b) Lingua forzata:** No — non c’è un force su IT per questo componente; è semplicemente fuori dal sistema i18n.
  - **c) Detection disattivata:** No — la detection (getDeviceLocale) è attiva per il resto dell’app.
  - **d) Fallback non funzionante:** Non applicabile — non c’è fallback perché non c’è traduzione.

Per rispettare la lingua iOS (e le impostazioni lingua app) sarebbe sufficiente introdurre chiavi i18n per i testi del welcome bonus e usare `t()` (o hook equivalente) nel modal, senza cambiare logica o stato.

---

## 8. Rischi se modificato

- **Solo cambio 500 → 150 (client + Edge Function):**  
  Rischio basso. Utenti che hanno già riscosso continuano con `welcome_bonus_claimed = true`; i nuovi vedono e ricevono 150 M1U. Coerenza da mantenere tra client e function.
- **Solo portal del modal (nessun cambio copy/importo):**  
  Rischio basso. Comportamento e stato invariati; solo posizione nel DOM. Da verificare su iOS: safe-area e eventuali focus/touch.
- **Solo introduzione i18n (senza cambio 500/150):**  
  Rischio medio-basso. Possibili chiavi mancanti o typo; va verificato che in tutti i contesti (welcome / crediting / complete) le chiavi esistano in en/it/fr.
- **Modifica combinata (150 + modale portaled + i18n):**  
  Rischi come sopra; regressioni possibili su dispositivi con lingua o viewport particolari. Test su device iOS reale consigliato.

Nessuna modifica a AuthProvider, routing, layout generale o business logic Supabase è stata considerata in questo audit.

---

## 9. Raccomandazione tecnica (solo analisi, no fix)

- **Origine 500 M1U:** Costante in due punti (hook client + Edge Function). Per un cambio a 150 M1U andrebbero aggiornati entrambi e ridistribuita l’Edge Function.
- **Modale vs “inline”:** Il bonus è già mostrato come modale (overlay fullscreen); è “inline” solo nel senso che è montato dentro `#root`. Portarlo su `body` con createPortal è una modifica strutturale minima a basso rischio e allineata al pattern Toaster/Login.
- **i18n:** Il sistema i18n è operativo e rispetta la lingua device/override; il Welcome Bonus ne è escluso perché tutte le stringhe sono hardcoded in italiano. Per allineare il modal alla lingua iOS (e alle impostazioni app) serve aggiungere chiavi in en/it/fr e usare `t()` nel componente, senza toccare logica di claim o stato.
- **Impatto complessivo:** Nessun cambiamento è strettamente necessario per “convertire in modale” (è già un overlay). Portal e i18n sono migliorie di coerenza architetturale e UX; il cambio 500 → 150 è di prodotto/configurazione e richiede solo aggiornamento delle due costanti e deploy della function.

— Fine audit (read-only, nessuna patch applicata) —
