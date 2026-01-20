-- Add progress columns to user_xp table
ALTER TABLE public.user_xp 
ADD COLUMN IF NOT EXISTS buzz_xp_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS map_xp_progress INTEGER DEFAULT 0;

-- Update the award_xp function to handle progress tracking
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_xp_amount integer, p_xp_type text DEFAULT 'total')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_xp_record RECORD;
  new_total_xp INTEGER;
  new_buzz_progress INTEGER;
  new_map_progress INTEGER;
  buzz_rewards INTEGER := 0;
  buzz_map_rewards INTEGER := 0;
BEGIN
  -- Get or create user XP record
  INSERT INTO public.user_xp (user_id, total_xp, buzz_xp_progress, map_xp_progress)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current XP
  SELECT total_xp, buzz_xp_progress, map_xp_progress INTO current_xp_record
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- Calculate new values
  new_total_xp := current_xp_record.total_xp + p_xp_amount;
  new_buzz_progress := current_xp_record.buzz_xp_progress;
  new_map_progress := current_xp_record.map_xp_progress;
  
  -- Handle different XP types
  IF p_xp_type = 'buzz' THEN
    new_buzz_progress := current_xp_record.buzz_xp_progress + p_xp_amount;
    
    -- Calculate buzz rewards (every 100 XP)
    IF new_buzz_progress >= 100 THEN
      buzz_rewards := new_buzz_progress / 100;
      new_buzz_progress := new_buzz_progress % 100;
    END IF;
    
  ELSIF p_xp_type = 'buzz_map' THEN
    new_map_progress := current_xp_record.map_xp_progress + p_xp_amount;
    
    -- Calculate buzz map rewards (every 250 XP)
    IF new_map_progress >= 250 THEN
      buzz_map_rewards := new_map_progress / 250;
      new_map_progress := new_map_progress % 250;
    END IF;
  END IF;
  
  -- Update XP
  UPDATE public.user_xp
  SET 
    total_xp = new_total_xp,
    buzz_xp_progress = new_buzz_progress,
    map_xp_progress = new_map_progress,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Award credits if any
  IF buzz_rewards > 0 OR buzz_map_rewards > 0 THEN
    INSERT INTO public.user_credits (user_id, free_buzz_credit, free_buzz_map_credit)
    VALUES (p_user_id, buzz_rewards, buzz_map_rewards)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      free_buzz_credit = user_credits.free_buzz_credit + buzz_rewards,
      free_buzz_map_credit = user_credits.free_buzz_map_credit + buzz_map_rewards,
      updated_at = now();
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'xp_type', p_xp_type,
    'total_xp', new_total_xp,
    'buzz_xp_progress', new_buzz_progress,
    'map_xp_progress', new_map_progress,
    'buzz_rewards', buzz_rewards,
    'buzz_map_rewards', buzz_map_rewards
  );
END;
$function$;

-- Update the buzz XP trigger
CREATE OR REPLACE FUNCTION public.handle_buzz_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Award 15 XP for buzz action with progress tracking
  PERFORM public.award_xp(NEW.user_id, 15, 'buzz');
  RETURN NEW;
END;
$function$;

-- Update the buzz map XP trigger
CREATE OR REPLACE FUNCTION public.handle_buzz_map_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Award 10 XP for buzz map action with progress tracking
  PERFORM public.award_xp(NEW.user_id, 10, 'buzz_map');
  RETURN NEW;
END;
$function$;

-- Update the get_user_xp_status function to include progress
CREATE OR REPLACE FUNCTION public.get_user_xp_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  xp_data RECORD;
  credits_data RECORD;
BEGIN
  -- Get XP data
  SELECT total_xp, buzz_xp_progress, map_xp_progress INTO xp_data
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- Get credits data
  SELECT free_buzz_credit, free_buzz_map_credit INTO credits_data
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'total_xp', COALESCE(xp_data.total_xp, 0),
    'buzz_xp_progress', COALESCE(xp_data.buzz_xp_progress, 0),
    'map_xp_progress', COALESCE(xp_data.map_xp_progress, 0),
    'free_buzz_credit', COALESCE(credits_data.free_buzz_credit, 0),
    'free_buzz_map_credit', COALESCE(credits_data.free_buzz_map_credit, 0),
    'next_buzz_reward', 100 - COALESCE(xp_data.buzz_xp_progress, 0),
    'next_map_reward', 250 - COALESCE(xp_data.map_xp_progress, 0)
  );
END;
$function$;