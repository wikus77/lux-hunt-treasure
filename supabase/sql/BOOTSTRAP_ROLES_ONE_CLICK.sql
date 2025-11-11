-- © 2025 M1SSION™ – NIYVORA KFT™ – All Rights Reserved
-- ⚡ ONE-CLICK BOOTSTRAP: Roles System + Admin Assignment
-- INSTRUCTIONS: Copy TUTTO questo codice e incollalo nel SQL Editor di Supabase, poi clicca "Run"

-- ============================================================
-- STEP 1: Create enum app_role (admin, moderator, user)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  RAISE NOTICE '✅ Enum app_role created';
EXCEPTION 
  WHEN duplicate_object THEN 
    RAISE NOTICE '⚠️ Enum app_role already exists (OK)';
END $$;

-- ============================================================
-- STEP 2: Create user_roles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

DO $$ BEGIN
  RAISE NOTICE '✅ Table user_roles created';
END $$;

-- ============================================================
-- STEP 3: Enable RLS
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  RAISE NOTICE '✅ RLS enabled on user_roles';
END $$;

-- ============================================================
-- STEP 4: Create RLS policy
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "users can view their roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
  RAISE NOTICE '✅ RLS policy created';
EXCEPTION 
  WHEN duplicate_object THEN 
    RAISE NOTICE '⚠️ RLS policy already exists (OK)';
END $$;

-- ============================================================
-- STEP 5: Create has_role function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id 
      and ur.role = _role::public.app_role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

DO $$ BEGIN
  RAISE NOTICE '✅ Function has_role created';
END $$;

-- ============================================================
-- STEP 6: Assign admin role to wikus77@hotmail.it
-- ============================================================
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'wikus77@hotmail.it'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ User wikus77@hotmail.it not found in auth.users';
  END IF;

  -- Insert admin role (idempotent)
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (v_user_id, 'admin'::public.app_role, v_user_id)
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE '✅ Admin role assigned to wikus77@hotmail.it (user_id: %)', v_user_id;
END $$;

-- ============================================================
-- STEP 7: Verify installation
-- ============================================================
DO $$
DECLARE
  v_email text;
  v_role public.app_role;
  v_assigned_at timestamptz;
BEGIN
  SELECT u.email, ur.role, ur.assigned_at
  INTO v_email, v_role, v_assigned_at
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE u.email = 'wikus77@hotmail.it'
  LIMIT 1;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ BOOTSTRAP COMPLETATO CON SUCCESSO!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Ruolo: %', v_role;
  RAISE NOTICE 'Assegnato il: %', v_assigned_at;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================
-- FINAL VERIFICATION QUERY (opzionale)
-- ============================================================
-- Esegui questa query separatamente per vedere il risultato in tabella:
-- SELECT 
--   u.email,
--   ur.role,
--   ur.assigned_at,
--   public.has_role(u.id, 'admin'::public.app_role) as is_admin
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON ur.user_id = u.id
-- WHERE u.email = 'wikus77@hotmail.it';
