-- ============================
-- M1SSION™ — FREE PLAN: AUDIT + FIX (NO-TOUCH PUSH)
-- Esegue in sicurezza: non modifica nulla legato a push/geofence/FCM/Stripe.
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================

-- Set search path
SET search_path = public;

-- 2) RLS POLICY — abilita UPDATE del solo proprio choose_plan_seen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles'
      AND policyname='profiles_update_choose_plan_seen'
  ) THEN
    CREATE POLICY "profiles_update_choose_plan_seen"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- 3) RLS POLICY — abilita INSERT in subscriptions per il proprio user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='subscriptions'
      AND policyname='subscriptions_insert_own'
  ) THEN
    CREATE POLICY "subscriptions_insert_own"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 4) CONSTRAINT UNIVOCITÀ: un abbonamento attivo per utente (idempotenza FREE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='idx_unique_active_sub_per_user'
  ) THEN
    CREATE UNIQUE INDEX idx_unique_active_sub_per_user
      ON public.subscriptions (user_id)
      WHERE (COALESCE(is_active, (status='active')) = true);
  END IF;
END $$;

-- 5) RPC FREE PLAN — crea abbonamento 'free' in modo idempotente
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_sub  subscriptions%rowtype;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Se esiste già un attivo, ritorna OK
  SELECT * INTO v_sub
  FROM subscriptions
  WHERE user_id = v_user
    AND COALESCE(is_active, (status='active')) = true
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'already_active', 'tier', v_sub.tier);
  END IF;

  -- Inserisce FREE attivo
  INSERT INTO subscriptions (user_id, tier, status, is_active, created_at)
  VALUES (v_user, 'free', 'active', true, now())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'tier', 'free');
END
$$;

GRANT EXECUTE ON FUNCTION public.create_free_subscription() TO authenticated;

-- 6) RPC — marca che l'utente ha visto la pagina piani (stop redirect)
CREATE OR REPLACE FUNCTION public.mark_choose_plan_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
     SET choose_plan_seen = true
   WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.mark_choose_plan_seen() TO authenticated;