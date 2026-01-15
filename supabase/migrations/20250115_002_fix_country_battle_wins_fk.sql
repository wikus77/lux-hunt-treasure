-- ============================================================================
-- M1SSION™ FIX: Remove FK constraint on country_battle_wins.battle_id
-- PROBLEMA: Per FAKE AGENT, non c'è record in battle_sessions, quindi
--           l'INSERT in country_battle_wins fallisce con FK violation
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Rimuovi la FK constraint se esiste
ALTER TABLE public.country_battle_wins 
DROP CONSTRAINT IF EXISTS country_battle_wins_battle_id_fkey;

ALTER TABLE public.country_battle_wins 
DROP CONSTRAINT IF EXISTS country_battle_wins_battle_id_battle_sessions_id_fk;

ALTER TABLE public.country_battle_wins 
DROP CONSTRAINT IF EXISTS fk_battle_session;

-- 2. Verifica che battle_id sia nullable (non deve essere NOT NULL)
ALTER TABLE public.country_battle_wins 
ALTER COLUMN battle_id DROP NOT NULL;

-- 3. Log per debug
DO $$
BEGIN
  RAISE NOTICE '✅ FK constraints removed from country_battle_wins.battle_id';
END;
$$;

