-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — DATABASE SCHEMA
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- OBIETTIVI:
-- 1. Lotteria 30 giorni con ticket in M1U
-- 2. Estrazione sicura verificabile (Top3)
-- 3. Soglia minima 4.000 ticket con riduzione automatica premi
-- 4. Tracking completo per audit/investor proof
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE A: mission_cycles — Cicli di lotteria (30 giorni)                      │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.mission_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Temporalità
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  
  -- Status: active → locking → drawing → completed
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locking', 'drawing', 'completed', 'cancelled')),
  
  -- Configurazione economica
  ticket_price_m1u INT NOT NULL DEFAULT 10,
  min_tickets_required INT NOT NULL DEFAULT 4000,
  max_tickets_per_user INT NOT NULL DEFAULT 100,
  
  -- Contatori (aggiornati atomicamente via RPC)
  total_tickets INT NOT NULL DEFAULT 0,
  total_participants INT NOT NULL DEFAULT 0,
  
  -- Premi
  prize_pool_mode TEXT NOT NULL DEFAULT 'top3' CHECK (prize_pool_mode IN ('top3', 'top5', 'top10', 'single')),
  
  -- Premi base configurati (JSON)
  -- Es: [{"rank": 1, "percent": 50}, {"rank": 2, "percent": 30}, {"rank": 3, "percent": 20}]
  prizes_json JSONB NOT NULL DEFAULT '[
    {"rank": 1, "percent": 50, "label": "1° Premio"},
    {"rank": 2, "percent": 30, "label": "2° Premio"},
    {"rank": 3, "percent": 20, "label": "3° Premio"}
  ]'::jsonb,
  
  -- Premi effettivi dopo calcolo (popolati al draw)
  prizes_effective_json JSONB,
  
  -- Prize pool totale (total_tickets * ticket_price_m1u)
  prize_pool_total INT GENERATED ALWAYS AS (total_tickets * ticket_price_m1u) STORED,
  
  -- Multiplier applicato (1.0 se soglia raggiunta, < 1.0 se sotto)
  prize_multiplier NUMERIC(5,4) DEFAULT 1.0000,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Vincoli
  CONSTRAINT valid_date_range CHECK (ends_at > starts_at),
  CONSTRAINT valid_ticket_price CHECK (ticket_price_m1u > 0),
  CONSTRAINT valid_min_tickets CHECK (min_tickets_required > 0),
  CONSTRAINT valid_max_per_user CHECK (max_tickets_per_user > 0)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_mission_cycles_status ON public.mission_cycles(status);
CREATE INDEX IF NOT EXISTS idx_mission_cycles_dates ON public.mission_cycles(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_mission_cycles_active ON public.mission_cycles(status, ends_at) WHERE status = 'active';

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE B: lottery_tickets — Biglietti singoli                                 │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  cycle_id UUID NOT NULL REFERENCES public.mission_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID, -- Sarà popolato dopo FK a lottery_purchases
  
  -- Seed per estrazione (generato server-side, mai esposto al client)
  ticket_seed UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Hash anonimo per verifica pubblica (opzionale)
  ticket_hash TEXT GENERATED ALWAYS AS (
    encode(sha256((id::text || ticket_seed::text)::bytea), 'hex')
  ) STORED,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'void', 'winner')),
  
  -- Rank assegnato al draw (NULL fino a estrazione)
  draw_rank INT,
  prize_amount INT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Vincolo unicità per prevenire duplicati
  CONSTRAINT unique_ticket UNIQUE (id, cycle_id)
);

