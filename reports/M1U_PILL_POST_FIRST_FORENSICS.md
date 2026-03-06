# M1U Pill — Perché parte dal saldo già “POST-acquisto” (Forensics READ-ONLY)

**Data:** 2026-03-05  
**Scope:** iOS Capacitor WKWebView — analisi read-only, nessuna modifica.  
**Obiettivo:** Capire perché, al momento in cui la pill riceve `m1u-credited`, il valore mostrato è già POST (160) invece di PRE (50).

---

## 1. Inventario (FASE 0)

### 1.1 Dove viene dispatchato `m1u-credited` (con `amount`)

| File | Riga | Contesto |
|------|------|----------|
| **M1UShopContent.tsx** | 101 | Dopo acquisto IAP: `setTimeout(..., OVERLAY_DISPATCH_DELAY_MS)` (120 ms) → `dispatchEvent('m1u-credited', { detail: { amount: overlayAmount } })` |
| FortuneWheel.tsx | 378 | Dopo credito ruota |
| M1UPaymentContent.tsx | — | Non dispatcha `m1u-credited`; dispatcha `m1uPurchaseSucceeded` con `newBalance` e poi chiama `onSuccess()` |
| Altri | Varie | Lottery, Scratch, Streak, Welcome, Missions, Referral, ecc. |

Per il flusso **IAP Shop**, l’unico dispatch è in **M1UShopContent.tsx** (righe 98–103), con delay **120 ms** dopo `showM1UPillOverlay` e `overlayAmount` impostati.

### 1.2 Dove viene dispatchato `m1u-balance-changed`

| File | Riga | Contesto |
|------|------|----------|
| **M1UShopContent.tsx** | 102 | Stesso `setTimeout` di `m1u-credited`: subito dopo dispatch di `m1u-credited` → `dispatchEvent('m1u-balance-changed', { detail: { type: 'purchase', amount: overlayAmount } })` |
| FinalShootContext.tsx | 480 | Fallback refetch (no amount in detail) |

Nel flusso IAP, **m1u-credited** e **m1u-balance-changed** sono emessi insieme, dopo 120 ms.

### 1.3 Dove la pill setta `displayedBalance` e `prevBalance`

**Solo in `M1UPill.tsx`:**

| Riga | Meccanismo |
|------|------------|
| **57** | Inizializzazione: `useState<number>(() => getCachedM1U())` → valore da cache (o `unitsData?.balance \|\| 0`) |
| **278–284** | `handleM1UCredited`: sync a `fromBalance` poi a `targetBalance`; `setPrevBalance(fromBalance)` / `setPrevBalance(targetBalance)` |
| **303–305, 311–313** | Idem in ramo skip animazione |
| **328–335** | Effect “Initialize displayed balance when data loads”: se `unitsData?.balance !== undefined && !isAnimating && displayedBalance !== unitsData.balance` → **`setDisplayedBalance(unitsData.balance)`** |
| **338–352** | Effect “FIX2 balance effect”: se `prevBalance === null` → `setDisplayedBalance(unitsData.balance)` e `setPrevBalance(unitsData.balance)`; se `unitsData.balance !== prevBalance` → **`setDisplayedBalance(unitsData.balance)`** e **`setPrevBalance(unitsData.balance)`** |
| **100–101, 159–160, 164** | `forceStopAnimation` / `animateBalance`: set a target o valore corrente |

Quindi **displayedBalance** viene portato al valore “post” da:
- **Righe 328–335**: sync a `unitsData.balance` quando dati caricati e non in animazione.
- **Righe 338–352**: sync a `unitsData.balance` quando `unitsData.balance !== prevBalance` (e non in animazione).

### 1.4 Dove viene chiamato `refetch()` e con quali trigger

**useM1UnitsRealtime.ts:**

| Riga | Trigger |
|------|--------|
| **188** | Listener `m1u-balance-updated` → `fetchUnits()` |
| **202** | Mount: `fetchUnits()` alla prima subscription |
| **219** | **Realtime** `postgres_changes` su `profiles` (UPDATE) → **`await fetchUnits()`** |

**M1UPill.tsx** non chiama `refetch()` direttamente; chiama **`refetchWithThrottle(reason)`**, che a sua volta chiama `refetch()` (throttle 1500 ms, single-flight). Trigger in pill:
- `m1u-balance-changed` → `refetchWithThrottle('balanceChanged')`
- `m1u-credited` (in `handleM1UCredited`) → `setTimeout(() => refetchWithThrottle('credited'), 100)`
- buzzAreaCreated, buzzClueCreated, m1u-spent

