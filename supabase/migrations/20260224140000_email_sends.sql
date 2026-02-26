-- ============================================================================
-- HARDENING PHASE 4: Log invii email (email_sends)
-- From/CC: contact@m1ssion.com (gestito in Edge). Nessun log segreti.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  recipient_user_id UUID NOT NULL,
  recipient_email TEXT,
  related_type TEXT,
  related_id UUID,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  error_code TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_sends_template_created ON public.email_sends(template_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_recipient_created ON public.email_sends(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_related ON public.email_sends(related_type, related_id);

ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_sends_select_none"
ON public.email_sends FOR SELECT USING (false);

CREATE POLICY "email_sends_insert_service"
ON public.email_sends FOR INSERT WITH CHECK (true);

CREATE POLICY "email_sends_update_service"
ON public.email_sends FOR UPDATE USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.email_sends TO service_role;

COMMENT ON TABLE public.email_sends IS 'Phase 4: log invii email (final_shoot_winner, marker_physical_prize). From/CC contact@m1ssion.com in Edge.';

-- Config per invocazione Edge da trigger (base_url + token; valorizzare in dashboard)
CREATE TABLE IF NOT EXISTS public.email_send_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  base_url TEXT,
  auth_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.email_send_config (id, base_url, auth_token)
VALUES ('default', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.email_send_config ENABLE ROW LEVEL SECURITY;
-- Solo owner/trigger (SECURITY DEFINER) e service_role leggono la config
CREATE POLICY "email_send_config_read_owner_service"
ON public.email_send_config FOR SELECT
USING (current_user IN ('postgres', 'supabase_admin') OR current_setting('request.jwt.claim.role', true) = 'service_role');
GRANT SELECT ON public.email_send_config TO service_role;

COMMENT ON TABLE public.email_send_config IS 'Phase 4: base_url (Supabase project URL) e auth_token per invocare Edge email da trigger. Valorizzare dopo deploy.';
