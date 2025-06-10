
-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT UNIQUE,
  buzz_days TEXT[] NOT NULL DEFAULT '{}', -- ['monday', 'wednesday', 'friday']
  max_weekly_buzz INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, stripe_price_id, buzz_days, max_weekly_buzz) VALUES
('Free', 0.00, 'price_1FREE', '{thursday}', 1),
('Silver', 7.99, 'price_1SILVER', '{monday,wednesday,friday}', 3),
('Gold', 13.99, 'price_1GOLD', '{monday,tuesday,wednesday,thursday,saturday}', 5),
('Black', 19.99, 'price_1BLACK', '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}', 7);

-- Update users table to add subscription fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create buzz generation logs table
CREATE TABLE public.buzz_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  buzz_count_generated INTEGER NOT NULL,
  clues_generated INTEGER NOT NULL,
  subscription_tier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weekly buzz allowances table
CREATE TABLE public.weekly_buzz_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  max_buzz_count INTEGER NOT NULL,
  used_buzz_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number, year)
);

-- Enable RLS on new tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzz_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_buzz_allowances ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_tiers (read-only for all users)
CREATE POLICY "subscription_tiers_select" ON public.subscription_tiers
  FOR SELECT USING (true);

-- RLS policies for buzz_generation_logs (users can only see their own)
CREATE POLICY "buzz_generation_logs_select" ON public.buzz_generation_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for weekly_buzz_allowances (users can only see/update their own)
CREATE POLICY "weekly_buzz_allowances_select" ON public.weekly_buzz_allowances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "weekly_buzz_allowances_update" ON public.weekly_buzz_allowances
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "weekly_buzz_allowances_insert" ON public.weekly_buzz_allowances
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to get current week number
CREATE OR REPLACE FUNCTION public.get_current_week_and_year()
RETURNS TABLE(week_num INTEGER, year_num INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT 
    EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER as week_num,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year_num;
END;
$$;

-- Function to check if user can use buzz this week
CREATE OR REPLACE FUNCTION public.can_user_use_buzz(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week INTEGER;
  current_year INTEGER;
  user_allowance RECORD;
BEGIN
  -- Get current week and year
  SELECT week_num, year_num INTO current_week, current_year 
  FROM public.get_current_week_and_year();
  
  -- Get user's weekly allowance
  SELECT * INTO user_allowance
  FROM public.weekly_buzz_allowances
  WHERE user_id = p_user_id 
    AND week_number = current_week 
    AND year = current_year;
  
  -- If no allowance record exists, user can't use buzz
  IF user_allowance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has remaining buzz uses
  RETURN user_allowance.used_buzz_count < user_allowance.max_buzz_count;
END;
$$;

-- Function to consume buzz usage
CREATE OR REPLACE FUNCTION public.consume_buzz_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week INTEGER;
  current_year INTEGER;
  updated_rows INTEGER;
BEGIN
  -- Get current week and year
  SELECT week_num, year_num INTO current_week, current_year 
  FROM public.get_current_week_and_year();
  
  -- Update used buzz count if within limits
  UPDATE public.weekly_buzz_allowances
  SET used_buzz_count = used_buzz_count + 1
  WHERE user_id = p_user_id 
    AND week_number = current_week 
    AND year = current_year
    AND used_buzz_count < max_buzz_count;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$;
