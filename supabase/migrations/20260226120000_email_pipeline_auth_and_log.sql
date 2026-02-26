-- ============================================================================
-- EMAIL PIPELINE: fix auth column (auth_token_st | auth_token) + outbound log
-- Rollback: run down migration 20260226120000_down (restore previous function defs).
-- ============================================================================

-- 1) Tabella log (no net._http_response: è composite type, non tabella)
CREATE TABLE IF NOT EXISTS public.http_outbound_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger_name TEXT NOT NULL,
  url TEXT,
  request_id BIGINT,
  request_body JSONB,
  status_code INT,
  response_body JSONB,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_http_outbound_log_created ON public.http_outbound_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_http_outbound_log_trigger ON public.http_outbound_log(trigger_name, created_at DESC);

GRANT SELECT, INSERT ON public.http_outbound_log TO service_role;
COMMENT ON TABLE public.http_outbound_log IS 'Log invocazioni pg_net verso Edge email. request_id da net.http_post; status/response opzionali (raccolti dopo se necessario).';

-- 2) Colonna auth_token_st se assente (produzione può avere auth_token o auth_token_st)
ALTER TABLE public.email_send_config
  ADD COLUMN IF NOT EXISTS auth_token_st TEXT;

-- Sync: copia auth_token → auth_token_st solo se esiste la colonna auth_token (evita errore se in prod c'è solo auth_token_st)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_send_config' AND column_name = 'auth_token'
  ) THEN
    UPDATE public.email_send_config
    SET auth_token_st = COALESCE(NULLIF(trim(auth_token_st), ''), auth_token)
    WHERE id = 'default' AND auth_token IS NOT NULL AND trim(auth_token) <> '';
  END IF;
END $$;

-- 3) RPC marker: legge coalesce(auth_token_st, auth_token); se vuoto non chiama http_post, scrive log errore
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

  SELECT base_url, trim(auth_token_st) INTO v_base_url, v_auth_token
  FROM public.email_send_config LIMIT 1;

  IF v_base_url IS NULL OR trim(v_base_url) = '' OR v_auth_token IS NULL OR trim(v_auth_token) = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    INSERT INTO public.http_outbound_log (trigger_name, url, request_body, error)
    VALUES ('send_marker_prize_email', NULL, jsonb_build_object('claim_id', p_claim_id, 'user_id', v_user_id, 'email_send_id', v_email_send_id), 'config_missing');
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
    INSERT INTO public.http_outbound_log (trigger_name, url, request_id, request_body)
    VALUES ('send_marker_prize_email', v_url, v_request_id, v_body);
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
    INSERT INTO public.http_outbound_log (trigger_name, url, request_body, error)
    VALUES ('send_marker_prize_email', v_url, v_body, SQLERRM);
  END;
END;
$$;

-- 4) RPC final shoot: stessa logica (coalesce token + log)
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

  SELECT base_url, trim(auth_token_st) INTO v_base_url, v_auth_token
  FROM public.email_send_config LIMIT 1;

  IF v_base_url IS NULL OR trim(v_base_url) = '' OR v_auth_token IS NULL OR trim(v_auth_token) = '' THEN
    UPDATE public.email_sends SET status = 'skipped', error_code = 'config_missing' WHERE id = v_email_send_id;
    INSERT INTO public.http_outbound_log (trigger_name, url, request_body, error)
    VALUES ('send_final_shoot_winner_email', NULL, jsonb_build_object('mission_id', p_mission_id, 'winner_user_id', p_winner_user_id, 'won_at', p_won_at, 'email_send_id', v_email_send_id), 'config_missing');
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
    INSERT INTO public.http_outbound_log (trigger_name, url, request_id, request_body)
    VALUES ('send_final_shoot_winner_email', v_url, v_request_id, v_body);
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.email_sends SET status = 'failed', error_code = 'trigger_invoke_failed' WHERE id = v_email_send_id;
    INSERT INTO public.http_outbound_log (trigger_name, url, request_body, error)
    VALUES ('send_final_shoot_winner_email', v_url, v_body, SQLERRM);
  END;
END;
$$;

COMMENT ON FUNCTION public.send_marker_prize_email_now(uuid) IS 'Phase 4: INSERT email_sends + http_post; legge coalesce(auth_token_st,auth_token); log su http_outbound_log.';
COMMENT ON FUNCTION public.send_final_shoot_winner_email_now(uuid,uuid,timestamptz) IS 'Phase 4: INSERT email_sends + http_post; legge coalesce(auth_token_st,auth_token); log su http_outbound_log.';
