# WHEEL OF FORTUNE — Forensic Report (FASE 0, Read-Only)

**Data:** 2026-03-03  
**Scope:** Ruota (1 spin/day bypass, no slot animation, clue non mostrato, spin jank) — analisi cause e proposta fix safe.

---

## 1. File e call graph

### 1.1 Componenti UI ruota

| File | Ruolo |
|------|--------|
| `src/components/feedback/FortuneWheel.tsx` | Modal full-screen ruota: segmenti, spin, reward, clue modal. **Unico componente ruota.** |
| `src/components/feedback/index.ts` | Re-export `FortuneWheel`. |
| `src/components/home/FortuneWheelPill.tsx` | Pill su Home che apre la ruota (stesso `FortuneWheel`). |
| `src/components/shop/ShopContent.tsx` | Tab Shop: tab "PROGRESSIONE", apre `<FortuneWheel isOpen={showWheel} onClose={handleWheelClose} />`. Usa **solo** `localStorage` (`WHEEL_STORAGE_KEY = 'm1_fortune_wheel_last_spin'`) per `canSpinWheel`. |
| `src/components/shop/ShopModal.tsx` | Stesso pattern: lazy `FortuneWheel`, `canSpinWheel` da localStorage. |
| `src/components/shop/ShopPill.tsx` | Badge/availability ruota da localStorage. |
| `src/pages/AppHome.tsx` | Stato `showFortuneWheel`, render `<FortuneWheel isOpen={...} onClose={...} />`. |

**Call graph (sintetico):**

- **Apertura ruota:** AppHome (MotivationalPopup / altro) → `setShowFortuneWheel(true)` **oppure** ShopContent/ShopModal → `setShowWheel(true)` → `<FortuneWheel isOpen />`.
- **Dentro FortuneWheel:**
  - **Check “può girare”:** `useEffect` su `isOpen` → `checkCanInteract()` → `supabase.rpc('check_wheel_progress_today')`; se **errore** → fallback a **localStorage** (`STORAGE_KEY = 'm1_fortune_wheel_last_spin'`) con `new Date().toDateString()` (locale).
  - **Spin:** `handleSpin()` → `supabase.rpc('execute_wheel_progress')`; se **errore** → **client fallback** (segmento da `Date.now()/1000 % 16`), nessuna scrittura server.
  - **Reward M1U:** in `setTimeout(5500)` dopo animazione: se `segmentPrize.type === 'm1u'` → `supabase.rpc('award_wheel_m1u', { p_amount })` poi `window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount } }))`.
  - **Clue:** solo se `serverResult.reward_type === 'clue'` → `showClueReward()` (random da array `INSTANT_CLUES` client-side).

### 1.2 Backend / DB

| File | Ruolo |
|------|--------|
| `supabase/migrations/20260128_001_wheel_deterministic_progress.sql` | `user_progress_meters` (wheel), `execute_wheel_progress()`, `check_wheel_progress_today()`. |
| `supabase/migrations/20260117_004_wheel_spin_serverside.sql` | `wheel_spins` (compat), `execute_wheel_spin` (legacy). |
| `supabase/migrations/20260207_award_wheel_m1u.sql` | RPC `award_wheel_m1u(p_amount)` (SECURITY DEFINER, aggiorna `profiles.m1_units` + `m1u_transactions`). |

**RPC usate dalla ruota:**

- `check_wheel_progress_today()` → legge `user_progress_meters` (wheel), `last_interaction_date = CURRENT_DATE` → `can_interact: false`.
- `execute_wheel_progress()` → se già interagito oggi ritorna `already_completed_today`; altrimenti upsert `user_progress_meters`, insert `wheel_spins`, calcolo **deterministico** `segment_id` (nessun `reward_type: 'clue'` nel return).
- `award_wheel_m1u(p_amount)` → chiamata dal **client** dopo lo spin; non usata dall’RPC execute_wheel_progress.

---

## 2. Regola “1 volta al giorno” attuale

