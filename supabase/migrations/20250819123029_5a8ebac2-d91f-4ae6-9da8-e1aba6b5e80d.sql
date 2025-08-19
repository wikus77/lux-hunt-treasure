-- © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
-- Add missing trigger function and apply to push_notifications_log table

CREATE OR REPLACE FUNCTION public.update_push_notifications_log_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_push_notifications_log_updated_at ON public.push_notifications_log;
CREATE TRIGGER update_push_notifications_log_updated_at
BEFORE UPDATE ON public.push_notifications_log
FOR EACH ROW
EXECUTE FUNCTION public.update_push_notifications_log_updated_at();