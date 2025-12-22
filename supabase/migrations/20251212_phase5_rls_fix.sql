-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- PHASE 5: FIX RLS Policies - Allow authenticated users to read/write

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read mission features cache" ON mission_features_cache;
DROP POLICY IF EXISTS "Service role can manage mission features cache" ON mission_features_cache;
DROP POLICY IF EXISTS "Users can read their own clue metadata" ON mission_clue_metadata;
DROP POLICY IF EXISTS "Service role can manage clue metadata" ON mission_clue_metadata;
DROP POLICY IF EXISTS "Anyone can read clue templates" ON clue_templates;
DROP POLICY IF EXISTS "Anyone can read bridge metaphors" ON bridge_metaphors;

-- ═══════════════════════════════════════════════════════════════════════════
-- mission_features_cache: Everyone can read, service role can write
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "Allow read mission features cache"
  ON mission_features_cache FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow insert mission features cache"
  ON mission_features_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update mission features cache"
  ON mission_features_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- mission_clue_metadata: Users can read/write their own data
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "Allow users read own clue metadata"
  ON mission_clue_metadata FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users insert own clue metadata"
  ON mission_clue_metadata FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users update own clue metadata"
  ON mission_clue_metadata FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- clue_templates: Everyone can read
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "Allow read clue templates"
  ON clue_templates FOR SELECT
  TO authenticated, anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- bridge_metaphors: Everyone can read
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "Allow read bridge metaphors"
  ON bridge_metaphors FOR SELECT
  TO authenticated, anon
  USING (true);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION extract_location_features TO authenticated, anon;
GRANT EXECUTE ON FUNCTION calculate_day_clarity TO authenticated, anon;
GRANT EXECUTE ON FUNCTION determine_is_fake TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_max_leak_risk TO authenticated, anon;



