-- © 2025 NIYVORA KFT –Joseph MULÉ – M1SSION™
-- Retry: create policies without IF NOT EXISTS (Postgres compatibility)

-- Ensure tables exist (no-op if already created)
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('buzz_credit','buzz_map_credit','custom')),
  reward_value int NOT NULL DEFAULT 1,
  lat double precision,
  lng double precision,
  is_active boolean NOT NULL DEFAULT true,
  is_hidden boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.qr_code_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, qr_code_id)
);

CREATE TABLE IF NOT EXISTS public.qr_code_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, qr_code_id)
);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_codes' AND policyname='qr: authed read discovered only') THEN
    EXECUTE 'DROP POLICY "qr: authed read discovered only" ON public.qr_codes';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_codes' AND policyname='qr: admin full') THEN
    EXECUTE 'DROP POLICY "qr: admin full" ON public.qr_codes';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_code_discoveries' AND policyname='discoveries: owner read') THEN
    EXECUTE 'DROP POLICY "discoveries: owner read" ON public.qr_code_discoveries';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_code_discoveries' AND policyname='discoveries: insert self') THEN
    EXECUTE 'DROP POLICY "discoveries: insert self" ON public.qr_code_discoveries';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_code_claims' AND policyname='claims: owner read') THEN
    EXECUTE 'DROP POLICY "claims: owner read" ON public.qr_code_claims';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_code_claims' AND policyname='claims: insert self') THEN
    EXECUTE 'DROP POLICY "claims: insert self" ON public.qr_code_claims';
  END IF;
END$$;

-- Policies
CREATE POLICY "qr: authed read discovered only"
ON public.qr_codes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.qr_code_discoveries d
    WHERE d.qr_code_id = qr_codes.id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "qr: admin full"
ON public.qr_codes FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "discoveries: owner read"
ON public.qr_code_discoveries FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "discoveries: insert self"
ON public.qr_code_discoveries FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "claims: owner read"
ON public.qr_code_claims FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "claims: insert self"
ON public.qr_code_claims FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- RPC stays as defined previously; just recreate to be safe
CREATE OR REPLACE FUNCTION public.qr_redeem(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr public.qr_codes%ROWTYPE;
  already_claimed boolean;
  result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT * INTO v_qr
  FROM public.qr_codes
  WHERE code = qr_redeem.code AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'qr_not_found_or_inactive';
  END IF;

  INSERT INTO public.qr_code_discoveries(user_id, qr_code_id)
  VALUES (v_user, v_qr.id)
  ON CONFLICT (user_id, qr_code_id) DO NOTHING;

  SELECT EXISTS(
    SELECT 1 FROM public.qr_code_claims
    WHERE user_id = v_user AND qr_code_id = v_qr.id
  ) INTO already_claimed;

  IF already_claimed THEN
    RETURN jsonb_build_object('status','already_claimed');
  END IF;

  IF v_qr.reward_type = 'buzz_credit' THEN
    INSERT INTO public.user_credits (user_id, free_buzz_credit, free_buzz_map_credit)
    VALUES (v_user, COALESCE(v_qr.reward_value,1), 0)
    ON CONFLICT (user_id) DO UPDATE SET
      free_buzz_credit = public.user_credits.free_buzz_credit + EXCLUDED.free_buzz_credit,
      updated_at = now();
  ELSIF v_qr.reward_type = 'buzz_map_credit' THEN
    INSERT INTO public.user_credits (user_id, free_buzz_credit, free_buzz_map_credit)
    VALUES (v_user, 0, COALESCE(v_qr.reward_value,1))
    ON CONFLICT (user_id) DO UPDATE SET
      free_buzz_map_credit = public.user_credits.free_buzz_map_credit + EXCLUDED.free_buzz_map_credit,
      updated_at = now();
  ELSE
    PERFORM 1;
  END IF;

  INSERT INTO public.qr_code_claims(user_id, qr_code_id)
  VALUES (v_user, v_qr.id)
  ON CONFLICT (user_id, qr_code_id) DO NOTHING;

  result := jsonb_build_object(
    'status','ok',
    'reward_type', v_qr.reward_type,
    'reward_value', v_qr.reward_value
  );
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.qr_redeem(text) TO authenticated;