-- MPE Real Data v1 — PREFLIGHT DB REALE (READ-ONLY)
-- Esegui questo script nel Supabase Dashboard → SQL Editor (run tutto).
-- Nessuna scrittura; solo SELECT e information_schema.
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™

-- ═══════════════════════════════════════════════════════════════════════════
-- A) MIGRATIONS APPLICATE
-- Supabase salva le migration applicate in supabase_migrations.schema_migrations
-- (o in public.schema_migrations a seconda della versione)
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'A) MIGRATIONS APPLICATE' AS section;
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
-- Cerca nelle righe sopra almeno: 20251203_smart_push_system, 20251207_cashback_vault,
-- 20251130_realtime_leaderboard, 20250113_010_pe_daily_awards, 20251004081340_95e746be%,
-- 20251213_fix_user_clues_and_enrollment

-- Se la tabella si chiama diversamente (es. schema_migrations in public):
-- SELECT * FROM information_schema.tables WHERE table_name LIKE '%migration%';

-- ═══════════════════════════════════════════════════════════════════════════
-- B) ESISTENZA OGGETTI (tabelle, MV, funzioni)
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'B) TABELLE' AS section;
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_activity_stats', 'user_cashback_wallet', 'user_map_areas',
    'buzz_map_actions', 'user_clues', 'pe_daily_awards'
  )
ORDER BY table_name;

SELECT 'B) MATERIALIZED VIEW' AS section;
SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'leaderboard_rankings'
UNION ALL
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name = 'leaderboard_rankings';
-- Nota: in alcuni cataloghi le MV sono in pg_matviews

SELECT schemaname, matviewname FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'leaderboard_rankings';

SELECT 'B) FUNZIONI' AS section;
SELECT routine_schema, routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_streak_info', 'get_leaderboard', 'update_user_activity')
ORDER BY routine_name;

-- ═══════════════════════════════════════════════════════════════════════════
-- C) ACCESSIBILITÀ leaderboard_rankings (GRANT + colonne)
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'C) GRANT SELECT leaderboard_rankings per authenticated' AS section;
SELECT has_table_privilege('authenticated', 'public.leaderboard_rankings', 'SELECT') AS can_select;

SELECT 'C) Colonne leaderboard_rankings' AS section;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leaderboard_rankings'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════════════════════════════
-- D) DRIFT week / week_number (user_clues, user_map_areas)
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'D) Colonne user_clues (week vs week_number)' AS section;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_clues'
  AND column_name IN ('week', 'week_number')
ORDER BY column_name;

SELECT 'D) Colonne user_map_areas (week)' AS section;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_map_areas'
  AND column_name = 'week';

-- Fine preflight (READ-ONLY)
