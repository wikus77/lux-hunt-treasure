-- FIX migration: DROP e ricrea funzione con signature corretta
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Drop e ricrea funzione FREE
DROP FUNCTION IF EXISTS public.create_free_subscription();

-- Garantisci colonna choose_plan_seen 
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='choose_plan_seen'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN choose_plan_seen boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Normalizza tier 'base' -> 'free'
UPDATE public.subscriptions
SET tier = 'free'
WHERE tier IN ('base','FREE','Base','Free') AND tier <> 'free';

-- Crea funzione FREE corretta 
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_has_active boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Auth required';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_uid AND status = 'active'
  ) INTO v_has_active;

  IF NOT v_has_active THEN
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (v_uid, 'free', 'active')
    ON CONFLICT DO NOTHING;
  END IF;

  -- flag prima-visita visto
  UPDATE public.profiles
  SET choose_plan_seen = true
  WHERE id = v_uid;

  -- Sblocco accesso per piano FREE (solo se colonne esistono)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='access_enabled') THEN
    UPDATE public.profiles
    SET access_enabled = COALESCE(access_enabled,true)
    WHERE id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='access_start_date') THEN
    UPDATE public.profiles
    SET access_start_date = COALESCE(access_start_date, now() AT TIME ZONE 'utc')
    WHERE id = v_uid;
  END IF;

END
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription() TO authenticated;