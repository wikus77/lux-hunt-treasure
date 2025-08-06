-- Create personality quiz system
-- Add investigative_style column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'investigative_style') THEN
        ALTER TABLE public.profiles ADD COLUMN investigative_style TEXT DEFAULT NULL;
    END IF;
END $$;

-- Add first_login_completed column to profiles if not exists  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'first_login_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN first_login_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create personality quiz results table
CREATE TABLE IF NOT EXISTS public.personality_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_answers JSONB NOT NULL,
  assigned_type TEXT NOT NULL,
  assigned_description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on personality quiz results
ALTER TABLE public.personality_quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for personality quiz results
CREATE POLICY "Users can view their own quiz results" 
ON public.personality_quiz_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" 
ON public.personality_quiz_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results" 
ON public.personality_quiz_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update personality quiz result
CREATE OR REPLACE FUNCTION public.update_personality_quiz_result(
  p_user_id UUID,
  p_quiz_answers JSONB,
  p_assigned_type TEXT,
  p_assigned_description TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert or update quiz result
  INSERT INTO public.personality_quiz_results (
    user_id, quiz_answers, assigned_type, assigned_description
  ) VALUES (
    p_user_id, p_quiz_answers, p_assigned_type, p_assigned_description
  )
  ON CONFLICT (user_id) DO UPDATE SET
    quiz_answers = p_quiz_answers,
    assigned_type = p_assigned_type,
    assigned_description = p_assigned_description,
    completed_at = now();

  -- Update profile with investigative style and mark first login as completed
  UPDATE public.profiles
  SET 
    investigative_style = p_assigned_type,
    first_login_completed = TRUE,
    updated_at = now()
  WHERE id = p_user_id;

  result := jsonb_build_object(
    'success', true,
    'assigned_type', p_assigned_type,
    'assigned_description', p_assigned_description,
    'completed_at', now()
  );

  RETURN result;
END;
$$;