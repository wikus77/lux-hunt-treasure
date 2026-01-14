-- ============================================================================
-- M1SSION™ FIX: Add arena coordinates to battle_sessions
-- PROBLEMA: Le battaglie non registrano il paese corretto perché mancano le coordinate GPS
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Aggiungi colonne per le coordinate GPS
ALTER TABLE public.battle_sessions 
ADD COLUMN IF NOT EXISTS arena_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS arena_lng DOUBLE PRECISION;

-- 2. Commento per documentazione
COMMENT ON COLUMN public.battle_sessions.arena_lat IS 'Latitudine GPS dove è avvenuta la battaglia (posizione avversario)';
COMMENT ON COLUMN public.battle_sessions.arena_lng IS 'Longitudine GPS dove è avvenuta la battaglia (posizione avversario)';

-- 3. Indice per ricerche geospaziali (opzionale)
CREATE INDEX IF NOT EXISTS idx_battle_sessions_coords 
ON public.battle_sessions(arena_lat, arena_lng) 
WHERE arena_lat IS NOT NULL AND arena_lng IS NOT NULL;

-- ============================================================================
-- ROLLBACK: 
-- ALTER TABLE public.battle_sessions DROP COLUMN arena_lat, DROP COLUMN arena_lng;
-- DROP INDEX IF EXISTS idx_battle_sessions_coords;
-- ============================================================================

