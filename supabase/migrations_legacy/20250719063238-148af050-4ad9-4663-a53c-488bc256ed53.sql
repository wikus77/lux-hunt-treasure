-- Create user_clue_lines table for dynamic clue release system
CREATE TABLE public.user_clue_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  plan_level TEXT NOT NULL DEFAULT 'free',
  clue_index INTEGER NOT NULL,
  clue_line TEXT NOT NULL,
  is_released BOOLEAN NOT NULL DEFAULT false,
  language_code TEXT NOT NULL DEFAULT 'it',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_clue_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own clue lines" 
ON public.user_clue_lines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clue lines" 
ON public.user_clue_lines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clue lines" 
ON public.user_clue_lines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins and developers can manage all clue lines" 
ON public.user_clue_lines 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'developer')
));

-- Trigger for updated_at
CREATE TRIGGER update_user_clue_lines_updated_at
BEFORE UPDATE ON public.user_clue_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to release clue lines based on plan
CREATE OR REPLACE FUNCTION public.release_clue_lines(
  p_user_id UUID,
  p_plan_level TEXT,
  p_week_number INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lines_to_release INTEGER;
  released_count INTEGER;
BEGIN
  -- Determine lines to release based on plan
  CASE p_plan_level
    WHEN 'free' THEN lines_to_release := 1;
    WHEN 'silver' THEN lines_to_release := 3;
    WHEN 'gold' THEN lines_to_release := 5;
    WHEN 'black' THEN lines_to_release := 10;
    WHEN 'titanium' THEN lines_to_release := 9999; -- All lines
    ELSE lines_to_release := 1; -- Default to free
  END CASE;
  
  -- Update clue lines to released status
  UPDATE public.user_clue_lines
  SET is_released = true, updated_at = now()
  WHERE user_id = p_user_id
    AND week_number = p_week_number
    AND is_released = false
    AND id IN (
      SELECT id FROM public.user_clue_lines
      WHERE user_id = p_user_id
        AND week_number = p_week_number
        AND is_released = false
      ORDER BY clue_index
      LIMIT lines_to_release
    );
  
  GET DIAGNOSTICS released_count = ROW_COUNT;
  
  RETURN released_count;
END;
$function$;

-- Create indexes for performance
CREATE INDEX idx_user_clue_lines_user_id ON public.user_clue_lines(user_id);
CREATE INDEX idx_user_clue_lines_week_number ON public.user_clue_lines(week_number);
CREATE INDEX idx_user_clue_lines_is_released ON public.user_clue_lines(is_released);
CREATE INDEX idx_user_clue_lines_prompt_id ON public.user_clue_lines(prompt_id);