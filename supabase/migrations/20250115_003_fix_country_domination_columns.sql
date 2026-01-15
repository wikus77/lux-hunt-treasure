-- ============================================================================
-- M1SSION™ FIX: Add missing columns to country_domination
-- ERRORE: column "last_activity" of relation "country_domination" does not exist
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- Aggiungi colonna last_activity se non esiste
ALTER TABLE public.country_domination 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Aggiungi colonna last_battle_id se non esiste  
ALTER TABLE public.country_domination 
ADD COLUMN IF NOT EXISTS last_battle_id UUID;

-- Aggiungi colonna win_progress se non esiste
ALTER TABLE public.country_domination 
ADD COLUMN IF NOT EXISTS win_progress INTEGER DEFAULT 0;

