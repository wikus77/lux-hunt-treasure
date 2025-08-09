-- Create QR redeem RPC to award free credits based on scanned code
-- © 2025 NIYVORA KFT –Joseph MULÉ – M1SSION™

-- Safety: ensure required tables exist (no-op if already present)
-- NOTE: These CREATE TABLE statements are commented out intentionally to avoid altering existing schema unexpectedly.
-- They are left here for documentation; the function below relies on existing tables:
--   public.qr_buzz_codes(code text unique, reward_type text, is_used boolean, used_by uuid, used_at timestamptz, expires_at timestamptz, usage_attempts int)
--   public.user_credits(user_id uuid unique, free_buzz_credit int default 0, free_buzz_map_credit int default 0, updated_at timestamptz default now())
--   public.qr_redemption_logs(id uuid, qr_code_id uuid, user_id uuid, success boolean, failure_reason text, reward_granted jsonb, created_at timestamptz)

-- Create or replace the RPC function
CREATE OR REPLACE FUNCTION public.qr_redeem(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(p_code));
  v_qr RECORD;
  v_reward_type text;
  v_reward_value int := 1;
  v_result jsonb;
BEGIN
  -- Require authentication
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status','error','message','not_authenticated');
  END IF;

  -- Find the QR in qr_buzz_codes by exact code
  SELECT * INTO v_qr
  FROM public.qr_buzz_codes
  WHERE code = v_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','error','message','invalid_code');
  END IF;

  -- Expiration check
  IF v_qr.expires_at IS NOT NULL AND v_qr.expires_at < now() THEN
    -- Log attempt
    INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, success, failure_reason, created_at)
    VALUES (v_qr.id, v_user_id, false, 'expired', now());
    RETURN jsonb_build_object('status','error','message','expired');
  END IF;

  -- Idempotency: already used
  IF v_qr.is_used THEN
    -- Log as already claimed (idempotent)
    INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, success, failure_reason, created_at)
    VALUES (v_qr.id, v_user_id, false, 'already_used', now());

    IF v_qr.used_by = v_user_id THEN
      RETURN jsonb_build_object('status','already_claimed');
    ELSE
      RETURN jsonb_build_object('status','already_claimed');
    END IF;
  END IF;

  -- Normalize reward type mapping to frontend expectations
  v_reward_type := CASE 
    WHEN v_qr.reward_type IN ('buzz','buzz_credit') THEN 'buzz_credit'
    WHEN v_qr.reward_type IN ('buzz_map','buzz_map_credit') THEN 'buzz_map_credit'
    ELSE COALESCE(v_qr.reward_type, 'buzz_credit')
  END;

  -- Award credit(s)
  IF v_reward_type = 'buzz_credit' THEN
    INSERT INTO public.user_credits (user_id, free_buzz_credit)
    VALUES (v_user_id, v_reward_value)
    ON CONFLICT (user_id) DO UPDATE
      SET free_buzz_credit = public.user_credits.free_buzz_credit + EXCLUDED.free_buzz_credit,
          updated_at = now();
  ELSIF v_reward_type = 'buzz_map_credit' THEN
    INSERT INTO public.user_credits (user_id, free_buzz_map_credit)
    VALUES (v_user_id, v_reward_value)
    ON CONFLICT (user_id) DO UPDATE
      SET free_buzz_map_credit = public.user_credits.free_buzz_map_credit + EXCLUDED.free_buzz_map_credit,
          updated_at = now();
  ELSE
    -- Unknown reward types are treated as error
    INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, success, failure_reason, created_at)
    VALUES (v_qr.id, v_user_id, false, 'unknown_reward_type', now());
    RETURN jsonb_build_object('status','error','message','unknown_reward_type');
  END IF;

  -- Mark QR as used (idempotent protection with WHERE clause)
  UPDATE public.qr_buzz_codes
  SET is_used = true,
      used_by = v_user_id,
      used_at = now(),
      usage_attempts = COALESCE(usage_attempts, 0) + 1
  WHERE id = v_qr.id AND is_used = false;

  -- Log success
  INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, success, failure_reason, reward_granted, created_at)
  VALUES (
    v_qr.id,
    v_user_id,
    true,
    NULL,
    jsonb_build_object('reward_type', v_reward_type, 'reward_value', v_reward_value),
    now()
  );

  v_result := jsonb_build_object('status','ok','reward_type', v_reward_type, 'reward_value', v_reward_value);
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Best effort logging
  BEGIN
    INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, success, failure_reason, created_at)
    VALUES (COALESCE(v_qr.id, gen_random_uuid()), v_user_id, false, SQLERRM, now());
  EXCEPTION WHEN OTHERS THEN
    -- ignore logging failures
    NULL;
  END;
  RETURN jsonb_build_object('status','error','message','internal_error');
END;
$function$;

-- Optional: Ensure only authenticated users can execute (function is SECURITY DEFINER)
REVOKE ALL ON FUNCTION public.qr_redeem(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.qr_redeem(text) TO authenticated;