- **Server:** `user_progress_meters.last_interaction_date` (DATE, timezone DB) e `execute_wheel_progress` che ritorna `already_completed_today` se `last_interaction_date = CURRENT_DATE`.
- **Client (FortuneWheel):**
  - Can-spin: da `check_wheel_progress_today()`; in caso di **errore RPC** → fallback a **localStorage** con `new Date().toDateString()` (timezone locale).
  - Dopo lo spin: `localStorage.setItem(STORAGE_KEY, new Date().toISOString())` (linee 268–269, 365, 411).
- **ShopContent / ShopModal / ShopPill:** **solo** `localStorage.getItem(WHEEL_STORAGE_KEY)` e confronto `toDateString()` per `canSpinWheel`; **nessuna** chiamata a `check_wheel_progress_today`.

Perché il killapp “sblocca” di nuovo la ruota:

1. **execute_wheel_progress fallisce** (rete/timeout): il client usa il fallback, anima la ruota, scrive solo in localStorage. Il server **non** registra lo spin. Al prossimo avvio, `check_wheel_progress_today()` non trova interazione oggi → `can_interact: true` → l’utente può girare di nuovo.
2. **check_wheel_progress_today fallisce** al reopen: il client usa il fallback; se localStorage è vuoto o non dello stesso giorno (es. primo avvio, o key diversa in altro contesto), `canSpin = true`.
3. **Shop:** l’UI Shop (tab Progressione) non chiama mai il server per “can spin”; si affida solo a localStorage, che può essere incoerente con il server.

Quindi la regola “1 spin/day” **non** è server-real in modo robusto: dipende da due RPC e da fallback client/localStorage che consentono il bypass.

---

## 3. Root cause (A) — Bypass 1 spin/day (killapp)

| Causa | Dettaglio |
|-------|-----------|
| **Fallback execute** | Se `execute_wheel_progress` fallisce, il client esegue comunque lo spin (segmento da tempo), aggiorna solo localStorage; il server non scrive in `user_progress_meters`/`wheel_spins`. |
| **Fallback check** | Se `check_wheel_progress_today` fallisce, `canSpin` viene da localStorage; localStorage vuoto o “altro giorno” → di nuovo spin consentito. |
| **Doppia fonte di verità** | Server (RPC) + localStorage; Shop ignora il server. |
| **Nessuna idempotenza lato client** | Il client non tratta “già girato oggi” in modo autoritativo: se il server non risponde, assume di poter girare. |

**Conclusione (A):** Per rendere la ruota **server-real** e anti-killapp serve: (1) un unico endpoint (es. Edge `spin-wheel`) che faccia sia “status” che “spin” e che persista sempre il risultato; (2) client che **non** faccia spin senza risposta server valida; (3) UI “TORNA DOMANI” e bottone disabilitato basati **solo** sulla risposta server (es. `already_spun: true`).

---

## 4. Root cause (B) — Slot machine animation non parte

- In `FortuneWheel.tsx` (linee 493–496), quando il segmento è M1U e `segmentPrize.value > 0`, dopo `award_wheel_m1u` viene emesso:
  - `window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount: segmentPrize.value } }))`.
- `M1UPill.tsx` (linee 146–148) ascolta `m1u-credited` e avvia l’animazione “slot” già esistente.

Quindi il flusso **dovrebbe** già far partire l’animazione. Possibili motivi per cui non si vede:

1. **Percorso non raggiunto:** `execute_wheel_progress` ritorna `reward_type: 'progress'` o `'m1u'` solo per milestone; il **segment_id** può essere M1U (es. 2, 5, 8, 12, 15, 16) ma il client usa `winningSegment` da `WHEEL_SEGMENTS[segment_id-1]`. Se il segmento è M1U, il blocco `segmentPrize.type === 'm1u'` viene eseguito e l’evento è emesso. Da codice non risulta un bug ovvio.
2. **Timing:** l’evento è emesso dentro un `setTimeout(5500)`. Se la UI (es. pill) è unmountata o non in ascolto in quel momento, l’animazione può non partire.
3. **Fallback client:** in fallback il server non accredita M1U; il client potrebbe comunque mostrare un segmento M1U e chiamare `award_wheel_m1u` + dispatch. In teoria l’animazione potrebbe partire anche lì; da verificare su dispositivo.

