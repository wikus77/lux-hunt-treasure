-- ============================================================================
-- FIX: Email trigger → INSERT email_sends + direct net.http_post (no queue/response table)
-- pg_net: http_post returns bigint (request_id). We always log a row in email_sends.
-- Edge updates status to sent/failed via email_send_id in body.
-- ============================================================================

-- 1) RPC: send_marker_prize_email_now(p_claim_id) — INSERT email_sends, then http_post
CREATE OR REPLACE FUNCTION public.send_marker_prize_email_now(p_claim_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, net, pg_temp
AS $$
DECLARE
  v_email_send_id uuid;
  v_base_url text;
  v_auth_token text;
  v_user_id uuid;
  v_request_id bigint;
  v_headers jsonb;
  v_body jsonb;
  v_url text;
BEGIN
  SELECT user_id INTO v_user_id FROM public.prize_claims WHERE id = p_claim_id LIMIT 1;
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.email_sends (template_id, recipient_user_id, related_type, related_id, status)
  VALUES ('marker_physical_prize', v_user_id, 'prize_claim', p_claim_id, 'queued')
  RETURNING id INTO v_email_send_id;

  SELECT base_url, auth_token INTO v_base_url, v_auth_token FROM public.email_send_config LIMIT 1;
  IF v_base_url IS NULL OR trim(v_base_url) = '' OR v_auth_token IS NULL OR trim(v_auth_token) = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    RETURN;
  END IF;

  v_url := trim(trailing '/' from v_base_url) || '/functions/v1/send-marker-prize-email';
  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || v_auth_token
  );
  v_body := jsonb_build_object(
    'user_id', v_user_id,
    'prize_claim_id', p_claim_id,
    'email_send_id', v_email_send_id
  );

  BEGIN
    SELECT net.http_post(url := v_url, headers := v_headers, body := v_body) INTO v_request_id;
    UPDATE public.email_sends SET error_code = 'pg_net:' || coalesce(v_request_id::text, 'ok') WHERE id = v_email_send_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
END;
$$;

COMMENT ON FUNCTION public.send_marker_prize_email_now(uuid) IS 'Phase 4 fix: INSERT email_sends + direct net.http_post for marker prize. Edge updates status.';

-- 2) RPC: send_final_shoot_winner_email_now(p_mission_id, p_winner_user_id, p_won_at)
CREATE OR REPLACE FUNCTION public.send_final_shoot_winner_email_now(
  p_mission_id uuid,
  p_winner_user_id uuid,
  p_won_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, net, pg_temp
AS $$
DECLARE
  v_email_send_id uuid;
  v_base_url text;
  v_auth_token text;
  v_request_id bigint;
  v_headers jsonb;
  v_body jsonb;
  v_url text;
BEGIN
  INSERT INTO public.email_sends (template_id, recipient_user_id, related_type, related_id, status)
  VALUES ('final_shoot_winner', p_winner_user_id, 'final_shoot_winner', p_mission_id, 'queued')
  RETURNING id INTO v_email_send_id;

  SELECT base_url, auth_token INTO v_base_url, v_auth_token FROM public.email_send_config LIMIT 1;
  IF v_base_url IS NULL OR trim(v_base_url) = '' OR v_auth_token IS NULL OR trim(v_auth_token) = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    RETURN;
  END IF;

  v_url := trim(trailing '/' from v_base_url) || '/functions/v1/send-final-shoot-winner-email';
  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || v_auth_token
  );
  v_body := jsonb_build_object(
    'user_id', p_winner_user_id,
    'mission_id', p_mission_id,
    'won_at', p_won_at,
    'email_send_id', v_email_send_id
  );

  BEGIN
    SELECT net.http_post(url := v_url, headers := v_headers, body := v_body) INTO v_request_id;
    UPDATE public.email_sends SET error_code = 'pg_net:' || coalesce(v_request_id::text, 'ok') WHERE id = v_email_send_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
END;
$$;

COMMENT ON FUNCTION public.send_final_shoot_winner_email_now(uuid,uuid,timestamptz) IS 'Phase 4 fix: INSERT email_sends + direct net.http_post for final shoot winner. Edge updates status.';

-- 3) Trigger function marker: call RPC now
CREATE OR REPLACE FUNCTION public.queue_and_invoke_marker_prize_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  PERFORM public.send_marker_prize_email_now(NEW.id);
  RETURN NEW;
END;
$$;

-- 4) Trigger function final shoot: call RPC now
CREATE OR REPLACE FUNCTION public.queue_and_invoke_final_shoot_winner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  PERFORM public.send_final_shoot_winner_email_now(NEW.mission_id, NEW.winner_user_id, NEW.won_at);
  RETURN NEW;
END;
$$;
