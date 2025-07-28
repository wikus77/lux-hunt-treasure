-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- XP SYSTEM IMPLEMENTATION - ADVANCED BACKEND

-- Create XP tracking table
CREATE TABLE public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_since_reward INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  free_buzz_credit INTEGER NOT NULL DEFAULT 0,
  free_buzz_map_credit INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create referral status enum
CREATE TYPE public.referral_status AS ENUM ('pending', 'registered');

-- Create referrals table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  xp_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(inviter_id, invitee_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_xp
CREATE POLICY "Users can view their own XP"
ON public.user_xp FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage XP"
ON public.user_xp FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits"
ON public.user_credits FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their referrals"
ON public.user_referrals FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "System can manage referrals"
ON public.user_referrals FOR ALL
USING (true)
WITH CHECK (true);

-- Function to award XP and handle rewards
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_xp_record RECORD;
  new_total_xp INTEGER;
  new_xp_since_reward INTEGER;
  buzz_rewards INTEGER := 0;
  buzz_map_rewards INTEGER := 0;
BEGIN
  -- Get or create user XP record
  INSERT INTO public.user_xp (user_id, total_xp, xp_since_reward)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current XP
  SELECT total_xp, xp_since_reward INTO current_xp_record
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- Calculate new values
  new_total_xp := current_xp_record.total_xp + p_xp_amount;
  new_xp_since_reward := current_xp_record.xp_since_reward + p_xp_amount;
  
  -- Calculate buzz rewards (every 100 XP)
  IF new_xp_since_reward >= 100 THEN
    buzz_rewards := new_xp_since_reward / 100;
    new_xp_since_reward := new_xp_since_reward % 100;
  END IF;
  
  -- Calculate buzz map rewards (every 250 XP from total)
  IF new_total_xp >= 250 AND current_xp_record.total_xp < 250 THEN
    buzz_map_rewards := (new_total_xp / 250) - (current_xp_record.total_xp / 250);
  END IF;
  
  -- Update XP
  UPDATE public.user_xp
  SET 
    total_xp = new_total_xp,
    xp_since_reward = new_xp_since_reward,
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
    'total_xp', new_total_xp,
    'buzz_rewards', buzz_rewards,
    'buzz_map_rewards', buzz_map_rewards
  );
END;
$$;

-- Trigger function for buzz XP
CREATE OR REPLACE FUNCTION public.handle_buzz_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Award 15 XP for buzz action
  PERFORM public.award_xp(NEW.user_id, 15);
  RETURN NEW;
END;
$$;

-- Trigger function for buzz map XP
CREATE OR REPLACE FUNCTION public.handle_buzz_map_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Award 10 XP for buzz map action
  PERFORM public.award_xp(NEW.user_id, 10);
  RETURN NEW;
END;
$$;

-- Trigger function for referral XP
CREATE OR REPLACE FUNCTION public.handle_referral_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Award 25 XP when referral is registered and XP not yet awarded
  IF NEW.status = 'registered' AND OLD.status = 'pending' AND NOT NEW.xp_awarded THEN
    PERFORM public.award_xp(NEW.inviter_id, 25);
    NEW.xp_awarded = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER buzz_xp_trigger
  AFTER INSERT ON public.buzz_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_buzz_xp();

CREATE TRIGGER buzz_map_xp_trigger
  AFTER INSERT ON public.buzz_map_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_buzz_map_xp();

CREATE TRIGGER referral_xp_trigger
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_xp();

-- Function to get user XP status
CREATE OR REPLACE FUNCTION public.get_user_xp_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  xp_data RECORD;
  credits_data RECORD;
BEGIN
  -- Get XP data
  SELECT total_xp, xp_since_reward INTO xp_data
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- Get credits data
  SELECT free_buzz_credit, free_buzz_map_credit INTO credits_data
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'total_xp', COALESCE(xp_data.total_xp, 0),
    'xp_since_reward', COALESCE(xp_data.xp_since_reward, 0),
    'free_buzz_credit', COALESCE(credits_data.free_buzz_credit, 0),
    'free_buzz_map_credit', COALESCE(credits_data.free_buzz_map_credit, 0),
    'next_buzz_reward', 100 - COALESCE(xp_data.xp_since_reward, 0),
    'next_map_reward', 250 - (COALESCE(xp_data.total_xp, 0) % 250)
  );
END;
$$;

-- Function to consume credits
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id UUID, p_credit_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  IF p_credit_type = 'buzz' THEN
    SELECT free_buzz_credit INTO current_credits
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    IF current_credits > 0 THEN
      UPDATE public.user_credits
      SET free_buzz_credit = free_buzz_credit - 1,
          updated_at = now()
      WHERE user_id = p_user_id;
      RETURN true;
    END IF;
    
  ELSIF p_credit_type = 'buzz_map' THEN
    SELECT free_buzz_map_credit INTO current_credits
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    IF current_credits > 0 THEN
      UPDATE public.user_credits
      SET free_buzz_map_credit = free_buzz_map_credit - 1,
          updated_at = now()
      WHERE user_id = p_user_id;
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();