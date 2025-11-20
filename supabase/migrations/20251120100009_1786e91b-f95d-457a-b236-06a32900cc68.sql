-- 20251120_fix_webpush_qr_privacy_v2.sql
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- A) WEBPUSH SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('web','ios','android')),
  token text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webpush_user ON public.webpush_subscriptions(user_id);

ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_webpush()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_webpush ON public.webpush_subscriptions;
CREATE TRIGGER set_updated_at_webpush
  BEFORE UPDATE ON public.webpush_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_webpush();

-- RLS policies
DROP POLICY IF EXISTS "webpush select owner" ON public.webpush_subscriptions;
CREATE POLICY "webpush select owner"
  ON public.webpush_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "webpush insert owner" ON public.webpush_subscriptions;
CREATE POLICY "webpush insert owner"
  ON public.webpush_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "webpush update owner" ON public.webpush_subscriptions;
CREATE POLICY "webpush update owner"
  ON public.webpush_subscriptions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "webpush delete owner" ON public.webpush_subscriptions;
CREATE POLICY "webpush delete owner"
  ON public.webpush_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- B) QR TABLES - Estendi qr_codes se esiste già
DO $$
BEGIN
  -- Aggiungi colonne mancanti a qr_codes esistente
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'lat') THEN
    ALTER TABLE public.qr_codes ADD COLUMN lat double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'lng') THEN
    ALTER TABLE public.qr_codes ADD COLUMN lng double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'reward_type') THEN
    ALTER TABLE public.qr_codes ADD COLUMN reward_type text NOT NULL DEFAULT 'm1u';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'location_name') THEN
    ALTER TABLE public.qr_codes ADD COLUMN location_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'is_used') THEN
    ALTER TABLE public.qr_codes ADD COLUMN is_used boolean NOT NULL DEFAULT false;
  END IF;
END$$;

-- Crea qr_rewards
CREATE TABLE IF NOT EXISTS public.qr_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  reward_type text NOT NULL,
  amount integer,
  lat double precision,
  lon double precision,
  location_name text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qr_rewards admin select" ON public.qr_rewards;
CREATE POLICY "qr_rewards admin select"
  ON public.qr_rewards FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role='admin'::app_role));

-- VIEW di compatibilità per codice legacy "qr_buzz_codes"
CREATE OR REPLACE VIEW public.qr_buzz_codes AS
  SELECT id, code, lat, lng, title, reward_type, location_name, is_used, created_at
  FROM public.qr_codes;

GRANT SELECT ON public.qr_buzz_codes TO anon, authenticated;

-- C) PRIVACY TABLES
CREATE TABLE IF NOT EXISTS public.user_cookie_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics boolean NOT NULL DEFAULT false,
  marketing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_cookie_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cookie_prefs owner rw" ON public.user_cookie_preferences;
CREATE POLICY "cookie_prefs owner rw"
  ON public.user_cookie_preferences
  FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL,
  granted boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_consents owner r" ON public.user_consents;
CREATE POLICY "user_consents owner r"
  ON public.user_consents FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_consents owner ins" ON public.user_consents;
CREATE POLICY "user_consents owner ins"
  ON public.user_consents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- D) Estendi abuse_logs con colonne per QR legacy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abuse_logs' AND column_name = 'lat') THEN
    ALTER TABLE public.abuse_logs ADD COLUMN lat double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abuse_logs' AND column_name = 'lon') THEN
    ALTER TABLE public.abuse_logs ADD COLUMN lon double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abuse_logs' AND column_name = 'location_name') THEN
    ALTER TABLE public.abuse_logs ADD COLUMN location_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abuse_logs' AND column_name = 'reward_type') THEN
    ALTER TABLE public.abuse_logs ADD COLUMN reward_type text;
  END IF;
END$$;

-- E) Estendi device_tokens con colonne richieste
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'device_tokens' AND column_name = 'device_type') THEN
    ALTER TABLE public.device_tokens ADD COLUMN device_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'device_tokens' AND column_name = 'last_used') THEN
    ALTER TABLE public.device_tokens ADD COLUMN last_used timestamptz;
  END IF;
END$$;