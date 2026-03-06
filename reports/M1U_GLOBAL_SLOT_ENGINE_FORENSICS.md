# M1U Global Slot Engine — Analisi forense duplicazione pill + M1U dopo IAP

**Data:** 2026-03-05  
**Scope:** SOLO lettura, nessuna patch, nessuna modifica al codice.  
**Vincoli:** NO IAP/StoreKit/receipt/accredito, NO BUZZ/login/push/subscriptions. Solo analisi e raccomandazione.

---

## 1. Inventario componenti coinvolti

### 1.1 Dove viene montato il pill “originale” (Home)

| Posizione | File | Contesto | Stile |
|-----------|------|----------|--------|
| **Home (pagina principale)** | `src/pages/AppHome.tsx` (righe 496–511) | Div con `id="m1u-pill-home-slot"`, `className="fixed left-4 z-[1001]"` | `position: fixed`, `top: calc(env(safe-area-inset-top) + 80px)`, `left: 1rem` (left-4), `z-index: 1001`. Opacità/visibility legate a `walletPillVisible`. |

- Un solo **M1UPill** è montato in Home, dentro questo contenitore fixed.
- È il pill che l’utente considera “originale” quando è sulla Home.

### 1.2 Dove viene montato il pill “globale” (overlay)

| Posizione | File | Contesto | Stile |
|-----------|------|----------|--------|
| **Global M1U Credit Overlay** | `src/features/m1u/GlobalM1UCreditOverlay.tsx` (righe 62–78) | Render condizionale: `{visible && ( <motion.div> <M1UPill /> </motion.div> )}` | `position: fixed`, `top: calc(env(safe-area-inset-top) + 80px)`, `left: max(16px, env(safe-area-inset-left))`, `zIndex: 99999`, `pointerEvents: 'none'`. |

- **GlobalM1UCreditOverlay** è montato in `src/App.tsx` (righe 262–263), **dentro** `AuthProvider`, come fratello di `InterestSignalsProvider` e del resto dell’app.
- Quando `visible === true` (dopo un `m1u-credit-event`), l’overlay monta un **secondo** `M1UPill` in un `motion.div` fixed.

### 1.3 Altri punti dove può esserci un M1UPill (per completezza)

- **BuzzPage** (`src/pages/BuzzPage.tsx`): M1UPill in overlay fixed (solo su route `/buzz`).
- **IntelligencePage** (`src/pages/IntelligencePage.tsx`): M1UPill in overlay fixed (solo su route intelligence).
- **MapTiler3D** (sandbox): M1UPill.
- **UnifiedHeader**: importa `M1UPill` ma **non** lo renderizza nel JSX (solo import presente).

Quindi, in ogni momento, **al massimo una pagina** ha un pill “di pagina” (es. Home), e **in più** il motore globale può mostrare un pill overlay quando c’è un credito.

### 1.4 Risposte sintetiche

| Domanda | Risposta |
|--------|----------|
| 1) Dove viene montato il pill originale della Home? | In `AppHome.tsx`, in un div fixed `#m1u-pill-home-slot` (top ~80px, left 16px, z-index 1001). |
| 2) Dove viene montato il pill globale dell’overlay? | In `GlobalM1UCreditOverlay.tsx`, dentro un `motion.div` fixed (stessa top ~80px, left 16px, z-index 99999), montato quando `visible === true`. |
| 3) Sono due istanze separate dello stesso componente? | **Sì.** Sono due istanze distinte di `M1UPill` (due mount, due set di hook/state). |
| 4) Una overlay fixed e l’altra inline/home? | **Sì.** Entrambe sono **fixed**; quella “originale” è nel layout della Home (z 1001), quella “globale” è nell’overlay (z 99999) e sta sopra. |
| 5) Quale delle due riceve `m1u-credited`? | **Entrambe.** Ogni `M1UPill` registra un listener globale su `window` per `m1u-credited` (M1UPill.tsx, righe 350–352). |
| 6) Quale delle due riceve `m1u-balance-changed`? | **Entrambe.** Ogni `M1UPill` ascolta anche `m1u-balance-changed` (righe 252, 253). |

---

## 2. Call graph eventi (flusso post-IAP)

### A) Da M1UShopContent

1. Pagamento IAP va a buon fine → viene chiamato `handlePaymentSuccess()` (righe 111–120).
2. `setShowPaymentModal(false)` → modale pagamento si chiude.
3. `emitM1UCreditEvent(amount, 'shop')` con `amount = selectedPack.m1u_total`.
4. `setTimeout(() => onClose(), SHOP_CLOSE_AFTER_CREDIT_MS)` (400 ms) → dopo 400 ms viene chiamato `onClose()` e si chiude il modale dello **shop M1U** (ritorno alla pagina sottostante, spesso Home).

