-- ============================================================================
-- HARDENING PHASE 4: Trigger AFTER INSERT prize_claims → queue + invoke Edge
-- Best-effort: insert email_sends queued, invoke send-marker-prize-email via pg_net
-- Tabella prize_claims deve esistere (usata da claim-marker-reward).
-- ============================================================================

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

DROP TRIGGER IF EXISTS trigger_email_marker_physical_prize ON public.prize_claims;
CREATE TRIGGER trigger_email_marker_physical_prize
AFTER INSERT ON public.prize_claims
FOR EACH ROW EXECUTE FUNCTION public.queue_and_invoke_marker_prize_email();

COMMENT ON FUNCTION public.queue_and_invoke_marker_prize_email() IS 'Phase 4: queue email_sends + invoke Edge send-marker-prize-email (best-effort).';
