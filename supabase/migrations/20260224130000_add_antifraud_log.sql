-- ============================================================================
-- HARDENING PHASE 3: Antifraud log (Marker-only) — request_id, ip_hash, ua_hash
-- GDPR: only hashes stored; no plain IP/UA. service_role only.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.antifraud_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('marker_claim')),
  user_id UUID NOT NULL,
  marker_id TEXT,
  request_id UUID NOT NULL,
  ip_hash TEXT,
  ua_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_antifraud_log_user_created ON public.antifraud_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_antifraud_log_event_created ON public.antifraud_log(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_antifraud_log_marker_created ON public.antifraud_log(marker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_antifraud_log_request_id ON public.antifraud_log(request_id);

ALTER TABLE public.antifraud_log ENABLE ROW LEVEL SECURITY;

-- INSERT: only service_role (Edge uses admin client)
CREATE POLICY "antifraud_log_insert_service_role"
ON public.antifraud_log FOR INSERT
WITH CHECK (true);

-- No SELECT for authenticated/anon (service_role bypasses RLS when using service key)
CREATE POLICY "antifraud_log_select_none"
ON public.antifraud_log FOR SELECT
USING (false);

GRANT INSERT ON public.antifraud_log TO service_role;
GRANT SELECT ON public.antifraud_log TO service_role;

COMMENT ON TABLE public.antifraud_log IS 'Phase 3: antifraud log marker_claim only; ip_hash/ua_hash SHA256 hex; no plain IP/UA (GDPR).';