**Conclusione (B):** Il progetto **ha** il trigger `m1u-credited` sulla ruota. Se in produzione l’animazione non appare, andrebbe verificato: (1) che la risposta server abbia davvero un `segment_id` M1U quando ci si aspetta M1U; (2) che l’evento sia emesso dopo accredito reale (es. solo quando `already_spun === false` e amount > 0 in un flusso server-real unico). La proposta FASE 1 (un solo Edge che accredita e ritorna `reward_type`/`amount`) garantisce un solo punto in cui emettere `m1u-credited` in modo coerente.

---

## 5. Root cause (C) — Indizio non mostrato

- **Server:** `execute_wheel_progress` (migration 20260128) calcola `v_segment_id` (1–16) e in risposta ritorna:
  - `reward_type` = `CASE WHEN v_milestone_reached THEN 'm1u' ELSE 'progress' END`
  - Quindi **non** ritorna mai `reward_type: 'clue'` anche quando `v_segment_id = 11` (INDIZIO).
- **Client:** `showClueReward()` viene chiamato solo se `serverResult!.reward_type === 'clue'` (linea 416). Questa condizione **non** è mai vera con l’attuale RPC.
- **Contenuto indizio:** `showClueReward` usa un array **client-side** `INSTANT_CLUES` (random); non usa la source BUZZ (DB).

**Conclusione (C):** L’indizio non appare perché (1) il server non invia `reward_type: 'clue'`; (2) il client mostra il clue solo in quel caso. In più, anche se si mostrasse, l’indizio è preso da un array fisso client-side, non dalla stessa source degli indizi BUZZ (`prize_clues` + `current_mission_data`/`prizes`).  
Fix: (1) lato server (o Edge), in caso di segmento “clue” (es. 11) restituire `reward_type: 'clue'` e un `reward_payload` con testo (e opzionale `clue_id`); (2) client: aprire il modale quando `reward_type === 'clue'` e mostrare `reward_payload.clue_text`; (3) server: indizio “a caso” dalla stessa source BUZZ (lettura da `prize_clues` per missione attiva, senza alterare la logica BUZZ).

---

## 6. Root cause (D) — Spin jank

- **Libreria:** Framer Motion. Ruota: `<motion.div animate={{ rotate: rotation }} transition={{ duration: 5.5, ease: [0.2, 0.8, 0.2, 1] }}>` (linee 579–580).
- **Calcolo rotazione:** `rotation` è uno stato; si aggiorna con `setRotation(totalRotation)` dove `totalRotation = rotation + (360 * 6) + rotationToWin`. Un solo aggiornamento per spin.
- **Possibili cause jank:** (1) curva `ease: [0.2, 0.8, 0.2, 1]` (cubic-bezier) con partenza lenta può dare sensazione “non lineare” o “pesante” all’inizio; (2) nessun `will-change: transform` sul `motion.div` della ruota; (3) re-render (es. tick sound, state) durante i 5.5 s potrebbero toccare layout; (4) il valore `rotation` è in gradi; Framer Motion potrebbe avere sottili differenze di interpolazione.

**Conclusione (D):** Jank riducibile con: (1) transizione più fluida (es. `type: 'tween'`, `ease` con curva più adatta, es. `[0.25, 0.1, 0.25, 1]` o simile per partenza più reattiva); (2) `style={{ willChange: 'transform' }}` sul `motion.div` della ruota; (3) evitare aggiornamenti di stato inutili durante l’animazione (es. tick già in `setInterval`, non legato a React state per il frame della ruota).

---

## 7. M1U: come viene accreditato