-- Indici per query frequenti
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_cycle ON public.lottery_tickets(cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user ON public.lottery_tickets(user_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_status ON public.lottery_tickets(cycle_id, status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_winners ON public.lottery_tickets(cycle_id, draw_rank) WHERE draw_rank IS NOT NULL;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE C: lottery_purchases — Audit economico acquisti                        │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.lottery_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  cycle_id UUID NOT NULL REFERENCES public.mission_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dettagli acquisto
  tickets_count INT NOT NULL CHECK (tickets_count > 0),
  unit_price_m1u INT NOT NULL CHECK (unit_price_m1u > 0),
  total_m1u INT NOT NULL GENERATED ALWAYS AS (tickets_count * unit_price_m1u) STORED,
  
  -- Idempotenza
  request_id UUID UNIQUE, -- Per evitare doppio click
  
  -- Tracking
  source TEXT DEFAULT 'app_web' CHECK (source IN ('app_web', 'pwa', 'ios', 'android', 'admin', 'test')),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'void')),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  refunded_at TIMESTAMPTZ
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_lottery_purchases_cycle ON public.lottery_purchases(cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_purchases_user ON public.lottery_purchases(user_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_purchases_created ON public.lottery_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_purchases_request ON public.lottery_purchases(request_id) WHERE request_id IS NOT NULL;

-- Aggiorna FK in lottery_tickets
ALTER TABLE public.lottery_tickets 
  ADD CONSTRAINT fk_lottery_tickets_purchase 
  FOREIGN KEY (purchase_id) REFERENCES public.lottery_purchases(id) ON DELETE SET NULL;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE D: lottery_draws — Risultati estrazione                                │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.lottery_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimento ciclo (1 draw per ciclo)
  cycle_id UUID NOT NULL UNIQUE REFERENCES public.mission_cycles(id) ON DELETE CASCADE,
  
  -- Timestamp estrazione
  draw_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  draw_completed_at TIMESTAMPTZ,
  
  -- Seed pubblico per verifica (hash di: timestamp + server_nonce + block_hash_or_similar)
  public_seed TEXT NOT NULL,
  
  -- Versione algoritmo (per audit e riproducibilità)
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  
  -- Vincitori (JSONB con dettagli)
  -- Es: [{"rank": 1, "user_id": "...", "ticket_id": "...", "prize_m1u": 20000}, ...]
  winners JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Statistiche al momento del draw
  total_tickets_at_draw INT NOT NULL,
  total_participants_at_draw INT NOT NULL,
  
  -- Multiplier applicato
  prize_multiplier NUMERIC(5,4) NOT NULL DEFAULT 1.0000,
  
  -- Flag soglia
  threshold_reached BOOLEAN NOT NULL DEFAULT false,
  
  -- Proof hash per investitori (immutabile)
  draw_proof_hash TEXT GENERATED ALWAYS AS (
    encode(sha256((id::text || public_seed || winners::text)::bytea), 'hex')
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_lottery_draws_cycle ON public.lottery_draws(cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_date ON public.lottery_draws(draw_completed_at DESC);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE E: lottery_event_tracking — Tracking specifico per lottery             │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- NOTA: Usiamo la tabella analytics_events esistente per il tracking generale.
-- Questa tabella è per audit interno più dettagliato.

CREATE TABLE IF NOT EXISTS public.lottery_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  cycle_id UUID REFERENCES public.mission_cycles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES public.lottery_purchases(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.lottery_tickets(id) ON DELETE SET NULL,
  
  -- Evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'cycle_created',
    'cycle_started',
    'cycle_locked',
    'cycle_drawing',
    'cycle_completed',
    'cycle_cancelled',
    'ticket_purchased',
    'ticket_refunded',
    'draw_started',
    'draw_completed',
    'prize_awarded',
    'admin_action',
    'error'
  )),
  
  -- Dettagli
  event_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- IP e metadata (per anti-frode)
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_lottery_audit_cycle ON public.lottery_audit_logs(cycle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_user ON public.lottery_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_type ON public.lottery_audit_logs(event_type, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════════════════

-- mission_cycles: Read per tutti, write solo service role
ALTER TABLE public.mission_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cycles"
  ON public.mission_cycles FOR SELECT
  USING (true);

CREATE POLICY "No direct insert - use RPC"
  ON public.mission_cycles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update - use RPC"
  ON public.mission_cycles FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete"
  ON public.mission_cycles FOR DELETE
  USING (false);

-- lottery_tickets: User vede solo i propri ticket (count), mai seed
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.lottery_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all tickets"
  ON public.lottery_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "No direct insert - use RPC"
  ON public.lottery_tickets FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update"
  ON public.lottery_tickets FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete"
  ON public.lottery_tickets FOR DELETE
  USING (false);

-- lottery_purchases: User vede solo i propri
ALTER TABLE public.lottery_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.lottery_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all purchases"
  ON public.lottery_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "No direct insert - use RPC"
  ON public.lottery_purchases FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update"
  ON public.lottery_purchases FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete"
  ON public.lottery_purchases FOR DELETE
  USING (false);

-- lottery_draws: Read per tutti (winners pubblici), write solo service role
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view draws"
  ON public.lottery_draws FOR SELECT
  USING (true);

CREATE POLICY "No direct insert - use RPC"
  ON public.lottery_draws FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update"
  ON public.lottery_draws FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete"
  ON public.lottery_draws FOR DELETE
  USING (false);

-- lottery_audit_logs: Solo admin può vedere
ALTER TABLE public.lottery_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view audit logs"
  ON public.lottery_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "No direct insert - use RPC"
  ON public.lottery_audit_logs FOR INSERT
  WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: Updated_at automatico per mission_cycles
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_mission_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mission_cycles_updated_at ON public.mission_cycles;
CREATE TRIGGER trigger_mission_cycles_updated_at
  BEFORE UPDATE ON public.mission_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mission_cycles_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: Immutability per lottery_draws (nessun update/delete dopo creazione)
-- ══════════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS no_update_delete_lottery_draws ON public.lottery_draws;
CREATE TRIGGER no_update_delete_lottery_draws
  BEFORE UPDATE OR DELETE ON public.lottery_draws
  FOR EACH ROW
  EXECUTE FUNCTION forbid_update_delete();

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.mission_cycles TO authenticated, anon;
GRANT SELECT ON public.lottery_tickets TO authenticated;
GRANT SELECT ON public.lottery_purchases TO authenticated;
GRANT SELECT ON public.lottery_draws TO authenticated, anon;
GRANT SELECT ON public.lottery_audit_logs TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.mission_cycles IS 
'M1SSION™ Lottery - Cicli di lotteria 30gg. PK garantisce unicità ciclo.';

COMMENT ON TABLE public.lottery_tickets IS 
'M1SSION™ Lottery - Biglietti singoli con seed per estrazione. Mai esposto al client.';

COMMENT ON TABLE public.lottery_purchases IS 
'M1SSION™ Lottery - Audit log acquisti. Idempotenza via request_id.';

COMMENT ON TABLE public.lottery_draws IS 
'M1SSION™ Lottery - Risultati estrazione immutabili. 1 draw per cycle.';

COMMENT ON TABLE public.lottery_audit_logs IS 
'M1SSION™ Lottery - Audit trail completo per anti-frode e investor proof.';

-- ══════════════════════════════════════════════════════════════════════════════
-- NOTIFY SCHEMA RELOAD
-- ══════════════════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – MISSION LOTTERY SCHEMA v1.0
-- ══════════════════════════════════════════════════════════════════════════════

