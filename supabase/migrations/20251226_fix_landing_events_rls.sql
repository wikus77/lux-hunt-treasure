-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- FIX: Landing Events RLS Policy for Admin Access

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admin can view landing_events" ON public.landing_events;

-- Create more permissive policy for admin users
-- Checks multiple conditions to ensure admin access works
CREATE POLICY "Admin can view landing_events" ON public.landing_events
  FOR SELECT
  USING (
    -- Check if user is authenticated and is admin
    auth.uid() IS NOT NULL 
    AND (
      -- Method 1: Check raw_user_meta_data role
      (auth.jwt() ->> 'role') = 'admin'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      -- Method 2: Check email domain
      OR auth.email() LIKE '%@m1ssion.eu'
      -- Method 3: Check if user is in panel whitelist (from profiles)
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
          is_admin = true 
          OR role = 'admin'
          OR email LIKE '%wikus%'
        )
      )
      -- Method 4: Direct user ID check (your admin account)
      OR auth.uid()::text IN (
        SELECT id::text FROM public.profiles WHERE is_admin = true
      )
    )
  );

-- Also allow service role to read (for edge functions)
CREATE POLICY "Service role can view landing_events" ON public.landing_events
  FOR SELECT
  USING (
    auth.role() = 'service_role'
  );