Quindi:
- **Realtime** aggiorna `unitsData` subito quando il DB viene aggiornato (dopo accredito IAP).
- **m1u-balance-changed** (dopo 120 ms) può triggerare un refetch aggiuntivo (throttle permettendo).

---

## 2. Tracing eventi e ordine effect (FASE 1)

### A) Eventi M1U (grep)

- **`m1u-credited`**: dispatch in M1UShopContent (101), ascolto in M1UPill (322).
- **`m1u-balance-changed`**: dispatch in M1UShopContent (102), ascolto in M1UPill (228) → `refetchWithThrottle('balanceChanged')`.
- **`m1uPurchaseSucceeded`**: dispatch in M1UPaymentContent (154) con `newBalance`; **nessun** listener in M1UPill (solo IAP/shop lo usano). La pill si aggiorna solo via **realtime/refetch** e **m1u-credited** (dopo 120 ms).

### B) Ordine logico degli effect nel Pill

1. **Mount**  
   - `displayedBalance` iniziale = `getCachedM1U()` (cache o 0).  
   - Se la cache è già aggiornata al POST (es. da altro tab/istanza), la pill parte già da POST.

2. **useM1UnitsRealtime**  
   - Realtime UPDATE su `profiles` → `fetchUnits()` → `unitsData = { balance: 160 }`.  
   - React re-render della pill.

3. **Effect sync (328–335)**  
   - Dipendenze: `[unitsData?.balance, isAnimating, displayedBalance]`.  
   - Se `unitsData.balance !== undefined && !isAnimating && displayedBalance !== unitsData.balance` → **`setDisplayedBalance(unitsData.balance)`**.  
   - **Qui la pill passa a mostrare il POST (160)** se non è già in animazione.

4. **Effect balance FIX2 (338–352)**  
   - Dipendenze: `[unitsData?.balance, prevBalance]`.  
   - Se `unitsData.balance !== prevBalance` → **`setDisplayedBalance(unitsData.balance)`**, **`setPrevBalance(unitsData.balance)`**.  
   - **Anche qui la pill viene forzata al POST (160)** quando `unitsData` è già aggiornato e `prevBalance` era PRE o null.

5. **T0 + 120 ms**  
   - M1UShopContent dispatcha `m1u-credited` e `m1u-balance-changed`.  
   - Pill: `handleM1UCredited` calcola `fromBalance = targetBalance - amount` (50), fa sync a 50 e avvia animazione 50→160.  
   - Se prima di questo la pill ha già mostrato 160 (per i passi 3–4), l’utente ha visto “parte da 160”.

---

## 3. Timeline stimata (ordine eventi)

| Simbolo | Evento | Dove |
|--------|--------|------|
| **T0** | Purchase success (callback IAP); server accredita M1U; DB `profiles.m1_units` aggiornato | Backend + M1UPaymentContent → onSuccess() |
| **T0 + ε** | Supabase Realtime: `postgres_changes` UPDATE su `profiles` | useM1UnitsRealtime (216–221) |
| **T0 + ε** | `fetchUnits()` eseguito → `setUnitsData({ balance: 160 })` | useM1UnitsRealtime |
| **T0 + δ** | React re-render: pill (e altre istanze) ricevono `unitsData.balance = 160` | M1UPill |
| **T0 + δ** | Effect 328–335: `displayedBalance !== unitsData.balance` → **setDisplayedBalance(160)** | M1UPill.tsx:331–332 |
| **T0 + δ** | Effect 338–352: `unitsData.balance !== prevBalance` → **setDisplayedBalance(160), setPrevBalance(160)** | M1UPill.tsx:348–350 |
| **T0 + 120 ms** | `m1u-credited` e `m1u-balance-changed` dispatchati | M1UShopContent.tsx:100–102 |
| **T0 + 120 ms** | `handleM1UCredited`: fromBalance=50, sync a 50, animateBalance(50, 160) | M1UPill.tsx:271–318 |
| **T0 + 120 ms + 100 ms** | `refetchWithThrottle('credited')` (throttle permettendo) | M1UPill.tsx:317 |

Quindi: **prima** dell’arrivo di `m1u-credited` (entro 120 ms), **realtime** può aver già aggiornato `unitsData.balance` al POST e i **due effect di sync** (328–335 e 338–352) hanno già impostato **displayedBalance = 160**. La pill appare quindi con il saldo “post-acquisto” e solo dopo 120 ms viene corretta a 50 e animata a 160.

---

## 4. Riga/effetto che impone subito il saldo POST

- **Prima sorgente:**  
  **M1UPill.tsx, effect righe 328–335**  
  - Condizione: `unitsData?.balance !== undefined && !isAnimating && displayedBalance !== unitsData.balance`  
  - Azione: `setDisplayedBalance(unitsData.balance)`  
  - Call path: Realtime UPDATE → `setUnitsData` in useM1UnitsRealtime → re-render → effect 328–335 eseguito → displayedBalance = POST.

