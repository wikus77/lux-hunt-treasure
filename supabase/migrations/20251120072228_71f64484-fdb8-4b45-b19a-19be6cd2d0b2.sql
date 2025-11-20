-- © 2025 Joseph MULÉ – M1SSION™ – Complete Database Schema Migration (Consolidated)
-- Plan A: add missing tables/columns + safe RLS + indexes. Idempotent.

-- ============ STEP 1: Create missing tables ============
CREATE TABLE IF NOT EXISTS public.prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  value numeric,
  quantity integer DEFAULT 0,
  claimed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prize_clues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id uuid REFERENCES public.prizes(id) ON DELETE CASCADE,
  clue_text text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pre_registered_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  agent_code text UNIQUE,
  registered_at timestamptz DEFAULT now(),
  converted_at timestamptz,
  is_converted boolean DEFAULT false
);

-- ============ STEP 2: Add missing columns ============
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS prize_id uuid REFERENCES public.prizes(id),
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS publication_date timestamptz,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

ALTER TABLE public.app_messages
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiry_date timestamptz;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='qr_codes') THEN
    ALTER TABLE public.qr_codes
      ADD COLUMN IF NOT EXISTS title text;
  END IF;
END $$;

-- ============ STEP 3: RLS policies ============
-- prizes
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Prizes are viewable by all" ON public.prizes;
CREATE POLICY "Prizes are viewable by all"
  ON public.prizes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage prizes" ON public.prizes;
CREATE POLICY "Admins can manage prizes"
  ON public.prizes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- prize_clues
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Prize clues are viewable by all" ON public.prize_clues;
CREATE POLICY "Prize clues are viewable by all"
  ON public.prize_clues FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage prize clues" ON public.prize_clues;
CREATE POLICY "Admins can manage prize clues"
  ON public.prize_clues FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- pre_registered_users
ALTER TABLE public.pre_registered_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can pre-register" ON public.pre_registered_users;
CREATE POLICY "Anyone can pre-register"
  ON public.pre_registered_users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view pre-registrations" ON public.pre_registered_users;
CREATE POLICY "Admins can view pre-registrations"
  ON public.pre_registered_users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- ============ STEP 4: Trigger updated_at ============
DROP TRIGGER IF EXISTS update_prizes_updated_at ON public.prizes;
CREATE TRIGGER update_prizes_updated_at
  BEFORE UPDATE ON public.prizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STEP 5: Helpful indexes ============
CREATE INDEX IF NOT EXISTS prize_clues_prize_id_idx ON public.prize_clues (prize_id, order_index);
CREATE INDEX IF NOT EXISTS missions_status_idx ON public.missions (status);

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED