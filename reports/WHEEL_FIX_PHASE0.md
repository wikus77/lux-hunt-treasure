# WHEEL FIX — FASE 0 (Verifica forense pre-patch)

**Data:** 2026-03-03  
**Branch:** `fix/wheel-server-real` | **Tag rollback:** `safety/wheel-pre-fix`

---

## 1. File verificati (percorsi esatti)

| File | Verifica |
|------|----------|
| `src/components/feedback/FortuneWheel.tsx` | ✅ Componente unico ruota: segmenti, check RPC, handleSpin con fallback client, award M1U client, clue modal condizionato a `reward_type === 'clue'`. |
| `src/components/shop/ShopContent.tsx` | ✅ Tab Progressione: `canSpinWheel` da localStorage (`WHEEL_STORAGE_KEY`), apre `<FortuneWheel />`. |
| `src/components/shop/ShopModal.tsx` | ✅ Stesso pattern, localStorage per canSpin. |
| `src/components/shop/ShopPill.tsx` | ✅ Badge da localStorage. |
| `supabase/migrations/20260128_001_wheel_deterministic_progress.sql` | ✅ `user_progress_meters`, `execute_wheel_progress()`, `check_wheel_progress_today()`. |
| `supabase/migrations/20260207_award_wheel_m1u.sql` | ✅ RPC `award_wheel_m1u(p_amount)` (SECURITY DEFINER). |
| `src/features/m1u/M1UPill.tsx` | ✅ Listener `m1u-credited` per slot animation esistente. |

---

## 2. Call graph attuale

- **Apertura ruota:** AppHome o Shop → `FortuneWheel` isOpen.
- **Check can spin:** `useEffect(isOpen)` → `checkCanInteract()` → `supabase.rpc('check_wheel_progress_today')`; **on error** → fallback **localStorage** + `toDateString()`.
- **Spin:** `handleSpin()` → `supabase.rpc('execute_wheel_progress')`; **on error** → **client fallback** (segmento `Date.now()/1000 % 16`), nessuna scrittura server.
- **Reward M1U:** in `setTimeout(5500)`: `award_wheel_m1u` (client call) + `dispatchEvent('m1u-credited')`.
- **Clue:** solo se `serverResult.reward_type === 'clue'` → `showClueReward()` (array client `INSTANT_CLUES`). Server **non** ritorna mai `reward_type: 'clue'`.

---

## 3. Causa bypass killapp

1. **execute_wheel_progress fallisce** → client usa fallback, anima ruota, scrive solo localStorage → server non registra → al reopen `check_wheel_progress_today` dice ancora “can interact”.
2. **check_wheel_progress_today fallisce** → canSpin da localStorage; se vuoto o altro giorno → spin consentito.
3. **Shop** non chiama mai il server per “can spin”; solo localStorage.

---

## 4. Perché il clue non appare

- **Server** (`execute_wheel_progress`): ritorna `reward_type` solo `'m1u'` (milestone) o `'progress'`; **mai** `'clue'` anche per segment_id 11.
- **Client:** apre modale clue solo se `serverResult.reward_type === 'clue'` → condizione mai vera.
- Contenuto clue attuale: array client `INSTANT_CLUES`; non DB `prize_clues`.

---

## 5. Whitelist file da toccare (FASE 2)

| Tipo | File |
|------|------|
| **Nuovo** | `supabase/migrations/YYYYMMDD_wheel_server_real.sql` |
| **Nuovo** | `supabase/functions/spin-wheel/index.ts` |
| **Client** | `src/components/feedback/FortuneWheel.tsx` |
| **Shop (minimo)** | `src/components/shop/ShopContent.tsx`, `ShopModal.tsx`, `ShopPill.tsx` (opzionale status) |
| **i18n** | `src/locales/{it,en,fr}/common.json` |
| **Report** | `reports/WHEEL_FIX_PHASE0.md`, `reports/WHEEL_FIX_PHASE1_RESULTS.md` |

---

## 6. Rischio FROZEN

- **Nessun impatto** su: Login/Logout, delete-account-v2, IAP, BUZZ, BUZZ MAP, push.
- Modifiche limitate a: ruota (nuova tabella `daily_wheel_runs`, Edge `spin-wheel`), client FortuneWheel e Shop (solo stato “can spin” / status), i18n.
- BUZZ: nessuna modifica a handle-buzz-press; Edge spin-wheel **legge** solo da `prize_clues`/`current_mission_data` (stessa source) senza scrivere in `user_clues` né alterare logiche BUZZ.
- delete-account: `daily_wheel_runs.user_id` con `ON DELETE CASCADE` su `auth.users` → cancellazione utente rimuove i run.

**Conclusione: OK per procedere con FASE 2.**
