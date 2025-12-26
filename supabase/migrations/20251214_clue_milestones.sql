-- Migration: Clue Milestones System
-- Rewards M1U when users reach clue discovery thresholds
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- ============================================
-- 1. CREATE TABLE: user_clue_milestones
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_clue_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL, -- e.g. 'clues_10', 'clues_25', ...
  m1u_amount INT NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent double-claims
  UNIQUE(user_id, milestone_key)
);

-- RLS
ALTER TABLE public.user_clue_milestones ENABLE ROW LEVEL SECURITY;

-- Users can read their own milestones
CREATE POLICY "Users can read own clue milestones"
  ON public.user_clue_milestones FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own milestones (for claiming)
CREATE POLICY "Users can claim own clue milestones"
  ON public.user_clue_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_clue_milestones_user_id ON public.user_clue_milestones(user_id);
CREATE INDEX idx_user_clue_milestones_key ON public.user_clue_milestones(milestone_key);

-- ============================================
-- 2. RPC: claim_clue_milestone (atomic operation)
-- ============================================
CREATE OR REPLACE FUNCTION public.claim_clue_milestone(
  p_milestone_key TEXT,
  p_m1u_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed BOOLEAN;
  v_new_balance INT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already claimed
  SELECT EXISTS(
    SELECT 1 FROM public.user_clue_milestones
    WHERE user_id = v_user_id AND milestone_key = p_milestone_key
  ) INTO v_already_claimed;
  
  IF v_already_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed', 'already_claimed', true);
  END IF;
  
  -- Insert milestone claim
  INSERT INTO public.user_clue_milestones (user_id, milestone_key, m1u_amount)
  VALUES (v_user_id, p_milestone_key, p_m1u_amount);
  
  -- Grant M1U reward
  UPDATE public.profiles
  SET 
    m1_units = COALESCE(m1_units, 0) + p_m1u_amount,
    updated_at = now()
  WHERE id = v_user_id
  RETURNING m1_units INTO v_new_balance;
  
  RETURN jsonb_build_object(
    'success', true,
    'milestone_key', p_milestone_key,
    'm1u_granted', p_m1u_amount,
    'new_balance', v_new_balance,
    'claimed_at', now()
  );
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed', 'already_claimed', true);
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_clue_milestone(TEXT, INT) TO authenticated;

-- ============================================
-- 3. RPC: get_claimed_clue_milestones
-- ============================================
CREATE OR REPLACE FUNCTION public.get_claimed_clue_milestones()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_milestones JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'key', milestone_key,
      'm1u', m1u_amount,
      'claimed_at', claimed_at
    )
  ), '[]'::jsonb)
  INTO v_milestones
  FROM public.user_clue_milestones
  WHERE user_id = v_user_id;
  
  RETURN v_milestones;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_claimed_clue_milestones() TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