Nessun redirect esplicito: la chiusura del modale lascia visibile la pagina che era sotto (es. Home con il suo pill).

### B) Da m1uCreditEvent.ts

- **emitM1UCreditEvent(amount, source):**
  - Scrive in `window.__m1u_pending_credit__` un payload `{ amount, source, id, issuedAt }` con `id = 'credit-' + Date.now() + '-' + random`.
  - Dispatcha un `CustomEvent(M1U_CREDIT_EVENT, { detail: payload })` dove `M1U_CREDIT_EVENT = 'm1u-credit-event'`.
- I dati nel payload sono: `amount` (numero), `source` (es. `'shop'`), `id` (stringa univoca), `issuedAt` (timestamp).

### C) Da GlobalM1UCreditOverlay.tsx

- **Ascolto:** `window.addEventListener(M1U_CREDIT_EVENT, handleCreditEvent)` (riga 52).
- **All’arrivo di `m1u-credit-event`:**
  - Controlla `detail?.amount`, dedupe per `detail.id`, ignora se `animatingRef.current === true`.
  - Imposta `setVisible(true)` e `setAmount(detail.amount)` → al render successivo viene montato il `motion.div` con **M1UPill** (seconda istanza).
  - Schedula due timeout:
    - **120 ms:** dispatch di `m1u-credited` e `m1u-balance-changed` (righe 37–41).
    - **2800 ms:** `setVisible(false)`, reset amount/ref → l’overlay si smonta e il secondo pill scompare.
- Quindi: **l’overlay non “pilotava” il pill esistente**, ma **monta un secondo M1UPill** e poi, dopo 120 ms, emette gli eventi che **entrambe** le pill ascoltano.

### D) Da M1UPill.tsx

- **Ascolto:** ogni istanza di M1UPill registra:
  - `m1u-credited` → `handleM1UCredited` (righe 350–352);
  - `m1u-balance-changed` → `handleRefreshBalanceChanged` (righe 252, 253) (refetch + eventuale log).
- **Pending credit:** gli effect di sync (righe 356–370, 374–396) leggono `readPendingCredit(win)` e, se c’è un pending valido, mostrano il saldo “PRE” (balance − amount) per allineare l’animazione PRE→POST.
- **Reazione a `m1u-credited`:** una sola istanza “vince” il lock globale `window.__m1u_pill_credit_lock__`; quella istanza esegue l’animazione PRE→POST (setDisplayedBalance, animateBalance); le altre istanze che ricevono lo stesso evento escono per lock già preso.
- **Reazione a `m1u-balance-changed`:** refetch con throttle (nessuna animazione diretta).

Risultato: **due pill visibili** (Home + overlay). **Una sola** delle due anima (quella che prende il lock), ma **entrambe** restano in schermata: l’utente vede il pill della Home e, sopra, il pill dell’overlay (stessa area, z-index 99999), percepito come “duplicato”.

---

## 3. Timeline completa post-IAP

| T | Evento |
|---|--------|
| T0 | Utente completa IAP nello shop M1U. |
| T0 | `handlePaymentSuccess()` → `emitM1UCreditEvent(amount, 'shop')`. |
| T0 | `window.__m1u_pending_credit__` impostato; dispatch `m1u-credit-event`. |
| T0 | `GlobalM1UCreditOverlay` riceve l’evento → `setVisible(true)` → al prossimo render monta il secondo **M1UPill** (overlay). |
| T0 | Modale pagamento si chiude; dopo 400 ms viene chiamato `onClose()` → chiusura modale shop → torna la vista sottostante (es. Home). |
| T0 + 1 frame | Su Home: visibile il pill “originale” (AppHome) + pill overlay (GlobalM1UCreditOverlay) — **due pill in zona simile, overlay sopra (z 99999)**. |
| T0 + 120 ms | Overlay esegue il timeout → dispatch `m1u-credited` e `m1u-balance-changed`. |
| T0 + 120 ms | **Entrambe** le istanze di M1UPill ricevono `m1u-credited`; una prende il lock e anima (PRE→POST); l’altra no. |
| T0 + 400 ms | Modale shop chiusa; utente vede chiaramente la Home con due pill. |
| T0 + 2800 ms | Overlay esegue il secondo timeout → `setVisible(false)` → il secondo M1UPill viene smontato; resta solo il pill della Home. |

La duplicazione visiva è quindi **intenzionale dal punto di vista implementativo** (due componenti M1UPill montati) e **non** un bug di doppio render della stessa istanza.

---

## 4. Root cause della duplicazione visiva

### 4.1 Il pill originale della Home resta visibile mentre l’overlay monta un secondo M1UPill?

