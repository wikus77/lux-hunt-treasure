-- Fix the trigger and function properly
-- property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS update_fcm_subscriptions_updated_at ON public.fcm_subscriptions;
DROP FUNCTION IF EXISTS update_fcm_subscriptions_updated_at();

-- Recreate with proper security settings
CREATE OR REPLACE FUNCTION update_fcm_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Recreate the trigger
CREATE TRIGGER update_fcm_subscriptions_updated_at
  BEFORE UPDATE ON public.fcm_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_fcm_subscriptions_updated_at();