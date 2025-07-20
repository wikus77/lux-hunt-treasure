-- © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

-- Create intelligence tool usage tracking table
CREATE TABLE public.intelligence_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID,
  tool_name TEXT NOT NULL CHECK (tool_name IN ('radar', 'interceptor', 'precision')),
  used_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_daily_tool_usage UNIQUE (user_id, mission_id, tool_name, used_on)
);

-- Enable RLS
ALTER TABLE public.intelligence_tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tool usage"
ON public.intelligence_tool_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage"
ON public.intelligence_tool_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to check if user can use a tool
CREATE OR REPLACE FUNCTION public.can_use_intelligence_tool(
  p_user_id UUID,
  p_mission_id UUID,
  p_tool_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mission_start_date DATE;
  current_week INTEGER;
  tool_week_requirement INTEGER;
  daily_usage_count INTEGER;
BEGIN
  -- Get mission start date
  SELECT start_date::DATE INTO mission_start_date
  FROM public.monthly_missions
  WHERE id = p_mission_id AND status = 'active';
  
  -- If no active mission, deny access
  IF mission_start_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate current week (starting from 1)
  current_week := GREATEST(1, CEIL((CURRENT_DATE - mission_start_date) / 7.0));
  
  -- Set week requirements for each tool
  CASE p_tool_name
    WHEN 'radar' THEN tool_week_requirement := 3;
    WHEN 'interceptor' THEN tool_week_requirement := 4;
    WHEN 'precision' THEN tool_week_requirement := 5;
    ELSE tool_week_requirement := 999; -- Invalid tool
  END CASE;
  
  -- Check if current week meets requirement
  IF current_week < tool_week_requirement THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily usage limit (1 per day per tool)
  SELECT COUNT(*) INTO daily_usage_count
  FROM public.intelligence_tool_usage
  WHERE user_id = p_user_id
    AND mission_id = p_mission_id
    AND tool_name = p_tool_name
    AND used_on = CURRENT_DATE;
  
  -- Allow if not used today
  RETURN daily_usage_count = 0;
END;
$$;

-- Create function to record tool usage
CREATE OR REPLACE FUNCTION public.record_intelligence_tool_usage(
  p_user_id UUID,
  p_mission_id UUID,
  p_tool_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user can use the tool
  IF NOT public.can_use_intelligence_tool(p_user_id, p_mission_id, p_tool_name) THEN
    RETURN FALSE;
  END IF;
  
  -- Record the usage
  INSERT INTO public.intelligence_tool_usage (user_id, mission_id, tool_name)
  VALUES (p_user_id, p_mission_id, p_tool_name)
  ON CONFLICT (user_id, mission_id, tool_name, used_on) DO NOTHING;
  
  RETURN TRUE;
END;
$$;