**Sì.** Il pill della Home è in un div fixed sempre montato (con opacità legata a `walletPillVisible`). L’overlay, quando `visible === true`, monta un **secondo** M1UPill in un altro div fixed, con z-index maggiore. Nessun meccanismo nasconde o sospende il pill della pagina quando l’overlay è attivo.

### 4.2 Il sistema globale sta creando una seconda istanza UI invece di “pilotare” quella già presente?

**Sì.** Il motore globale non conosce l’esistenza del pill della Home (o di altre pagine). Il suo comportamento è: “su ogni credito, mostra **un** pill in overlay” montando un nuovo `M1UPill`. Non c’è alcun canale (context, ref, evento “anima il pill esistente”) per far animare il pill già presente nella pagina.

### 4.3 Il problema è architetturale, temporale, di doppio render o di mancata “single visual authority”?

- **Architetturale (overlay separato):** sì — l’overlay è un secondo layer che **aggiunge** un pill invece di riusare quello della pagina.
- **Temporale:** sì — la chiusura del modale (400 ms) e la visibilità dell’overlay (fino a 2800 ms) fanno sì che per ~2.8 s l’utente veda due pill (pagina + overlay).
- **Doppio render intenzionale:** sì — sono due istanze distinte di M1UPill volute dal design attuale.
- **Mancata “single visual authority”:** sì — non esiste un’unica autorità visiva per “il” pill M1U; la Home (e altre pagine) hanno il loro pill e il motore globale ne aggiunge un altro.

### 4.4 La duplicazione è limitata all’IAP o succede anche con wheel / mission / reward / referral?

**Non è limitata all’IAP.** Ogni sorgente che chiama `emitM1UCreditEvent` (shop, wheel, mission, referral, welcome, streak, clue_milestone, micro_mission, cashback, weekly_challenge, lottery, scratch, ecc.) fa sì che l’overlay mostri il secondo pill. Se in quel momento la pagina di sotto ha già un pill (es. Home, Buzz, Intelligence, Map), l’utente vedrà **due pill** fino a quando l’overlay non si nasconde (2800 ms). Quindi la duplicazione si verifica per **qualsiasi** credito M1U quando la pagina corrente espone già un M1UPill.

### 4.5 Esiste un posto “single source of truth” dove si potrebbe far animare il pill esistente senza montarne un altro?

- **Pill “di pagina”:** ogni route/pagina monta il proprio M1UPill (Home, Buzz, Intelligence, Map, …) in punti diversi dell’albero. Non c’è un **unico** pill globale persistente sempre nello stesso nodo dell’app.
- **Header:** `UnifiedHeader` importa M1UPill ma **non** lo renderizza; quindi oggi non c’è un pill unico in header usabile come unica autorità visiva.
- In altre parole: **non** esiste oggi un singolo punto “single source of truth” per il pill; esistono più pill per pagina/contesto. Per avere una “single visual authority” andrebbe **scelta** una strategia (es. un solo pill in header/layout globale, o un context che espone un ref/callback “anima il pill corrente”) e adattato il motore globale a quella scelta.

---

## 5. Valutazione architetturale

**L’attuale “M1U Global Slot Engine” è:**

- **C) Parzialmente corretto ma da reimpostare con strategia “single-pill animation authority”.**

**Motivazione:**

- **A) “Corretto ma con un bug di visibilità”** non regge: il comportamento è coerente con il codice (due pill montati di proposito); non è un bug di visibilità isolato, ma scelta architetturale che produce duplicazione.
- **B) “Concettualmente sbagliato perché duplica la UI”** è vero sul piano dell’effetto (duplicazione), ma il motore ha una logica chiara (evento → overlay con pill → eventi per animazione); il problema è che **non** riusa il pill già presente.
- **C)** Il motore centralizza correttamente **quando** mostrare l’animazione (evento unico `m1u-credit-event`) e **come** notificare le pill (`m1u-credited` / `m1u-balance-changed`), ma **dove** mostrarla è sbagliato: invece di “mostra un secondo pill in overlay”, l’obiettivo utente è “mostra **il** pill (quello che già vedo) con animazione slot”, cioè **una sola autorità visiva**. Quindi l’architettura va reimpostata verso una “single-pill animation authority” (un solo pill che anima, ovunque sia montato), senza aggiungere un secondo pill fisso in overlay.

---

## 6. Strategie safe possibili (solo descrizione, nessuna patch)

### Strategia A — Overlay globale separato + nascondere/sospendere il pill di pagina

