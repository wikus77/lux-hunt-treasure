-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FASE 2: First Login Quiz Enhancement - Database Function

-- Create function to update personality quiz result
CREATE OR REPLACE FUNCTION public.update_personality_quiz_result(
  p_user_id UUID,
  p_investigative_style TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile with investigative style and mark first login as completed
  UPDATE public.profiles
  SET 
    investigative_style = p_investigative_style,
    first_login_completed = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;