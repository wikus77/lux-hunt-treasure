-- Create RLS policy for bulk marker creation by admins
DO $$
BEGIN
  -- Enable RLS on markers table if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'markers' AND rowsecurity = true
  ) THEN
    ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create insert policy for admin users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'markers' AND policyname = 'admin_can_insert_markers'
  ) THEN
    CREATE POLICY "admin_can_insert_markers"
    ON public.markers FOR INSERT 
    TO authenticated
    WITH CHECK (is_admin_secure());
  END IF;

  -- Create select policy for authenticated users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'markers' AND policyname = 'authenticated_can_view_active_markers'
  ) THEN
    CREATE POLICY "authenticated_can_view_active_markers"
    ON public.markers FOR SELECT 
    TO authenticated
    USING (active = true AND (visible_from IS NULL OR visible_from <= now()) AND (visible_to IS NULL OR visible_to >= now()));
  END IF;
END$$;