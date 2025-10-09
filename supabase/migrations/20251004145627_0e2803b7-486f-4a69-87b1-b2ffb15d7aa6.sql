-- ============================================================
-- M1SSION™ Mission Control Real-time & RLS Fix
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================

-- 1. Add RLS SELECT policy for admins on mission_enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.mission_enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Add RLS SELECT policy for users to view their own enrollment
CREATE POLICY "Users can view own enrollment"
ON public.mission_enrollments
FOR SELECT
USING (auth.uid() = user_id);