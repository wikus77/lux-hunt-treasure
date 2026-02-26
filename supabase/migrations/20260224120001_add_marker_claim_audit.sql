-- ============================================================================
-- HARDENING PHASE 2: Marker claim audit table + proof_hash column (add-only)
-- No change to existing logic. Audit insert does not block claim.
-- ============================================================================

-- 1. Add proof_hash to marker_claims (add column only)
ALTER TABLE public.marker_claims
ADD COLUMN IF NOT EXISTS proof_hash TEXT;

COMMENT ON COLUMN public.marker_claims.proof_hash IS 'SHA256(marker_id||user_id||claimed_at) hex';

-- 2. New audit table
CREATE TABLE IF NOT EXISTS public.marker_claim_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id TEXT,
  user_id UUID,
  claim_id UUID,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marker_claim_audit_marker ON public.marker_claim_audit(marker_id);
CREATE INDEX IF NOT EXISTS idx_marker_claim_audit_created ON public.marker_claim_audit(created_at DESC);

ALTER TABLE public.marker_claim_audit ENABLE ROW LEVEL SECURITY;

-- INSERT from service_role only (Edge uses admin client)
CREATE POLICY "marker_claim_audit_insert_service_role"
ON public.marker_claim_audit FOR INSERT WITH CHECK (true);

CREATE POLICY "marker_claim_audit_select_service_role"
ON public.marker_claim_audit FOR SELECT USING (false);

GRANT INSERT ON public.marker_claim_audit TO service_role;
GRANT SELECT ON public.marker_claim_audit TO service_role;
