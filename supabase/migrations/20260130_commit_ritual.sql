-- ============================================================================
-- COMMIT RITUAL — "THE COMMIT" (7s ritual, +5/-5 M1U, 1/day per user)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: commit_ritual_daily — Track daily ritual attempts                     │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.commit_ritual_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_date DATE NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'fail')),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  delta_m1u INTEGER NOT NULL CHECK (delta_m1u IN (-5, 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Enforce 1 ritual per user per day
  UNIQUE (user_id, ritual_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_commit_ritual_user_date 
  ON public.commit_ritual_daily(user_id, ritual_date DESC);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ RLS: Only owner can read/insert their own records                            │
-- └──────────────────────────────────────────────────────────────────────────────┘

ALTER TABLE public.commit_ritual_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rituals" ON public.commit_ritual_daily;
CREATE POLICY "Users can view own rituals" ON public.commit_ritual_daily
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own rituals" ON public.commit_ritual_daily;
CREATE POLICY "Users can insert own rituals" ON public.commit_ritual_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: apply_commit_ritual — Atomic ritual execution                      │
-- │                                                                              │
-- │ Server-side validation:                                                      │
-- │   - duration_ms >= 7000 → success (+5 M1U)                                   │
-- │   - duration_ms < 7000  → fail (-5 M1U)                                      │
-- │   - 1 attempt per day per user                                               │
-- │   - Requires balance >= 5 to attempt (prevent negative exploitation)         │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.apply_commit_ritual(INTEGER);

CREATE OR REPLACE FUNCTION public.apply_commit_ritual(p_duration_ms INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ritual_date DATE;
  v_outcome TEXT;
  v_delta INTEGER;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_existing_ritual RECORD;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'not_authenticated',
      'message', 'Utente non autenticato.'
    );
  END IF;
  
  -- Determine ritual date (Europe/Rome timezone for consistency)
  v_ritual_date := (now() AT TIME ZONE 'Europe/Rome')::DATE;
  
  -- Check if already done today
  SELECT * INTO v_existing_ritual
  FROM public.commit_ritual_daily
  WHERE user_id = v_user_id AND ritual_date = v_ritual_date;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'already_done_today', true,
      'error_code', 'already_done_today',
      'message', 'Già eseguito oggi.',
      'previous_outcome', v_existing_ritual.outcome,
      'previous_delta', v_existing_ritual.delta_m1u
    );
  END IF;
  
  -- Get current M1U balance
  SELECT COALESCE(m1_units, 0) INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;
  
  -- Check minimum balance requirement (must have at least 5 M1U to risk)
  IF v_current_balance < 5 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'insufficient_funds',
      'message', 'Saldo insufficiente per il rituale (minimo 5 M1U).',
      'current_balance', v_current_balance,
      'required_balance', 5
    );
  END IF;
  
  -- Server-side outcome determination (SINGLE SOURCE OF TRUTH)
  -- Success ONLY if duration >= 7000ms (7.0s full)
  IF p_duration_ms >= 7000 THEN
    v_outcome := 'success';
    v_delta := 5;
  ELSE
    v_outcome := 'fail';
    v_delta := -5;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + v_delta;
  
  -- Ensure balance doesn't go below 0 (defensive)
  IF v_new_balance < 0 THEN
    v_new_balance := 0;
    v_delta := -v_current_balance; -- Adjust delta to only take what's available
  END IF;
  
  -- Update M1U balance atomically
  UPDATE public.profiles
  SET m1_units = v_new_balance,
      updated_at = now()
  WHERE id = v_user_id;
  
  -- Insert ritual record
  INSERT INTO public.commit_ritual_daily (
    user_id,
    ritual_date,
    outcome,
    duration_ms,
    delta_m1u
  ) VALUES (
    v_user_id,
    v_ritual_date,
    v_outcome,
    p_duration_ms,
    v_delta
  );
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'outcome', v_outcome,
    'delta', v_delta,
    'new_balance', v_new_balance,
    'duration_ms', p_duration_ms,
    'ritual_date', v_ritual_date,
    'already_done_today', false
  );
  
EXCEPTION WHEN unique_violation THEN
  -- Race condition: another request completed first
  RETURN jsonb_build_object(
    'success', false,
    'already_done_today', true,
    'error_code', 'already_done_today',
    'message', 'Già eseguito oggi (race condition).'
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.apply_commit_ritual(INTEGER) TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: check_commit_ritual_status — Check if ritual available today       │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.check_commit_ritual_status();

CREATE OR REPLACE FUNCTION public.check_commit_ritual_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ritual_date DATE;
  v_current_balance INTEGER;
  v_existing_ritual RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'available', false,
      'error_code', 'not_authenticated'
    );
  END IF;
  
  v_ritual_date := (now() AT TIME ZONE 'Europe/Rome')::DATE;
  
  -- Get current balance
  SELECT COALESCE(m1_units, 0) INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Check if already done today
  SELECT * INTO v_existing_ritual
  FROM public.commit_ritual_daily
  WHERE user_id = v_user_id AND ritual_date = v_ritual_date;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'available', false,
      'already_done_today', true,
      'previous_outcome', v_existing_ritual.outcome,
      'balance', v_current_balance
    );
  END IF;
  
  IF v_current_balance < 5 THEN
    RETURN jsonb_build_object(
      'available', false,
      'insufficient_funds', true,
      'balance', v_current_balance,
      'required', 5
    );
  END IF;
  
  RETURN jsonb_build_object(
    'available', true,
    'balance', v_current_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_commit_ritual_status() TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ COMMENTS                                                                     │
-- └──────────────────────────────────────────────────────────────────────────────┘

COMMENT ON TABLE public.commit_ritual_daily IS 
  'Tracks daily "THE COMMIT" ritual attempts. 1 per user per day.';

COMMENT ON FUNCTION public.apply_commit_ritual IS 
  'Execute THE COMMIT ritual. Server validates duration: >=7000ms = success (+5 M1U), <7000ms = fail (-5 M1U).';

COMMENT ON FUNCTION public.check_commit_ritual_status IS 
  'Check if user can perform ritual today (not done, has >=5 M1U).';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
