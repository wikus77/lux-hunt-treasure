-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- PE DAILY AWARDS SYSTEM - Tabella e RPC per limiti giornalieri PE
-- FASE 1.2 del sistema PE unificato

-- ============================================================================
-- 1. TABELLA: pe_daily_awards - Traccia le azioni giornaliere per limiti
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pe_daily_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  pe_awarded INTEGER NOT NULL,
  award_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata opzionale per debug/analytics
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes per query veloci
CREATE INDEX IF NOT EXISTS idx_pe_daily_awards_user_date 
  ON public.pe_daily_awards (user_id, award_date);
CREATE INDEX IF NOT EXISTS idx_pe_daily_awards_user_action_date 
  ON public.pe_daily_awards (user_id, action_type, award_date);
CREATE INDEX IF NOT EXISTS idx_pe_daily_awards_date 
  ON public.pe_daily_awards (award_date);

-- Enable RLS
ALTER TABLE public.pe_daily_awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Solo l'utente può vedere i propri record
DROP POLICY IF EXISTS pe_daily_select_own ON public.pe_daily_awards;
CREATE POLICY pe_daily_select_own ON public.pe_daily_awards
  FOR SELECT USING (auth.uid() = user_id);

-- Service role può fare tutto
DROP POLICY IF EXISTS pe_daily_service_all ON public.pe_daily_awards;
CREATE POLICY pe_daily_service_all ON public.pe_daily_awards
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. RPC: check_pe_daily_limit - Verifica se l'utente può ricevere PE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_pe_daily_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_daily_limit INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_current_count INTEGER;
  v_can_award BOOLEAN;
BEGIN
  -- Conta quante volte l'utente ha ricevuto PE per questa azione oggi
  SELECT COUNT(*)
  INTO v_current_count
  FROM pe_daily_awards
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND award_date = CURRENT_DATE;

  -- Può ricevere se non ha raggiunto il limite
  v_can_award := v_current_count < p_daily_limit;

  RETURN jsonb_build_object(
    'can_award', v_can_award,
    'current_count', v_current_count,
    'daily_limit', p_daily_limit,
    'remaining', GREATEST(0, p_daily_limit - v_current_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute a authenticated users
GRANT EXECUTE ON FUNCTION public.check_pe_daily_limit(UUID, TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- 3. RPC: record_pe_daily_action - Registra un'azione PE giornaliera
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_pe_daily_action(
  p_user_id UUID,
  p_action_type TEXT,
  p_pe_awarded INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO pe_daily_awards (user_id, action_type, pe_awarded, metadata)
  VALUES (p_user_id, p_action_type, p_pe_awarded, p_metadata)
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'action_type', p_action_type,
    'pe_awarded', p_pe_awarded
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute a authenticated users
GRANT EXECUTE ON FUNCTION public.record_pe_daily_action(UUID, TEXT, INTEGER, JSONB) TO authenticated;

-- ============================================================================
-- 4. RPC: get_pe_daily_stats - Statistiche giornaliere PE dell'utente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pe_daily_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_today_total INTEGER;
  v_actions_breakdown JSONB;
BEGIN
  -- Totale PE oggi
  SELECT COALESCE(SUM(pe_awarded), 0)
  INTO v_today_total
  FROM pe_daily_awards
  WHERE user_id = p_user_id
    AND award_date = CURRENT_DATE;

  -- Breakdown per azione
  SELECT COALESCE(
    jsonb_object_agg(action_type, count),
    '{}'::jsonb
  )
  INTO v_actions_breakdown
  FROM (
    SELECT action_type, COUNT(*) as count
    FROM pe_daily_awards
    WHERE user_id = p_user_id
      AND award_date = CURRENT_DATE
    GROUP BY action_type
  ) t;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'date', CURRENT_DATE,
    'total_pe_today', v_today_total,
    'actions_breakdown', v_actions_breakdown
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute a authenticated users
GRANT EXECUTE ON FUNCTION public.get_pe_daily_stats(UUID) TO authenticated;

-- ============================================================================
-- 5. CLEANUP: Funzione per pulire record vecchi (>30 giorni)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_pe_daily_awards()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM pe_daily_awards
  WHERE award_date < CURRENT_DATE - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

