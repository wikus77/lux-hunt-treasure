-- =====================================================
-- MIGRAZIONE COMPLETA: Tabelle e Colonne Mancanti
-- =====================================================

-- 1) Tabella: user_push_tokens
-- Per gestire i token push notification degli utenti
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'ios', 'android'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens"
ON public.user_push_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2) Tabella: marker_rewards
-- Per gestire i premi associati ai marker sulla mappa
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'credits', 'item', 'badge', etc.
  payload JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.marker_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marker rewards are public"
ON public.marker_rewards
FOR SELECT
TO authenticated
USING (true);

-- 3) Tabella: qr_codes
-- Per gestire i QR codes generati e scansionati
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  qr_type TEXT NOT NULL, -- 'referral', 'mission', 'reward', etc.
  data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  scanned_count INTEGER DEFAULT 0,
  max_scans INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active QR codes"
ON public.qr_codes
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Users can create own QR codes"
ON public.qr_codes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 4) Tabella: app_config
-- Per configurazioni globali dell'applicazione
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public configs are viewable by all"
ON public.app_config
FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Admins can manage all configs"
ON public.app_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- 5) RPC Function: get_my_agent_code
-- Per ottenere il codice agente dell'utente corrente
CREATE OR REPLACE FUNCTION public.get_my_agent_code()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agent_code
  FROM profiles
  WHERE id = auth.uid();
$$;

-- 6) Aggiungere trigger per updated_at
CREATE TRIGGER update_user_push_tokens_updated_at
BEFORE UPDATE ON public.user_push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marker_rewards_updated_at
BEFORE UPDATE ON public.marker_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON public.qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
BEFORE UPDATE ON public.app_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_is_active ON public.user_push_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_marker_rewards_marker_id ON public.marker_rewards(marker_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON public.qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config(config_key);

-- =====================================================
-- COMPLETAMENTO SCHEMA: Migrazione completa eseguita ✅
-- =====================================================