- **Ruota oggi:** il client chiama `supabase.rpc('award_wheel_m1u', { p_amount: segmentPrize.value })` (RPC SECURITY DEFINER che aggiorna `profiles.m1_units` e scrive in `m1u_transactions`). Poi emette `m1u-credited`.
- **Altri flussi (daily, IAP, ecc.):** usano `admin_credit_m1u` (service_role) da Edge; il client emette comunque `m1u-credited` dove serve (es. CipherDrillModal, WordDuelMemoryModal, SignalPatternNumbersModal, StreakModal, ScratchWinModal, Lotteria, ecc.).
- **Conclusione:** La ruota non usa `admin_credit_m1u`; usa `award_wheel_m1u`. Per un design “tutto server” si può far accreditare M1U dall’Edge `spin-wheel` con `admin_credit_m1u` (service_role) e restituire `credited_amount`; il client allora si limita a mostrare risultato e a emettere `m1u-credited` una sola volta in base al payload.

---

## 8. Reward “INDIZIO” — source BUZZ

- **BUZZ (handle-buzz-press):** Legge missione attiva da `current_mission_data` (fallback `prizes`), poi da `prize_clues` filtra per `prize_id`, `clue_category`, `week`, esclude gli indizi già in `user_clues` per l’utente, sceglie il “prossimo” indizio (deterministico/ordine). Scrive in `user_clues`.
- **Tabella rilevante:** `prize_clues` (id, description_it, week, clue_category, order_index, …); `user_clues` (user_id, clue_id, …).
- **Per la ruota (safe):** Leggere da `prize_clues` (stesso `prize_id` usato da BUZZ, o da `current_mission_data`/`prizes`) un indizio “a caso” (es. `ORDER BY random() LIMIT 1` o equivalente deterministico), restituirlo in `reward_payload`; opzionale: inserire in `user_clues` con `clue_type = 'wheel'` o solo mostrarlo e salvare in `daily_wheel_runs.reward_payload`. **NON** modificare la logica BUZZ (handle-buzz-press, gate, costi, ecc.).

---

## 9. Proposta FIX safe (whitelist file, zero impatto FROZEN)

### 9.1 Obiettivi

- **A)** Ruota server-real: un solo spin/day autorizzato e persistito dal server; nessun fallback client che permetta un secondo spin; stato “già girato oggi” letto solo dal server.
- **B)** Ogni accredito M1U da ruota deve far scattare l’animazione slot esistente (un solo `m1u-credited` quando il server conferma amount > 0).
- **C)** Reward clue: server restituisce `reward_type: 'clue'` e `reward_payload.clue_text` (e opz. `clue_id`); client apre modale con quel testo; indizio preso dalla stessa source BUZZ (`prize_clues`), senza cambiare BUZZ.
- **D)** Spin più fluido: `will-change: transform`, transizione tween con curva adatta, evitare re-render inutili durante l’animazione.

### 9.2 Whitelist file (modifiche ammesse)

| Tipo | File |
|------|------|
| **Nuovo** | `supabase/migrations/YYYYMMDD_daily_wheel_runs.sql` (tabella `daily_wheel_runs`, RLS, no INSERT/UPDATE/DELETE da client). |
| **Nuovo** | `supabase/functions/spin-wheel/index.ts` (Edge: auth, day_key UTC, idempotenza, reward M1U via `admin_credit_m1u`, reward clue da `prize_clues`, ritorno `already_spun`, `reward_type`, `reward_payload`, `credited_amount`). |
| **Client ruota** | `src/components/feedback/FortuneWheel.tsx` (rimuovere fallback spin; chiamare solo Edge spin-wheel; stato “già girato” da risposta; dispatch `m1u-credited` solo quando amount > 0 e non already_spun; apertura modale clue da `reward_payload`; migliorare transition/will-change). |
| **Shop** | `src/components/shop/ShopContent.tsx`, `ShopModal.tsx`, `ShopPill.tsx` (opzionale: allineare “can spin” a risposta server o nascondere tab/ruota se già girato; al limite lasciare che sia solo FortuneWheel a decidere aprendo il modal). |
| **i18n** | `src/locales/{it,en,fr}/common.json` (chiavi wheel.* e clue_reward.*). |
| **Report** | `reports/WHEEL_FORENSICS.md` (questo file). |

**Non toccare:** Auth, delete-account-v2, IAP, BUZZ (handle-buzz-press), BUZZ MAP, push, M1UPill (solo riuso evento), logiche core diverse dalla ruota.

