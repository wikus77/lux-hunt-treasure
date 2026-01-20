-- © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
-- M1SSION™ Database Security Fix - Correct Function Search Path

-- Fix all database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.validate_buzz_user_id(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Allow developer fallback UUID
  IF p_user_id = '00000000-0000-4000-a000-000000000000'::uuid THEN
    RETURN true;
  END IF;
  
  -- Check if user exists in auth.users
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_week_and_year()
RETURNS TABLE(week_num integer, year_num integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT 
    EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER as week_num,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_user_use_buzz(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_my_agent_code()
RETURNS TABLE(agent_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT p.agent_code
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_by_email(email_param text)
RETURNS SETOF auth.users
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT * FROM auth.users WHERE email = email_param LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND user_roles.role = $2
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
RETURNS TABLE(role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

CREATE OR REPLACE FUNCTION public.consume_buzz_usage(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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