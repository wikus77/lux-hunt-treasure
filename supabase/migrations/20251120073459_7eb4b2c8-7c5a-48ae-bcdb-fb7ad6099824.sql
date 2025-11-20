-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Migration: PRIORITY_1_BUILD_UNBLOCK

SET search_path = public;

-- 1) TABLE: user_notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id_is_read ON public.user_notifications(user_id, is_read);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_notifications.select.own" ON public.user_notifications;
CREATE POLICY "user_notifications.select.own"
  ON public.user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notifications.insert.own" ON public.user_notifications;
CREATE POLICY "user_notifications.insert.own"
  ON public.user_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notifications.update.own" ON public.user_notifications;
CREATE POLICY "user_notifications.update.own"
  ON public.user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notifications.admin.manage" ON public.user_notifications;
CREATE POLICY "user_notifications.admin.manage"
  ON public.user_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- 2) PROFILES: missing columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS investigative_style text,
  ADD COLUMN IF NOT EXISTS first_login_completed boolean DEFAULT false;

-- 3) RPC: is_admin(user_id)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin'::app_role
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

COMMENT ON FUNCTION public.is_admin(uuid) IS 'Returns true if the user has admin role.';

-- 4) RPC: consume_credit(user_id, credit_type, amount)
-- Adapted for existing user_credits schema with free_buzz_credit and free_buzz_map_credit
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id uuid, p_credit_type text, p_amount int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ok boolean := false;
  current_balance int;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN false;
  END IF;

  -- Ensure user_credits row exists
  INSERT INTO public.user_credits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Atomic decrement based on credit_type
  IF p_credit_type = 'buzz' THEN
    UPDATE public.user_credits
    SET free_buzz_credit = free_buzz_credit - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
      AND free_buzz_credit >= p_amount
    RETURNING true INTO ok;
  ELSIF p_credit_type = 'buzz_map' THEN
    UPDATE public.user_credits
    SET free_buzz_map_credit = free_buzz_map_credit - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
      AND free_buzz_map_credit >= p_amount
    RETURNING true INTO ok;
  ELSE
    RETURN false;
  END IF;

  RETURN COALESCE(ok, false);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_credit(uuid, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_credit(uuid, text, int) TO authenticated;

COMMENT ON FUNCTION public.consume_credit(uuid, text, int) IS 'Atomically consumes credits if balance is sufficient. Supports buzz and buzz_map types.';