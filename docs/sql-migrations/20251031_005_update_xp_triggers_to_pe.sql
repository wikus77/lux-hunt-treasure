-- Migration: Update XP triggers to use award_pulse_energy
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- ============================================
-- 1. BUZZ TRIGGER (+15 PE)
-- ============================================
CREATE OR REPLACE FUNCTION handle_buzz_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  -- Award +15 PE for Buzz activation
  PERFORM award_pulse_energy(
    NEW.user_id,
    15,
    'buzz',
    jsonb_build_object(
      'buzz_id', NEW.id,
      'location', NEW.location,
      'timestamp', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS buzz_awards_xp ON buzz_activations;
DROP TRIGGER IF EXISTS buzz_awards_pe ON buzz_activations;

-- Create new trigger
CREATE TRIGGER buzz_awards_pe
  AFTER INSERT ON buzz_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_pe_award();

-- ============================================
-- 2. BUZZ MAP TRIGGER (+10 PE)
-- ============================================
CREATE OR REPLACE FUNCTION handle_buzz_map_pe_award()
RETURNS TRIGGER AS $$
BEGIN
  -- Award +10 PE for Buzz Map activation
  PERFORM award_pulse_energy(
    NEW.user_id,
    10,
    'buzz_map',
    jsonb_build_object(
      'map_id', NEW.id,
      'timestamp', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS buzz_map_awards_xp ON buzz_map_activations;
DROP TRIGGER IF EXISTS buzz_map_awards_pe ON buzz_map_activations;

-- Create new trigger
CREATE TRIGGER buzz_map_awards_pe
  AFTER INSERT ON buzz_map_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_map_pe_award();

-- ============================================
-- 3. REFERRAL TRIGGER (+25 PE)
-- ============================================
CREATE OR REPLACE FUNCTION handle_referral_pe_award()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_id UUID;
BEGIN
  -- Only award if user was invited by someone
  IF NEW.invited_by_code IS NOT NULL THEN
    -- Find inviter by agent_code
    SELECT id INTO v_inviter_id
    FROM profiles
    WHERE agent_code = NEW.invited_by_code;

    -- Award +25 PE to inviter
    IF FOUND THEN
      PERFORM award_pulse_energy(
        v_inviter_id,
        25,
        'referral',
        jsonb_build_object(
          'invited_user_id', NEW.id,
          'referral_code', NEW.invited_by_code,
          'timestamp', NEW.created_at
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS referral_awards_xp ON profiles;
DROP TRIGGER IF EXISTS referral_awards_pe ON profiles;

-- Create new trigger
CREATE TRIGGER referral_awards_pe
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_pe_award();

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
