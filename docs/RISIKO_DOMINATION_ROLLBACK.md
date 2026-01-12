# 🔄 RISIKO DOMINATION — ROLLBACK GUIDE

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📋 ROLLBACK COMPLETO

Se necessario tornare allo stato precedente Risiko Domination:

### 1️⃣ GIT ROLLBACK (Code)

```bash
# Torna al tag pre-risiko
git checkout v2.0.0-pre-risiko

# Oppure: elimina branch feature
git branch -D feature/risiko-domination

# Push del rollback (se necessario)
git push origin main --force  # ⚠️ ATTENZIONE: force push
```

### 2️⃣ DATABASE ROLLBACK (Supabase SQL Editor)

Eseguire nell'ordine:

```sql
-- 1. Rimuovi trigger e funzioni
DROP TRIGGER IF EXISTS trigger_battle_domination ON public.battles;
DROP TRIGGER IF EXISTS trigger_battle_pe_award ON public.battles;
DROP TRIGGER IF EXISTS trigger_battle_session_pe_award ON public.battle_sessions;

DROP FUNCTION IF EXISTS public.process_battle_for_domination();
DROP FUNCTION IF EXISTS public.award_battle_pe();
DROP FUNCTION IF EXISTS public.award_battle_session_pe();
DROP FUNCTION IF EXISTS public.is_valid_pvp_battle(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_country_code_from_coords(DOUBLE PRECISION, DOUBLE PRECISION);

-- 2. Rimuovi RPC functions
DROP FUNCTION IF EXISTS public.check_and_award_domination_bonuses(UUID);
DROP FUNCTION IF EXISTS public.award_domination_reward(UUID, TEXT, CHAR, TEXT);
DROP FUNCTION IF EXISTS public.get_user_domination_stats(UUID);
DROP FUNCTION IF EXISTS public.get_country_domination_state();
DROP FUNCTION IF EXISTS public.calculate_domination_status(INTEGER, INTEGER);

-- 3. Rimuovi view
DROP VIEW IF EXISTS public.battle_leaderboard_stats;

-- 4. Rimuovi tabelle (ordine inverso per FK)
DROP TABLE IF EXISTS public.domination_rewards CASCADE;
DROP TABLE IF EXISTS public.country_battle_wins CASCADE;
DROP TABLE IF EXISTS public.country_domination CASCADE;
DROP TABLE IF EXISTS public.continent_countries CASCADE;

-- 5. Rimuovi config (se esiste)
DELETE FROM pricing_rules WHERE key IN ('battle_win_pe', 'battle_lose_pe');

-- 6. Rimuovi funzione timestamp
DROP FUNCTION IF EXISTS public.update_country_domination_timestamp();
```

### 3️⃣ EDGE FUNCTION ROLLBACK

```bash
# Rimuovi Edge Function decay job (se deployata)
supabase functions delete domination-decay-job
```

### 4️⃣ VERIFICA

Dopo il rollback:

1. ✅ `npm run build` deve passare
2. ✅ App deve funzionare identica a prima
3. ✅ Tron Battle deve funzionare normalmente
4. ✅ Nessun errore in console

---

## 📁 FILE CREATI (da eliminare manualmente se serve)

### Frontend
- `src/lib/domination/continentMapping.ts`
- `src/pages/sandbox/map3d/hooks/useCountryDomination.ts`
- `src/pages/sandbox/map3d/layers/CountryDominationLayer3D.tsx`
- `src/components/domination/DominationStatsBadge.tsx`

### Database Migrations
- `supabase/migrations/20250113_001_country_battle_wins.sql`
- `supabase/migrations/20250113_002_country_domination.sql`
- `supabase/migrations/20250113_003_domination_rewards.sql`
- `supabase/migrations/20250113_004_domination_rpcs.sql`
- `supabase/migrations/20250113_005_battle_domination_trigger.sql`
- `supabase/migrations/20250113_006_leaderboard_battle_integration.sql`

### Edge Functions
- `supabase/functions/domination-decay-job/index.ts`

---

## ⚠️ IMPORTANTE

- Il rollback Git NON rimuove i dati dal database
- Eseguire PRIMA il rollback SQL, POI il rollback Git
- Backup consigliato prima del rollback

