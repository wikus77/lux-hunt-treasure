-- © 2025 Joseph MULÉ – M1SSION™ – RLS enum/text fix (SAFE)

-- PRIZES
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage prizes" ON public.prizes;
CREATE POLICY "Admins can manage prizes"
  ON public.prizes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin','moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin','moderator')
    )
  );

-- PRIZE_CLUES
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage prize clues" ON public.prize_clues;
CREATE POLICY "Admins can manage prize clues"
  ON public.prize_clues FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin','moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin','moderator')
    )
  );

-- PRE_REGISTERED_USERS (view solo admin; insert aperto)
ALTER TABLE public.pre_registered_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view pre-registrations" ON public.pre_registered_users;
CREATE POLICY "Admins can view pre-registrations"
  ON public.pre_registered_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin','moderator')
    )
  );
DROP POLICY IF EXISTS "Anyone can pre-register" ON public.pre_registered_users;
CREATE POLICY "Anyone can pre-register"
  ON public.pre_registered_users FOR INSERT
  WITH CHECK (true);