- **Descrizione:** Si mantiene l’overlay che monta un secondo M1UPill, ma quando l’overlay è attivo si nasconde o si “sospende” visivamente il pill già presente nella pagina (es. opacity 0 o `visibility: hidden` per il contenitore del pill in AppHome / Buzz / ecc.).
- **Pro:** Intervento prevalentemente lato layout/CSS o stato “overlay attivo”; il motore eventi resta com’è; l’utente vede un solo pill (quello dell’overlay).
- **Contro:** Due istanze M1UPill comunque montate; logica “quale pill nascondere” deve conoscere tutte le pagine che mostrano un pill; possibile flicker se show/hide non sono perfettamente sincronizzati.
- **Rischio regressioni:** Medio (stati di visibilità, z-index, possibili edge case su route change mentre l’overlay è attivo).
- **Compatibilità paletti:** OK; non si tocca IAP/accredito/BUZZ/login/push/subscriptions.

### Strategia B — Eliminare l’overlay visivo; usare il pill già montato come “single visual authority”

- **Descrizione:** Si rimuove il secondo M1UPill dall’overlay. Il motore globale, su `m1u-credit-event`, **non** monta più un pill; si limita a impostare `window.__m1u_pending_credit__` e a dispatchare (con eventuale delay) `m1u-credited` e `m1u-balance-changed`. L’unico pill visibile è quello già presente nella pagina (Home, Buzz, ecc.); è **quello** che riceve gli eventi e anima (con la logica di lock già presente).
- **Pro:** Una sola istanza pill visibile; niente duplicazione; comportamento vicino a “un solo pill che anima ovunque tu sia”.
- **Contro:** Se l’utente è in una pagina/route **senza** pill (es. modale shop, o una view che non monta M1UPill), non vede nessuna animazione. Bisogna decidere se è accettabile (es. dopo IAP la modale si chiude e si torna a una pagina con pill) o se serve un fallback (es. toast o mini-pill temporaneo solo quando non c’è nessun pill in pagina).
- **Rischio regressioni:** Medio-basso; si tocca solo GlobalM1UCreditOverlay (e eventuale fallback); non si tocca IAP.
- **Compatibilità paletti:** OK.

### Strategia C — Un solo pill globale persistente nello stesso punto dell’app

- **Descrizione:** Si introduce un **unico** M1UPill montato a livello app (es. in layout/header globale, sempre nello stesso punto) e si rimuovono i pill “per pagina” (Home, Buzz, Intelligence, ecc.) oppure si lasciano come duplicati da eliminare progressivamente. Il motore globale, su credito, non monta un secondo pill ma fa animare questo pill globale (stessi eventi `m1u-credited` / `m1u-balance-changed`).
- **Pro:** Una sola autorità visiva; posizione coerente in tutta l’app; niente duplicazione.
- **Contro:** Refactor più grande (rimozione/sostituzione di tutti i punti che montano M1UPill per pagina); possibile impatto su layout e UX per pagina (es. Home oggi ha il pill in un certo punto, con pill globale potrebbe essere in header); bisogna gestire bene safe area e comportamento su diverse route.
- **Rischio regressioni:** Più alto (cambi di layout, visibilità su alcune pagine, accessibilità).
- **Compatibilità paletti:** OK (solo UI/layout).

---

## 7. Raccomandazione finale

- **La strada più pulita e sicura senza toccare IAP** è la **Strategia B**: eliminare l’overlay visivo (il secondo M1UPill) e usare il pill già presente nella pagina come unica autorità visiva.
  - Il motore globale resta: `m1u-credit-event` → set pending + (opzionale) delay → dispatch `m1u-credited` e `m1u-balance-changed`.
  - `GlobalM1UCreditOverlay` non deve più montare `M1UPill`; può essere ridotto a solo listener di `m1u-credit-event` che propaga gli eventi con il delay attuale, oppure la propagazione può essere spostata altrove (es. in `m1uCreditEvent.ts` o in un piccolo hook/provider), sempre senza toccare IAP/accredito.
  - L’unico pill visibile (quello di Home, Buzz, ecc.) riceve gli eventi e anima; niente secondo pill, niente duplicazione.
  - Caso da definire: utente in contesto **senza** pill (es. solo modale shop aperta). Opzioni: accettare che l’animazione si veda solo quando si torna a una pagina con pill; oppure introdurre un fallback minimo (es. toast “+N M1U”) solo quando non c’è nessun pill montato, senza aggiungere un secondo pill full.

Strategia A è applicabile come “quick fix” (nascondere il pill di pagina quando l’overlay è attivo) ma lascia l’architettura con due pill; Strategia C è la più pulita a lungo termine ma richiede un refactor di layout più ampio. Per risolvere il problema descritto dall’utente (“non voleva un secondo pill, voleva solo che apparisse il pill con animazione”) con il minimo impatto, **B** è la raccomandazione principale.

---

**Fine report forense. Nessuna modifica al codice; nessun build; nessun cap sync.**
