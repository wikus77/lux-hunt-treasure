-- ============================================================================
-- HARDENING PHASE 2: Final Shoot audit table + proof_hash column (add-only)
-- No change to existing logic. RLS: INSERT via SECURITY DEFINER only.
-- ============================================================================

-- 1. New audit table (no modification to existing tables)
CREATE TABLE IF NOT EXISTS public.final_shoot_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  mission_id UUID,
  user_id UUID,
  attempt_id UUID,
  outcome TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_final_shoot_audit_mission ON public.final_shoot_audit(mission_id);
CREATE INDEX IF NOT EXISTS idx_final_shoot_audit_created ON public.final_shoot_audit(created_at DESC);

ALTER TABLE public.final_shoot_audit ENABLE ROW LEVEL SECURITY;

-- INSERT only via SECURITY DEFINER (execute_final_shoot runs as owner postgres/supabase_admin)
CREATE POLICY "final_shoot_audit_insert_via_rpc"
ON public.final_shoot_audit FOR INSERT
WITH CHECK (current_user IN ('postgres', 'supabase_admin'));

-- SELECT only service_role (no SELECT for authenticated/anon)
CREATE POLICY "final_shoot_audit_select_service_role"
ON public.final_shoot_audit FOR SELECT USING (false);

GRANT INSERT ON public.final_shoot_audit TO service_role;
GRANT SELECT ON public.final_shoot_audit TO service_role;

-- 2. Add proof_hash to final_shoot_winners (add column only)
ALTER TABLE public.final_shoot_winners
ADD COLUMN IF NOT EXISTS proof_hash TEXT;

COMMENT ON COLUMN public.final_shoot_winners.proof_hash IS 'SHA256(mission_id||winner_user_id||attempt_id||won_at||distance_meters) hex';
