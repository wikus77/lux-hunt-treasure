-- © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
-- Migration: user_daily_free_buzz table
-- Purpose: Track daily free BUZZ usage (1 free per day unified gate)

-- ============================================================================
-- TABLE: user_daily_free_buzz
-- ============================================================================
-- Tracks whether a user has used their daily free BUZZ
-- date_local uses Europe/Rome timezone (YYYY-MM-DD format)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_daily_free_buzz (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_local text NOT NULL,  -- YYYY-MM-DD in Europe/Rome timezone
  free_used boolean DEFAULT true,
  source text DEFAULT 'unknown',  -- 'tier' or 'grant' for audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint: one record per user per day
  CONSTRAINT user_daily_free_buzz_unique UNIQUE (user_id, date_local)
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_user_daily_free_buzz_user_date 
  ON user_daily_free_buzz(user_id, date_local);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE user_daily_free_buzz ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own records
CREATE POLICY "Users can read own daily_free_buzz"
  ON user_daily_free_buzz
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert own daily_free_buzz"
  ON user_daily_free_buzz
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own records
CREATE POLICY "Users can update own daily_free_buzz"
  ON user_daily_free_buzz
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can do anything
CREATE POLICY "Service role full access daily_free_buzz"
  ON user_daily_free_buzz
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- HELPER FUNCTION: Check if user has daily free available
-- ============================================================================

CREATE OR REPLACE FUNCTION has_daily_free_buzz_available(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today text;
  v_record_exists boolean;
BEGIN
  -- Get today's date in Europe/Rome timezone
  v_today := to_char(now() AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD');
  
  -- Check if record exists for today
  SELECT EXISTS (
    SELECT 1 
    FROM user_daily_free_buzz 
    WHERE user_id = p_user_id 
      AND date_local = v_today
      AND free_used = true
  ) INTO v_record_exists;
  
  -- Return TRUE if no record exists (free available), FALSE otherwise
  RETURN NOT v_record_exists;
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Mark daily free as used
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_daily_free_buzz_used(p_user_id uuid, p_source text DEFAULT 'unknown')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today text;
BEGIN
  -- Get today's date in Europe/Rome timezone
  v_today := to_char(now() AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD');
  
  -- Upsert: insert if not exists, do nothing if exists
  INSERT INTO user_daily_free_buzz (user_id, date_local, free_used, source, updated_at)
  VALUES (p_user_id, v_today, true, p_source, now())
  ON CONFLICT (user_id, date_local) 
  DO UPDATE SET 
    free_used = true,
    source = EXCLUDED.source,
    updated_at = now();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'mark_daily_free_buzz_used failed: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_daily_free_buzz_available(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_daily_free_buzz_used(uuid, text) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_daily_free_buzz IS 
  'Tracks daily free BUZZ usage. One free per day per user (unified gate).';

COMMENT ON COLUMN user_daily_free_buzz.date_local IS 
  'Date in Europe/Rome timezone (YYYY-MM-DD format)';

COMMENT ON COLUMN user_daily_free_buzz.source IS 
  'Source of the free buzz: tier or grant';

COMMENT ON FUNCTION has_daily_free_buzz_available(uuid) IS 
  'Check if user can use their daily free BUZZ today';

COMMENT ON FUNCTION mark_daily_free_buzz_used(uuid, text) IS 
  'Mark that user has used their daily free BUZZ today';