### 9.3 Schema proposto `daily_wheel_runs`

- `id` uuid PK default gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `day_key` text NOT NULL (UTC YYYY-MM-DD)
- `reward_type` text NOT NULL ('m1u' | 'clue' | 'pe' | 'progress' | 'retry' | …)
- `reward_payload` jsonb (amount, clue_id, clue_text, …)
- `created_at` timestamptz default now()
- UNIQUE(user_id, day_key)
- RLS: SELECT per owner; INSERT/UPDATE/DELETE con WITH CHECK (false) per authenticated (solo service_role/Edge scrive).

### 9.4 Edge `spin-wheel`

- Autenticata (Bearer).
- `day_key = new Date().toISOString().slice(0,10)` (UTC).
- Se esiste riga (user_id, day_key) → 200, `{ already_spun: true, ... }` (idempotente).
- Se non esiste: determinare reward (stesso tipo di logica/segmenti attuali o equivalente); se M1U → `admin_credit_m1u`; se clue → lettura random da `prize_clues` (stesso contesto missione), scrivere in `daily_wheel_runs.reward_payload`; INSERT run; risposta con `already_spun: false`, `reward_type`, `reward_payload`, `credited_amount`.

### 9.5 Client

- All’apertura ruota: chiamare Edge in modalità “status” (o stesso endpoint senza “consumare”) per sapere se `already_spun`; se sì, mostrare “TORNA DOMANI” e disabilitare bottone (nessun fallback localStorage per permettere spin).
- Al click SPIN: disabilitare subito bottone; chiamare Edge spin-wheel; se `already_spun` → toast “Hai già girato oggi”; altrimenti animare verso segmento restituito, mostrare outcome, se M1U e amount > 0 emettere `m1u-credited`, se clue aprire modale con `reward_payload.clue_text`.
- Clue modal: i18n (titolo, CTA chiudi); testo da server.

### 9.6 Spin jank

- Sul `motion.div` della ruota: `transition={{ type: 'tween', duration: 5.5, ease: [0.25, 0.1, 0.25, 1] }}` (o curva simile), `style={{ willChange: 'transform' }}`.
- Mantenere un solo `setRotation(totalRotation)` per spin; evitare aggiornamenti di stato che forzano reflow durante l’animazione.

---

## 10. Riepilogo cause certe

| Problema | Causa certa | File/linee |
|----------|-------------|------------|
| **(A) Bypass killapp** | Fallback client su execute + check; Shop non usa server; stato “can spin” non solo server. | FortuneWheel.tsx (251–258 fallback check; 382–396 fallback execute); ShopContent/ShopModal (localStorage only). |
| **(B) No slot animation** | Il codice emette già `m1u-credited`; possibile timing o segmento non M1U in alcuni casi. | FortuneWheel.tsx 493–496; confermare che con flusso server-real unico l’evento sia sempre emesso quando amount > 0. |
| **(C) Clue non mostrato** | Server non ritorna mai `reward_type: 'clue'`; client mostra clue solo in quel caso; indizio da array client, non da DB. | execute_wheel_progress ritorna solo 'm1u'|'progress'; FortuneWheel.tsx 416, 311–315 (showClueReward, INSTANT_CLUES). |
| **(D) Jank** | Easing e mancanza di will-change; possibile re-render. | FortuneWheel.tsx 579–580 (transition, nessun will-change). |

---

## 11. Conclusione FASE 0

- **Cause (A), (C), (D)** sono identificate con sufficiente certezza da codice e migration.
- **Cause (B):** il meccanismo “slot” è già presente; la proposta FASE 1 (un solo endpoint che accredita e ritorna l’amount) garantisce un unico punto di emissione `m1u-credited` e riduce rischi di timing/doppio spin.

**OK per procedere con FASE 1** con fix mirati: Edge `spin-wheel` + tabella `daily_wheel_runs`, client senza fallback spin e con stato “già girato” da server, modale clue da payload server, indizio da `prize_clues`, miglioramento transizione ruota; rispettando whitelist e vincoli FROZEN.
