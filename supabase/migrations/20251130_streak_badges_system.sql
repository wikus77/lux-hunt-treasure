-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- STREAK BADGES SYSTEM - Enhancement to existing daily check-in
-- This migration adds streak badges without modifying existing functionality

-- 1. INSERT STREAK BADGES INTO CATALOG (only if they don't exist)
INSERT INTO public.badges (name, description, icon)
SELECT * FROM (VALUES
  ('streak_5_days', '🔥 Fiamma Nascente - 5 giorni consecutivi', '🔥'),
  ('streak_10_days', '🔥🔥 Fiamma Ardente - 10 giorni consecutivi', '🔥'),
  ('streak_15_days', '🔥🔥🔥 Inferno - 15 giorni consecutivi', '🌋'),
  ('streak_25_days', '⚡ Leggenda Streak - 25 giorni consecutivi', '⚡'),
  ('streak_30_days', '🏆 Campione Missione - 30 giorni consecutivi', '🏆'),
  ('streak_50_days', '💎 Diamante - 50 giorni consecutivi', '💎'),
  ('streak_100_days', '👑 Re della Streak - 100 giorni consecutivi', '👑')
) AS new_badges(name, description, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM public.badges WHERE badges.name = new_badges.name
);

-- 2. CREATE FUNCTION TO AWARD STREAK BADGES (replace if exists)
CREATE OR REPLACE FUNCTION public.award_streak_badge(
  p_user_id UUID,
  p_streak_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_id UUID;
  v_badge_name TEXT;
  v_badge_icon TEXT;
  v_badges_awarded JSONB := '[]'::JSONB;
  v_milestone INTEGER;
  v_milestones INTEGER[] := ARRAY[5, 10, 15, 25, 30, 50, 100];
BEGIN
  -- Check each milestone
  FOREACH v_milestone IN ARRAY v_milestones
  LOOP
    IF p_streak_days >= v_milestone THEN
      -- Get badge info
      SELECT badge_id, name, icon INTO v_badge_id, v_badge_name, v_badge_icon
      FROM public.badges
      WHERE name = 'streak_' || v_milestone || '_days';
      
      IF v_badge_id IS NOT NULL THEN
        -- Award badge if not already awarded
        INSERT INTO public.user_badges (user_id, badge_id, source)
        VALUES (p_user_id, v_badge_id, 'streak_milestone')
        ON CONFLICT (user_id, badge_id, source) DO NOTHING;
        
        -- If inserted, add to result
        IF FOUND THEN
          v_badges_awarded := v_badges_awarded || jsonb_build_object(
            'badge_id', v_badge_id,
            'name', v_badge_name,
            'icon', v_badge_icon,
            'milestone', v_milestone
          );
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN v_badges_awarded;
END;
$$;

-- 3. CREATE FUNCTION TO GET USER STREAK INFO
CREATE OR REPLACE FUNCTION public.get_user_streak_info(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_profile RECORD;
  v_next_milestone INTEGER;
  v_days_to_next INTEGER;
  v_milestones INTEGER[] := ARRAY[5, 10, 15, 25, 30, 50, 100];
  v_streak INTEGER;
BEGIN
  -- Get profile data
  SELECT current_streak_days, longest_streak_days, last_check_in_date
  INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  v_streak := COALESCE(v_profile.current_streak_days, 0);
  
  -- Find next milestone
  v_next_milestone := NULL;
  FOR i IN 1..array_length(v_milestones, 1)
  LOOP
    IF v_streak < v_milestones[i] THEN
      v_next_milestone := v_milestones[i];
      EXIT;
    END IF;
  END LOOP;
  
  v_days_to_next := COALESCE(v_next_milestone - v_streak, 0);
  
  -- Calculate XP multiplier (streak bonus)
  -- Base: 10 XP, Bonus: +5% per streak day, max 50%
  
  RETURN jsonb_build_object(
    'current_streak', v_streak,
    'longest_streak', COALESCE(v_profile.longest_streak_days, 0),
    'last_check_in', v_profile.last_check_in_date,
    'next_milestone', v_next_milestone,
    'days_to_next_milestone', v_days_to_next,
    'xp_multiplier', LEAST(1.0 + (v_streak * 0.05), 1.5),
    'm1u_bonus_percent', LEAST(v_streak * 2, 30) -- +2% M1U per streak day, max 30%
  );
END;
$$;

-- 4. CREATE TRIGGER TO AUTO-AWARD BADGES ON STREAK UPDATE
CREATE OR REPLACE FUNCTION public.trigger_check_streak_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run if streak increased
  IF NEW.current_streak_days > COALESCE(OLD.current_streak_days, 0) THEN
    PERFORM public.award_streak_badge(NEW.id, NEW.current_streak_days);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS check_streak_badges_trigger ON public.profiles;
CREATE TRIGGER check_streak_badges_trigger
  AFTER UPDATE OF current_streak_days ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_streak_badges();

-- 5. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.award_streak_badge TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_streak_info TO authenticated;

COMMENT ON FUNCTION public.award_streak_badge IS 'Awards streak milestone badges to user';
COMMENT ON FUNCTION public.get_user_streak_info IS 'Returns detailed streak information for user';


