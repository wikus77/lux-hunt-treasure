# WHEEL FIX — FASE 1 RESULTS (Post-implementation)

**Data:** 2026-03-04  
**Branch:** `fix/wheel-server-real` | **Tag rollback:** `safety/wheel-pre-fix`

---

## 1. Implementazione completata

### 1.1 DB — Tabella server-real
- **File:** `supabase/migrations/20260304000000_wheel_server_real.sql`
- **Tabella:** `daily_wheel_runs` (user_id, day_key, segment_id, reward_type, credited_amount, reward_payload)
- **RLS:** SELECT owner; INSERT/UPDATE/DELETE bloccati per client (solo service_role/Edge scrive)
- **Cascade:** `user_id` → `auth.users(id) ON DELETE CASCADE` (delete-account safe)

### 1.2 Edge — spin-wheel
- **File:** `supabase/functions/spin-wheel/index.ts`
- **Auth:** Bearer obbligatorio; 401 se assente
- **Actions:** `status` (solo lettura) | `spin` (idempotente, crea run se assente)
- **day_key:** UTC `toISOString().slice(0,10)`
- **Idempotenza:** se esiste run (user_id, day_key) → ritorna `already_spun: true` + dati salvati
- **Segmento:** deterministico `simpleHash(user_id|day_key|wheel_v1) % 16 + 1`
- **M1U:** accredito server-side via `admin_credit_m1u`; `credited_amount` in response
- **Clue:** lettura da `prize_clues` (stessa source BUZZ: current_mission_data → prize_id); `reward_payload: { clue_id, clue_text }`; nessuna scrittura in user_clues

### 1.3 Client — FortuneWheel
- **File:** `src/components/feedback/FortuneWheel.tsx`
- **Check can spin:** solo Edge `spin-wheel` con `action: 'status'`; nessun fallback localStorage per sbloccare spin
- **Spin:** solo Edge `spin-wheel` con `action: 'spin'`; nessun client fallback; se `already_spun: true` → toast "Hai già girato oggi" e stop
- **M1U:** `credited_amount > 0` → `window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount } }))` (slot animation esistente)
- **Clue:** `reward_type === 'clue'` → modale con `reward_payload.clue_text` (i18n titolo/cta)
- **Animazione:** `transition: { type: 'tween', duration: 5.5, ease: [0.25, 0.1, 0.25, 1] }`; `style: { willChange: 'transform' }`

### 1.4 i18n
- **File:** `src/locales/{it,en,fr}/common.json`
- **Chiavi:** `wheel.title`, `wheel.spin_now`, `wheel.come_back_tomorrow`, `wheel.already_spun`, `wheel.one_per_day`, `wheel.error_generic`, `wheel.spinning`, `clue_reward.title`, `clue_reward.cta_close`

### 1.5 Shop
- Nessuna modifica (FortuneWheel è l’autorità: all’apertura chiama status e mostra "TORNA DOMANI" se già girato).

---

## 2. Build e sync

- `npm run build`: **OK** (exit 0)
- `npx cap sync ios`: **OK** (sync completato)

---

## 3. Deploy Edge (da eseguire a mano)

```bash
npx supabase functions deploy spin-wheel
```

**Nota:** applicare prima la migration su Supabase (linked project o `supabase db push` / migrazione manuale) affinché la tabella `daily_wheel_runs` esista.

---

## 4. Test smoke (checklist post-deploy)

1. **Ruota 1 spin/day**
   - Eseguire uno spin → successo.
   - Killapp + riapertura → ruota deve mostrare "Torna domani" / "Come back tomorrow"; bottone disabilitato; chiamata `spin-wheel` con `action: 'spin'` ritorna `already_spun: true`.
2. **M1U**
   - Se il segmento è M1U: saldo aggiornato; **animazione slot** visibile (evento `m1u-credited`).
3. **Indizio**
   - Se il segmento è clue: si apre il modale con il testo da `prize_clues` (stessa source BUZZ).
4. **Fluidità**
   - Spin: avvio e rallentamento più fluidi (tween + will-change).
5. **NO REGRESSION**
   - Login/Logout, delete-account, IAP, BUZZ, BUZZ MAP, push: quick sanity check invariato.

---

## 5. Rollback

```bash
git reset --hard safety/wheel-pre-fix
```

---

## 6. File toccati

| File | Modifica |
|------|----------|
| `reports/WHEEL_FIX_PHASE0.md` | Nuovo (verifica forense) |
| `supabase/migrations/20260304000000_wheel_server_real.sql` | Nuovo |
| `supabase/functions/spin-wheel/index.ts` | Nuovo |
| `src/components/feedback/FortuneWheel.tsx` | Server-only spin, status, clue modal, i18n, tween |
| `src/locales/it/common.json` | Chiavi wheel.* e clue_reward.* |
| `src/locales/en/common.json` | Idem |
| `src/locales/fr/common.json` | Idem |
| `reports/WHEEL_FIX_PHASE1_RESULTS.md` | Nuovo (questo report) |
