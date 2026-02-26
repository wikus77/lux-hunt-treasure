-- ============================================================================
-- ROLLBACK: email pipeline auth + log (ripristina funzioni a lettura auth_token, rimuove log)
-- Eseguire solo per annullare 20260226120000_email_pipeline_auth_and_log.sql
-- ============================================================================

-- Ripristino send_marker_prize_email_now (legge auth_token, no http_outbound_log)
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
  IF v_user_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.email_sends (template_id, recipient_user_id, related_type, related_id, status)
  VALUES ('marker_physical_prize', v_user_id, 'prize_claim', p_claim_id, 'queued')
  RETURNING id INTO v_email_send_id;

  SELECT base_url, auth_token INTO v_base_url, v_auth_token FROM public.email_send_config LIMIT 1;
  IF v_base_url IS NULL OR trim(v_base_url) = '' OR v_auth_token IS NULL OR trim(v_auth_token) = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    RETURN;
  END IF;

  v_url := trim(trailing '/' from v_base_url) || '/functions/v1/send-marker-prize-email';
  v_headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_auth_token);
  v_body := jsonb_build_object('user_id', v_user_id, 'prize_claim_id', p_claim_id, 'email_send_id', v_email_send_id);

  BEGIN
    SELECT net.http_post(url := v_url, headers := v_headers, body := v_body) INTO v_request_id;
    UPDATE public.email_sends SET error_code = 'pg_net:' || coalesce(v_request_id::text, 'ok') WHERE id = v_email_send_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
END;
$$;

-- Ripristino send_final_shoot_winner_email_now (legge auth_token, no http_outbound_log)
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
  v_headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_auth_token);
  v_body := jsonb_build_object('user_id', p_winner_user_id, 'mission_id', p_mission_id, 'won_at', p_won_at, 'email_send_id', v_email_send_id);

  BEGIN
    SELECT net.http_post(url := v_url, headers := v_headers, body := v_body) INTO v_request_id;
    UPDATE public.email_sends SET error_code = 'pg_net:' || coalesce(v_request_id::text, 'ok') WHERE id = v_email_send_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
END;
$$;

DROP TABLE IF EXISTS public.http_outbound_log;
