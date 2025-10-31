-- Migration: Create rank_history table for audit trail
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Create table
CREATE TABLE IF NOT EXISTS public.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_rank_id INT REFERENCES agent_ranks(id),
  new_rank_id INT NOT NULL REFERENCES agent_ranks(id),
  delta_pe INT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rank_history_user_id ON rank_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_history_new_rank ON rank_history (new_rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_created_at ON rank_history (created_at DESC);

-- RLS Policies
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
DROP POLICY IF EXISTS rank_history_self_read ON rank_history;
CREATE POLICY rank_history_self_read ON rank_history
  FOR SELECT USING (auth.uid() = user_id);

-- Only service_role can insert
DROP POLICY IF EXISTS rank_history_service_insert ON rank_history;
CREATE POLICY rank_history_service_insert ON rank_history
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- Admins can view all history
DROP POLICY IF EXISTS rank_history_admin_read ON rank_history;
CREATE POLICY rank_history_admin_read ON rank_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
