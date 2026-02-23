-- MPE Real Data v1 NO LEADERBOARD — PREFLIGHT DB (READ ONLY)
-- Esegui in Supabase Dashboard → SQL Editor. Nessuna scrittura.
-- STOP se manca qualcosa.

SELECT 'TABLE CHECK' AS section;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'user_clues',
    'user_map_areas',
    'user_activity_stats',
    'user_cashback_wallet'
  );

SELECT 'COLUMN CHECK profiles' AS section;
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'm1_units',
    'pulse_energy',
    'current_streak_days',
    'longest_streak_days',
    'last_check_in_date'
  );

-- Opzionale: colonne usate da mpe_get_inputs_snapshot (evita errori RPC dopo migration)
SELECT 'COLUMN CHECK user_map_areas (week, source)' AS section;
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_map_areas'
  AND column_name IN ('week', 'source', 'radius_km', 'user_id');

SELECT 'COLUMN CHECK user_cashback_wallet' AS section;
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_cashback_wallet'
  AND column_name IN ('user_id', 'accumulated_m1u', 'lifetime_earned_m1u', 'last_claim_at');
