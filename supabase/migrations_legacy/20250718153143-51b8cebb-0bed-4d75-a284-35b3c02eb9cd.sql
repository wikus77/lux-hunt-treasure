-- © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
-- Force specific referral code AG-X0197 for developer user

-- Update the specific user's referral code to AG-X0197
UPDATE public.profiles 
SET referral_code = 'CODE AG-X0197'
WHERE id = '495246c1-9154-4f01-a428-7f37fe230180';

-- Add unique constraint to prevent duplicate referral codes
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);

-- Create function to prevent AG-X0197 from being used by other users
CREATE OR REPLACE FUNCTION public.alert_if_x0197_used()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.referral_code = 'CODE AG-X0197' AND NEW.email <> 'wikus77@hotmail.it' THEN
    RAISE EXCEPTION 'CODE AG-X0197 è riservato all''amministratore.';
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger to prevent unauthorized use of AG-X0197
CREATE TRIGGER prevent_x0197_misuse
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.alert_if_x0197_used();