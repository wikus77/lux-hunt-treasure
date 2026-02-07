-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Fix wheel_spins reward_type CHECK constraint
-- Date: 2026-02-07
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Add 'progress' to allowed reward_type values
--          Required for execute_wheel_progress() function to work correctly
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop the existing CHECK constraint
ALTER TABLE public.wheel_spins 
DROP CONSTRAINT IF EXISTS wheel_spins_reward_type_check;

-- Add new CHECK constraint with 'progress' included
ALTER TABLE public.wheel_spins 
ADD CONSTRAINT wheel_spins_reward_type_check 
CHECK (reward_type IN ('m1u', 'pe', 'clue', 'marker', 'retry', 'nothing', 'progress'));

-- Verify: comment
COMMENT ON COLUMN public.wheel_spins.reward_type IS 'Type of reward: m1u, pe, clue, marker, retry, nothing, progress';