- **Seconda sorgente (rinforzo):**  
  **M1UPill.tsx, effect righe 338–352**  
  - Condizione: `unitsData.balance !== prevBalance` (e non in animazione)  
  - Azione: `setDisplayedBalance(unitsData.balance)`, `setPrevBalance(unitsData.balance)`  
  - Stesso trigger: `unitsData` già POST da realtime/refetch.

Inoltre, l’**inizializzazione** della pill (riga 57) usa **getCachedM1U()**. Se il cache è stato scritto con il nuovo balance (es. da `cacheBalance(balance)` in useM1UnitsRealtime dopo un refetch/realtime), una **nuova istanza** di pill (es. overlay che si monta) può partire già con **displayedBalance = 160** (POST).

---

## 5. Ipotesi validate (con prove)

| Ipotesi | Verdict | Prove (file:riga / call path) |
|--------|---------|-------------------------------|
| **H1** `unitsData.balance` aggiornato (realtime/refetch) **prima** che l’evento UI `m1u-credited` scateni l’animazione | **Vera** | Realtime in useM1UnitsRealtime.ts:216–221 su UPDATE `profiles` → `fetchUnits()` → `setUnitsData`. L’evento `m1u-credited` arriva 120 ms dopo (M1UShopContent.tsx:100). In quel lasso il DB è già aggiornato e realtime può aver già aggiornato `unitsData`. |
| **H2** Al mount o su effect di balance, la pill sincronizza `displayedBalance = unitsData.balance` (quindi “post”) e solo dopo parte la slot | **Vera** | M1UPill.tsx:328–335 e 338–352: entrambi impostano `displayedBalance` (e `prevBalance`) da `unitsData.balance` quando non in animazione. Ordine: realtime aggiorna `unitsData` → re-render → effect eseguiti → displayedBalance = POST prima che scatti il setTimeout(120 ms) che dispatcha `m1u-credited`. |
| **H3** Due istanze (Home + overlay) e/o refetch throttle rendono l’ordine deterministico ma “post-first” | **Concorde** | Due (o più) istanze di pill condividono la stessa fonte `unitsData` (stesso hook per userId). Realtime aggiorna una volta e tutte le istanze ricevono `unitsData.balance = 160`. Cache (getCachedM1U) può essere già 160 quando l’overlay si monta; refetch throttle non cambia che il primo aggiornamento visibile arriva da realtime + effect sync. |

---

## 6. Conclusione

- **Perché la pill parte dal saldo “post”:**
  1. L’accredito IAP aggiorna il DB subito; Supabase Realtime notifica l’UPDATE su `profiles` e **useM1UnitsRealtime** aggiorna **unitsData.balance** al valore POST (160) **prima** dei 120 ms di delay del dispatch di `m1u-credited`.
  2. Gli **effect di sync** in M1UPill (righe 328–335 e 338–352) impostano **displayedBalance** (e **prevBalance**) su **unitsData.balance** appena questo è disponibile e la pill non è in animazione, quindi la UI mostra subito 160.
  3. Solo dopo 120 ms viene emesso `m1u-credited`; a quel punto la pill può correggere a 50 e animare 50→160, ma l’utente ha già visto un frame (o più) con 160.

- **Righe che impongono il saldo POST prima dell’animazione:**  
  **M1UPill.tsx:328–335** (sync “when data loads”) e **M1UPill.tsx:338–352** (balance effect “sync_only”), insieme all’inizializzazione da **getCachedM1U()** (riga 57) quando la cache è già al POST.

---

## 7. FASE 2 — Test su iOS (senza modifiche)

Per validare con log Xcode:

1. Avviare l’app su iPhone con console Xcode aperta.
2. Eseguire un acquisto test.
3. Cercare in console (se presenti):
   - Log di purchase success (es. da M1UPaymentContent / IAP).
   - Log `💰 M1UPill: Syncing balance` (M1UPill.tsx:332) — indica che l’effect 328–335 ha scritto `displayedBalance = unitsData.balance`.
   - Timestamp relativi a refetch / realtime (se esposti da useM1UnitsRealtime o Supabase).

Con **DEBUG_M1U_PILL = true** in M1UPill.tsx (solo per test) si avrebbero anche i log di `handleM1UCredited:start` e `preAnim` con `unitsDataBalance`, `displayedBalanceRef.current`, `computedFromBalance`, `computedTargetBalance`.

---

*Report forense read-only. Nessuna modifica al codice. NO IAP TOUCH.*
