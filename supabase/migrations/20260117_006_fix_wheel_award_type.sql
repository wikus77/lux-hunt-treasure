-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ — FIX: Add 'wheel' to prize_awards award_type CHECK constraint
-- Date: 2026-01-17
-- Issue: execute_wheel_spin RPC fails with 400 because 'wheel' is not allowed
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Drop the existing CHECK constraint
ALTER TABLE public.prize_awards 
DROP CONSTRAINT IF EXISTS prize_awards_award_type_check;

-- 2. Add the new CHECK constraint with 'wheel' included
ALTER TABLE public.prize_awards 
ADD CONSTRAINT prize_awards_award_type_check 
CHECK (award_type IN ('secondary', 'final', 'marker', 'qr', 'event', 'referral', 'wheel', 'streak', 'minigame'));

-- 3. Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';

-- 4. Verify the fix
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.prize_awards'::regclass
  AND conname LIKE '%award_type%';

-- Expected output: award_type IN ('secondary', 'final', 'marker', 'qr', 'event', 'referral', 'wheel', 'streak', 'minigame')

