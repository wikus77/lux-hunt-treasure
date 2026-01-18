-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ — FIX: Add missing 'last_fortune_spin' column to profiles
-- Date: 2026-01-17
-- Issue: execute_wheel_spin RPC fails because profiles.last_fortune_spin doesn't exist
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Add the missing column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_fortune_spin TIMESTAMPTZ;

-- 2. Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'last_fortune_spin';

-- 3. Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';

