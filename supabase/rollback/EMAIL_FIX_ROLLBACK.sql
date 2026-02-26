-- ============================================================================
-- ROLLBACK: Ripristina funzioni e trigger email Phase 4 (pre-fix pg_net)
-- Eseguire in Supabase SQL Editor se si deve annullare il fix "send_*_email_now".
-- ============================================================================

-- 1) Rimuovi le nuove funzioni "now" (se esistono)
DROP FUNCTION IF EXISTS public.send_marker_prize_email_now(uuid);
DROP FUNCTION IF EXISTS public.send_final_shoot_winner_email_now(uuid, uuid, timestamptz);

-- 2) Ripristina funzione trigger marker prize (originale Phase 4)
CREATE OR REPLACE FUNCTION public.queue_and_invoke_marker_prize_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email_send_id UUID;
  v_base_url TEXT;
  v_auth_token TEXT;
  v_request_id BIGINT;
BEGIN
  INSERT INTO public.email_sends (template_id, recipient_user_id, related_type, related_id, status)
  VALUES ('marker_physical_prize', NEW.user_id, 'prize_claim', NEW.id, 'queued')
  RETURNING id INTO v_email_send_id;

  SELECT base_url, auth_token INTO v_base_url, v_auth_token
  FROM public.email_send_config LIMIT 1;

  IF v_base_url IS NULL OR v_base_url = '' OR v_auth_token IS NULL OR v_auth_token = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    RETURN NEW;
  END IF;

  BEGIN
    SELECT net.http_post(
      url := trim(trailing '/' from v_base_url) || '/functions/v1/send-marker-prize-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_auth_token
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'prize_claim_id', NEW.id,
        'email_send_id', v_email_send_id
      )
    ) INTO v_request_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
  RETURN NEW;
END;
$$;

-- 3) Ripristina funzione trigger final shoot winner (originale Phase 4)
CREATE OR REPLACE FUNCTION public.queue_and_invoke_final_shoot_winner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email_send_id UUID;
  v_base_url TEXT;
  v_auth_token TEXT;
  v_request_id BIGINT;
BEGIN
  INSERT INTO public.email_sends (template_id, recipient_user_id, related_type, related_id, status)
  VALUES ('final_shoot_winner', NEW.winner_user_id, 'final_shoot_winner', NEW.mission_id, 'queued')
  RETURNING id INTO v_email_send_id;

  SELECT base_url, auth_token INTO v_base_url, v_auth_token
  FROM public.email_send_config LIMIT 1;

  IF v_base_url IS NULL OR v_base_url = '' OR v_auth_token IS NULL OR v_auth_token = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    RETURN NEW;
  END IF;

  BEGIN
    SELECT net.http_post(
      url := trim(trailing '/' from v_base_url) || '/functions/v1/send-final-shoot-winner-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_auth_token
      ),
      body := jsonb_build_object(
        'user_id', NEW.winner_user_id,
        'mission_id', NEW.mission_id,
        'won_at', NEW.won_at,
        'email_send_id', v_email_send_id
      )
    ) INTO v_request_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
  END;
  RETURN NEW;
END;
$$;

-- 4) I trigger sono già associati alle funzioni sopra (stesso nome). Nessun DROP/CREATE necessario.
COMMENT ON FUNCTION public.queue_and_invoke_marker_prize_email() IS 'Phase 4: queue email_sends + invoke Edge send-marker-prize-email (best-effort).';
COMMENT ON FUNCTION public.queue_and_invoke_final_shoot_winner_email() IS 'Phase 4: queue email_sends + invoke Edge send-final-shoot-winner-email (best-effort).';
