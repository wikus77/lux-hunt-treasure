-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Migration: Add missing columns for type compatibility

SET search_path = public;

-- 1) Add value_int to app_config for QRControlPanel compatibility
ALTER TABLE public.app_config
  ADD COLUMN IF NOT EXISTS value_int bigint;

-- 2) Add missing columns to user_clues for FoundCluesDisplay
ALTER TABLE public.user_clues
  ADD COLUMN IF NOT EXISTS description_it text,
  ADD COLUMN IF NOT EXISTS clue_type text DEFAULT 'buzz';

-- 3) Ensure unique constraint on user_credits (user_id, credit_type removed as only user_id should be PK)
-- Note: user_credits has only user_id as PK, with free_buzz_credit and free_buzz_map_credit columns
-- This is already correct, no changes needed

COMMENT ON COLUMN public.app_config.value_int IS 'Integer value for numeric config entries';
COMMENT ON COLUMN public.user_clues.description_it IS 'Italian description of the clue';
COMMENT ON COLUMN public.user_clues.clue_type IS 'Type of clue: buzz, buzz_map, qr, etc.';