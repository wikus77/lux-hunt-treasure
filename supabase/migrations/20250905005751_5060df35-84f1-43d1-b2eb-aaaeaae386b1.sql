-- Fix security warnings from the previous migration
-- property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.

-- Update the function to have proper search_path set
DROP FUNCTION IF EXISTS update_fcm_subscriptions_updated_at();

CREATE OR REPLACE FUNCTION update_fcm_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';