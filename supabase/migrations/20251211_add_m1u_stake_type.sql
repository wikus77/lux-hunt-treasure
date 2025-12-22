-- Migration: Add m1u and pulse_energy to battles stake_type constraint
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Drop the old constraint and add new one with m1u and pulse_energy
ALTER TABLE public.battles 
DROP CONSTRAINT IF EXISTS battles_stake_type_check;

ALTER TABLE public.battles 
ADD CONSTRAINT battles_stake_type_check 
CHECK (stake_type IN ('m1u', 'pulse_energy', 'energy', 'buzz', 'clue'));

-- Update default to m1u
ALTER TABLE public.battles 
ALTER COLUMN stake_type SET DEFAULT 'm1u';



