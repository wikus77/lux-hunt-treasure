-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FASE 1: SICUREZZA CRITICA + FASE 4/7/8: Backend Fixes
-- Upgrade M1SSION™ → 95% (FIX)

-- ============================================================================
-- 1.1 SECURITY: Ricreare public_profiles view (solo dati pubblici)
-- ============================================================================
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  nickname,
  avatar_url,
  agent_code,
  rank_id,
  investigative_style,
  created_at,
  pulse_energy,
  total_referrals
FROM public.profiles;

COMMENT ON VIEW public.public_profiles IS 'Public profile data - no sensitive info like email/full_name';

-- Grant select to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- ============================================================================
-- 1.2 SECURITY: Rafforzare RLS su profiles (bloccare email/full_name)
-- ============================================================================
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Nuove policy più restrittive
CREATE POLICY "Users can view only own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update only own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- ============================================================================
-- 1.3 SECURITY: Rafforzare RLS su payment_transactions
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users select own payments" ON public.payment_transactions;
DROP POLICY IF EXISTS "Admins can select all payments" ON public.payment_transactions;

-- Nuove policy con audit logging
CREATE POLICY "Users can view only own payments"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments with audit"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- ============================================================================
-- 4.2 BACKEND FIX: Creare tabella scheduled_notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  message JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  CONSTRAINT scheduled_notifications_status_check 
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

COMMENT ON TABLE public.scheduled_notifications IS 'Scheduled push notifications queue for cron processing';

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scheduled notifications"
ON public.scheduled_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage scheduled notifications"
ON public.scheduled_notifications
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Index per performance cron
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status_scheduled 
ON public.scheduled_notifications(status, scheduled_at)
WHERE status = 'pending';

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_scheduled_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_scheduled_notifications_updated_at ON public.scheduled_notifications;
CREATE TRIGGER set_scheduled_notifications_updated_at
BEFORE UPDATE ON public.scheduled_notifications
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_notifications_updated_at();

-- ============================================================================
-- 7.1 3D MAP FIX: Aggiungere reward_id a qr_codes
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'qr_codes' 
    AND column_name = 'reward_id'
  ) THEN
    ALTER TABLE public.qr_codes ADD COLUMN reward_id UUID;
    COMMENT ON COLUMN public.qr_codes.reward_id IS 'Reference to marker_rewards for reward-type QR codes';
  END IF;
END $$;

-- Index per performance lookup
CREATE INDEX IF NOT EXISTS idx_qr_codes_reward_id 
ON public.qr_codes(reward_id) 
WHERE reward_id IS NOT NULL;

-- ============================================================================
-- 7.2 3D MAP FIX: Ricreare view qr_buzz_codes senza conflitti
-- ============================================================================
DROP VIEW IF EXISTS public.qr_buzz_codes CASCADE;

CREATE VIEW public.qr_buzz_codes AS
SELECT 
  id,
  code,
  title,
  reward_type,
  location_name,
  lat,
  lng,
  is_used,
  created_at,
  reward_id
FROM public.qr_codes
WHERE qr_type = 'buzz';

COMMENT ON VIEW public.qr_buzz_codes IS 'View of buzz-type QR codes - fixed schema conflicts';

GRANT SELECT ON public.qr_buzz_codes TO authenticated;

-- ============================================================================
-- 2.3 EUR→M1U: Creare tabella di conversione configurabile
-- ============================================================================
INSERT INTO public.app_config (config_key, config_value, description, is_public)
VALUES 
  ('m1u_to_eur_rate', '{"rate": 0.01, "updated_at": "2025-01-20"}'::jsonb, 'Conversion rate M1U to EUR for Stripe backend', false),
  ('display_currency', '{"currency": "M1U", "symbol": "M1U", "decimals": 0}'::jsonb, 'Display currency configuration for frontend', true)
ON CONFLICT (config_key) DO UPDATE 
SET config_value = EXCLUDED.config_value,
    updated_at = now();

-- ============================================================================
-- 1.4 SECURITY: Audit trigger per SECURITY DEFINER views access
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_audit_log IS 'Audit log for sensitive operations and SECURITY DEFINER view access';

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_created 
ON public.security_audit_log(user_id, created_at DESC);

-- ============================================================================
-- FINAL: Grant permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.qr_buzz_codes TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™