-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX: user_clues table - Add missing columns, constraints, and RLS policies
-- FIX: Enrollment visibility issues

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: FIX user_clues TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- description_it column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_clues' AND column_name = 'description_it') THEN
    ALTER TABLE public.user_clues ADD COLUMN description_it TEXT;
  END IF;
  
  -- clue_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_clues' AND column_name = 'clue_type') THEN
    ALTER TABLE public.user_clues ADD COLUMN clue_type TEXT DEFAULT 'location';
  END IF;
  
  -- clue_category column (for prize_clues compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_clues' AND column_name = 'clue_category') THEN
    ALTER TABLE public.user_clues ADD COLUMN clue_category TEXT DEFAULT 'location';
  END IF;
  
  -- week column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_clues' AND column_name = 'week') THEN
    ALTER TABLE public.user_clues ADD COLUMN week INTEGER DEFAULT 1;
  END IF;
END $$;

-- 🔥 CRITICAL FIX: Add UNIQUE constraint for UPSERT to work
-- First, remove any duplicates
DELETE FROM public.user_clues a
WHERE a.ctid <> (
  SELECT min(b.ctid)
  FROM public.user_clues b
  WHERE a.user_id = b.user_id AND a.clue_id = b.clue_id
);

-- Now add the unique constraint
ALTER TABLE public.user_clues 
DROP CONSTRAINT IF EXISTS user_clues_user_id_clue_id_key;

ALTER TABLE public.user_clues 
ADD CONSTRAINT user_clues_user_id_clue_id_key UNIQUE (user_id, clue_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: FIX RLS POLICIES for user_clues (allow INSERT/UPDATE/UPSERT)
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own clues" ON public.user_clues;
DROP POLICY IF EXISTS "Users can insert own clues" ON public.user_clues;
DROP POLICY IF EXISTS "Users can update own clues" ON public.user_clues;
DROP POLICY IF EXISTS "Allow access to owner" ON public.user_clues;
DROP POLICY IF EXISTS "System can insert clues for users" ON public.user_clues;
DROP POLICY IF EXISTS "Admins can manage all clues" ON public.user_clues;
DROP POLICY IF EXISTS "Service role can manage user clues" ON public.user_clues;

-- Ensure RLS is enabled
ALTER TABLE public.user_clues ENABLE ROW LEVEL SECURITY;

-- Users can read their own clues
CREATE POLICY "user_clues_select_own"
  ON public.user_clues FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own clues
CREATE POLICY "user_clues_insert_own"
  ON public.user_clues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own clues (needed for UPSERT)
CREATE POLICY "user_clues_update_own"
  ON public.user_clues FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 🔥 CRITICAL: Service role (edge functions) can manage ALL clues
-- This is needed because handle-buzz-press uses service_role_key
CREATE POLICY "user_clues_service_role_all"
  ON public.user_clues FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: FIX prize_clues TABLE - Add missing columns for Phase 5 Clue Engine
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  -- type column: LOCATION or PRIZE
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'prize_clues' AND column_name = 'type') THEN
    ALTER TABLE public.prize_clues ADD COLUMN type TEXT DEFAULT 'LOCATION' 
      CHECK (type IN ('LOCATION', 'PRIZE'));
  END IF;
  
  -- difficulty column: LOW, MEDIUM, HIGH, INTELLIGENCE
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'prize_clues' AND column_name = 'difficulty') THEN
    ALTER TABLE public.prize_clues ADD COLUMN difficulty TEXT DEFAULT 'MEDIUM'
      CHECK (difficulty IN ('LOW', 'MEDIUM', 'HIGH', 'INTELLIGENCE'));
  END IF;
  
  -- cipher_type column for intelligence-grade clues
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'prize_clues' AND column_name = 'cipher_type') THEN
    ALTER TABLE public.prize_clues ADD COLUMN cipher_type TEXT
      CHECK (cipher_type IS NULL OR cipher_type IN (
        'ANAGRAM', 'ACROSTIC', 'CAESAR', 'SEMANTIC_SHIFT', 
        'NUMERIC_CODE', 'SYMBOLIC', 'NONE'
      ));
  END IF;
END $$;

-- Update existing clues to have type based on clue_category
UPDATE public.prize_clues 
SET type = CASE 
  WHEN clue_category = 'prize' THEN 'PRIZE'
  ELSE 'LOCATION'
END
WHERE type IS NULL OR type = '';

-- Set difficulty based on week
UPDATE public.prize_clues 
SET difficulty = CASE 
  WHEN week = 1 THEN 'LOW'
  WHEN week = 2 THEN 'MEDIUM'
  WHEN week = 3 THEN 'HIGH'
  WHEN week = 4 THEN 'INTELLIGENCE'
  ELSE 'MEDIUM'
END
WHERE difficulty IS NULL OR difficulty = '';

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: Indexes for performance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_clues_clue_id ON public.user_clues (clue_id);
CREATE INDEX IF NOT EXISTS idx_prize_clues_type ON public.prize_clues (type);
CREATE INDEX IF NOT EXISTS idx_prize_clues_difficulty ON public.prize_clues (difficulty);
CREATE INDEX IF NOT EXISTS idx_prize_clues_week_type ON public.prize_clues (week, type);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 5: Grant permissions
-- ═══════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE ON public.user_clues TO authenticated;
GRANT ALL ON public.user_clues TO service_role;

-- Log completion
DO $$ BEGIN RAISE NOTICE '✅ Migration 20251213_fix_user_clues_and_enrollment completed successfully'; END $$;




