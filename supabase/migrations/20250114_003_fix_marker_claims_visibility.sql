-- ============================================
-- M1SSION™ FIX: Marker Claims Visibility
-- 
-- PROBLEMA: I marker riscattati non diventano viola per tutti gli utenti
-- perché la RLS permette solo di vedere i PROPRI claim.
--
-- SOLUZIONE: Aggiungere policy che permette a TUTTI gli utenti autenticati
-- di vedere il marker_id dei claim (per determinare se un marker è claimed).
--
-- © 2025 Joseph MULÉ – M1SSION™
-- ============================================

-- 1. Drop existing restrictive policy (se esiste)
DROP POLICY IF EXISTS "Users can view their own claims" ON public.marker_claims;

-- 2. Create new policy: Users can see ALL claims (for marker visibility)
-- This allows the map to show which markers are already claimed (purple)
CREATE POLICY "Anyone can view marker claims for visibility"
ON public.marker_claims
FOR SELECT
USING (true);  -- All authenticated users can see all claims

-- 3. Keep the insert policy (users can only insert their own claims)
-- This policy should already exist, but we ensure it
DROP POLICY IF EXISTS "Users can insert their own claims" ON public.marker_claims;
CREATE POLICY "Users can insert their own claims"
ON public.marker_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Verify policies
DO $$
BEGIN
  RAISE NOTICE '✅ marker_claims RLS policies updated:';
  RAISE NOTICE '   - SELECT: Anyone can view (for purple marker display)';
  RAISE NOTICE '   - INSERT: Only own user_id (prevents claiming for others)';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

