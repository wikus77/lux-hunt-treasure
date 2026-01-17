-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Analytics Events + Prize Awards Schema
-- Implementazione: Event Tracking + Winners Ledger

-- ============================================================================
-- 1. ANALYTICS_EVENTS - Event log generale (append-only, immutabile)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  -- Identificatori
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  
  -- Timestamp
  server_ts TIMESTAMPTZ NOT NULL DEFAULT now(),  -- Authoritative!
  client_ts TIMESTAMPTZ,                          -- Opzionale, per debug
  
  -- Utente
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id TEXT,                                   -- Per utenti non loggati
  session_id TEXT NOT NULL,
  
  -- Contesto
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android', 'pwa')),
  app_version TEXT,
  route TEXT,
  locale TEXT,
  timezone TEXT,
  
  -- Geo (approssimata, no PII)
  country TEXT,
  city TEXT,
  
  -- Payload
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Idempotenza
  dedupe_key TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici per query frequenti
CREATE INDEX IF NOT EXISTS idx_ae_event_name_ts ON public.analytics_events(event_name, server_ts DESC);
CREATE INDEX IF NOT EXISTS idx_ae_user_ts ON public.analytics_events(user_id, server_ts DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ae_anon_ts ON public.analytics_events(anon_id, server_ts DESC) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ae_session ON public.analytics_events(session_id, server_ts DESC);
CREATE INDEX IF NOT EXISTS idx_ae_created ON public.analytics_events(created_at DESC);

-- Indice UNICO per idempotenza (dedupe_key)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ae_dedupe 
ON public.analytics_events(event_name, dedupe_key) 
WHERE dedupe_key IS NOT NULL;

-- ============================================================================
-- 2. PRIZE_AWARDS - Ledger vincite (immutabile, audit-friendly)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prize_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo e identificativo premio
  award_type TEXT NOT NULL CHECK (award_type IN ('secondary', 'final', 'marker', 'qr', 'event', 'referral')),
  prize_id TEXT NOT NULL,
  
  -- Vincitore
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamp authoritative (server-side)
  won_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Fonte della vincita
  source TEXT,  -- es. 'marker:uuid', 'final_shoot:uuid', 'qr:code'
  
  -- Evidenze per audit
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending_verification', 'revoked')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_pa_type_won ON public.prize_awards(award_type, won_at ASC);
CREATE INDEX IF NOT EXISTS idx_pa_user_won ON public.prize_awards(user_id, won_at DESC);
CREATE INDEX IF NOT EXISTS idx_pa_prize ON public.prize_awards(prize_id);
CREATE INDEX IF NOT EXISTS idx_pa_status ON public.prize_awards(status) WHERE status != 'confirmed';

-- Constraint: Un utente può vincere un premio specifico una sola volta
CREATE UNIQUE INDEX IF NOT EXISTS idx_pa_unique_win 
ON public.prize_awards(user_id, award_type, prize_id) 
WHERE status = 'confirmed';

-- ============================================================================
-- 3. FINAL_PRIZE_CLAIMS - Lock atomico per premio finale (1 SOLO vincitore)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.final_prize_claims (
  -- PK = 1 record per grand_prize_id = 1 solo vincitore
  grand_prize_id TEXT PRIMARY KEY,
  
  -- Vincitore
  winner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamp authoritative
  won_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Evidenze
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice per query "chi ha vinto cosa"
CREATE INDEX IF NOT EXISTS idx_fpc_winner ON public.final_prize_claims(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_fpc_won_at ON public.final_prize_claims(won_at DESC);

-- ============================================================================
-- 4. SECONDARY_PRIZE_CLAIMS - Lock per premi secondari FCFS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.secondary_prize_claims (
  -- PK = 1 record per prize_id = 1 solo vincitore per quel premio
  prize_id TEXT PRIMARY KEY,
  
  -- Vincitore
  winner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamp authoritative
  won_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Evidenze
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  marker_id UUID,  -- Riferimento al marker (se applicabile)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_spc_winner ON public.secondary_prize_claims(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_spc_won_at ON public.secondary_prize_claims(won_at DESC);
CREATE INDEX IF NOT EXISTS idx_spc_marker ON public.secondary_prize_claims(marker_id) WHERE marker_id IS NOT NULL;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- analytics_events: NO accesso diretto, solo via edge function
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Nessun SELECT/INSERT diretto (solo service_role via edge function)
CREATE POLICY "No direct access - use edge function"
ON public.analytics_events
FOR ALL
USING (false)
WITH CHECK (false);

-- Policy: Admin può vedere tutto
CREATE POLICY "Admin can view analytics"
ON public.analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- prize_awards: Utente vede solo i propri, admin vede tutto
ALTER TABLE public.prize_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own awards"
ON public.prize_awards
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admin can view all awards"
ON public.prize_awards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "No direct insert - use RPC"
ON public.prize_awards
FOR INSERT
WITH CHECK (false);

-- final_prize_claims: Tutti possono vedere (trasparenza), nessuno può inserire direttamente
ALTER TABLE public.final_prize_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view final claims"
ON public.final_prize_claims
FOR SELECT
USING (true);

CREATE POLICY "No direct insert - use RPC"
ON public.final_prize_claims
FOR INSERT
WITH CHECK (false);

-- secondary_prize_claims: Come final
ALTER TABLE public.secondary_prize_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view secondary claims"
ON public.secondary_prize_claims
FOR SELECT
USING (true);

CREATE POLICY "No direct insert - use RPC"
ON public.secondary_prize_claims
FOR INSERT
WITH CHECK (false);

-- ============================================================================
-- 6. RPC PER CLAIM PREMI
-- ============================================================================

-- claim_secondary_prize: Claim atomico per premi secondari
CREATE OR REPLACE FUNCTION public.claim_secondary_prize(
  p_prize_id TEXT,
  p_user_id UUID,
  p_source TEXT DEFAULT NULL,
  p_evidence JSONB DEFAULT '{}'::jsonb,
  p_marker_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_winner UUID;
BEGIN
  -- Check se già claimed
  SELECT winner_user_id INTO existing_winner
  FROM public.secondary_prize_claims
  WHERE prize_id = p_prize_id;
  
  IF existing_winner IS NOT NULL THEN
    IF existing_winner = p_user_id THEN
      RETURN jsonb_build_object(
        'success', true,
        'status', 'already_won',
        'message', 'Hai già vinto questo premio!'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_claimed',
        'error', 'Questo premio è già stato vinto da un altro utente.'
      );
    END IF;
  END IF;
  
  -- Tenta insert atomico
  BEGIN
    INSERT INTO public.secondary_prize_claims (prize_id, winner_user_id, evidence, marker_id)
    VALUES (p_prize_id, p_user_id, p_evidence, p_marker_id);
    
    -- Registra in prize_awards
    INSERT INTO public.prize_awards (award_type, prize_id, user_id, source, evidence)
    VALUES ('secondary', p_prize_id, p_user_id, p_source, p_evidence);
    
    RETURN jsonb_build_object(
      'success', true,
      'status', 'winner',
      'won_at', now(),
      'message', 'Congratulazioni! Hai vinto il premio!'
    );
    
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'already_claimed',
      'error', 'Il premio è stato vinto da un altro utente un istante prima.'
    );
  END;
END;
$$;

-- claim_final_prize: Claim atomico per premio finale
CREATE OR REPLACE FUNCTION public.claim_final_prize(
  p_grand_prize_id TEXT,
  p_user_id UUID,
  p_evidence JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_winner UUID;
BEGIN
  -- Check se già claimed
  SELECT winner_user_id INTO existing_winner
  FROM public.final_prize_claims
  WHERE grand_prize_id = p_grand_prize_id;
  
  IF existing_winner IS NOT NULL THEN
    IF existing_winner = p_user_id THEN
      RETURN jsonb_build_object(
        'success', true,
        'status', 'already_won',
        'message', 'Sei già il vincitore di questo premio!'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'status', 'already_claimed',
        'error', 'Il premio finale è già stato vinto.',
        'winner_claimed_at', (SELECT won_at FROM public.final_prize_claims WHERE grand_prize_id = p_grand_prize_id)
      );
    END IF;
  END IF;
  
  -- Tenta insert atomico
  BEGIN
    INSERT INTO public.final_prize_claims (grand_prize_id, winner_user_id, evidence)
    VALUES (p_grand_prize_id, p_user_id, p_evidence);
    
    -- Registra in prize_awards
    INSERT INTO public.prize_awards (award_type, prize_id, user_id, source, evidence)
    VALUES ('final', p_grand_prize_id, p_user_id, 'final_prize_claim', p_evidence);
    
    RETURN jsonb_build_object(
      'success', true,
      'status', 'winner',
      'won_at', now(),
      'message', '🎉 CONGRATULAZIONI! Sei il VINCITORE del premio finale!'
    );
    
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'already_claimed',
      'error', 'Il premio finale è stato vinto da un altro utente un istante prima.'
    );
  END;
END;
$$;

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT SELECT ON public.prize_awards TO authenticated;
GRANT SELECT ON public.final_prize_claims TO authenticated, anon;
GRANT SELECT ON public.secondary_prize_claims TO authenticated, anon;

GRANT EXECUTE ON FUNCTION public.claim_secondary_prize TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_final_prize TO authenticated;

-- ============================================================================
-- 8. COMMENTI
-- ============================================================================

COMMENT ON TABLE public.analytics_events IS 
'M1SSION™ Analytics - Event log immutabile per tracking utente. Write solo via edge function.';

COMMENT ON TABLE public.prize_awards IS 
'M1SSION™ Prize Awards - Ledger immutabile delle vincite. Audit-friendly.';

COMMENT ON TABLE public.final_prize_claims IS 
'M1SSION™ Final Prize Claims - Lock atomico per premio finale. PK garantisce UN SOLO vincitore.';

COMMENT ON TABLE public.secondary_prize_claims IS 
'M1SSION™ Secondary Prize Claims - Lock atomico per premi secondari FCFS.';

COMMENT ON FUNCTION public.claim_secondary_prize IS 
'Claim atomico per premio secondario con idempotenza e lock via PK.';

COMMENT ON FUNCTION public.claim_final_prize IS 
'Claim atomico per premio finale con idempotenza e lock via PK.';

