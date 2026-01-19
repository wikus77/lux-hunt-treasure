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

-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — RPC FUNCTIONS
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- FUNZIONI:
-- 1. buy_lottery_tickets(cycle_id, quantity, request_id) — Acquisto atomico
-- 2. get_lottery_status(cycle_id) — Status ciclo con stats utente
-- 3. get_active_lottery_cycle() — Ciclo attivo corrente
-- 4. get_user_lottery_tickets(cycle_id) — Lista ticket utente (senza seed)
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 1: buy_lottery_tickets
-- Acquisto atomico di N ticket per un ciclo
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.buy_lottery_tickets(
  p_cycle_id UUID,
  p_quantity INT,
  p_request_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'app_web'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cycle RECORD;
  v_current_m1u NUMERIC;
  v_user_tickets_count INT;
  v_total_cost INT;
  v_purchase_id UUID;
  v_existing_purchase UUID;
  v_ticket_ids UUID[] := ARRAY[]::UUID[];
  v_i INT;
  v_new_ticket_id UUID;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. VALIDAZIONI BASE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Verifica autenticazione
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NOT_AUTHENTICATED',
      'message', 'Devi essere autenticato per acquistare biglietti'
    );
  END IF;
  
  -- Verifica quantità valida
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INVALID_QUANTITY',
      'message', 'La quantità deve essere maggiore di 0'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. IDEMPOTENZA CHECK
  -- ═══════════════════════════════════════════════════════════════════════════
  
  IF p_request_id IS NOT NULL THEN
    SELECT id INTO v_existing_purchase
    FROM public.lottery_purchases
    WHERE request_id = p_request_id;
    
    IF v_existing_purchase IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'already_purchased',
        'code', 'IDEMPOTENT_DUPLICATE',
        'purchase_id', v_existing_purchase,
        'message', 'Acquisto già completato con questo request_id'
      );
    END IF;
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. VERIFICA CICLO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE; -- Lock per consistenza
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo lotteria non trovato'
    );
  END IF;
  
  -- Verifica stato ciclo
  IF v_cycle.status != 'active' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_ACTIVE',
      'message', CASE v_cycle.status
        WHEN 'locking' THEN 'La lotteria sta per chiudersi, riprova nel prossimo ciclo'
        WHEN 'drawing' THEN 'Estrazione in corso, riprova nel prossimo ciclo'
        WHEN 'completed' THEN 'Questo ciclo è già terminato'
        WHEN 'cancelled' THEN 'Questo ciclo è stato annullato'
        ELSE 'Ciclo non disponibile'
      END
    );
  END IF;
  
  -- Verifica date
  IF now() < v_cycle.starts_at THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_STARTED',
      'message', 'La lotteria non è ancora iniziata'
    );
  END IF;
  
  IF now() > v_cycle.ends_at THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_ENDED',
      'message', 'La lotteria è già terminata'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. VERIFICA CAP UTENTE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT COUNT(*) INTO v_user_tickets_count
  FROM public.lottery_tickets
  WHERE cycle_id = p_cycle_id AND user_id = v_user_id AND status = 'active';
  
  IF v_user_tickets_count + p_quantity > v_cycle.max_tickets_per_user THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'MAX_TICKETS_EXCEEDED',
      'message', format('Puoi acquistare massimo %s biglietti per questo ciclo. Ne hai già %s.', 
        v_cycle.max_tickets_per_user, v_user_tickets_count),
      'current_tickets', v_user_tickets_count,
      'max_tickets', v_cycle.max_tickets_per_user,
      'requested', p_quantity
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. VERIFICA SALDO M1U
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_total_cost := p_quantity * v_cycle.ticket_price_m1u;
  
  SELECT m1_units INTO v_current_m1u
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_current_m1u IS NULL OR v_current_m1u < v_total_cost THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INSUFFICIENT_BALANCE',
      'message', format('Saldo insufficiente. Servono %s M1U, hai %s M1U.', 
        v_total_cost, COALESCE(v_current_m1u, 0)),
      'required', v_total_cost,
      'current_balance', COALESCE(v_current_m1u, 0)
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. TRANSAZIONE ATOMICA: ADDEBITO + INSERT
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Addebita M1U
  UPDATE public.profiles
  SET m1_units = m1_units - v_total_cost,
      updated_at = now()
  WHERE id = v_user_id AND m1_units >= v_total_cost;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DEBIT_FAILED',
      'message', 'Errore durante l''addebito. Riprova.'
    );
  END IF;
  
  -- Crea record purchase
  INSERT INTO public.lottery_purchases (
    cycle_id, user_id, tickets_count, unit_price_m1u, request_id, source, status
  )
  VALUES (
    p_cycle_id, v_user_id, p_quantity, v_cycle.ticket_price_m1u, p_request_id, p_source, 'completed'
  )
  RETURNING id INTO v_purchase_id;
  
  -- Crea N ticket
  FOR v_i IN 1..p_quantity LOOP
    INSERT INTO public.lottery_tickets (
      cycle_id, user_id, purchase_id, status
    )
    VALUES (
      p_cycle_id, v_user_id, v_purchase_id, 'active'
    )
    RETURNING id INTO v_new_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_new_ticket_id);
  END LOOP;
  
  -- Aggiorna contatori ciclo
  UPDATE public.mission_cycles
  SET total_tickets = total_tickets + p_quantity,
      total_participants = (
        SELECT COUNT(DISTINCT user_id) 
        FROM public.lottery_tickets 
        WHERE cycle_id = p_cycle_id AND status = 'active'
      ),
      updated_at = now()
  WHERE id = p_cycle_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. AUDIT LOG
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, purchase_id, event_type, event_details
  )
  VALUES (
    p_cycle_id,
    v_user_id,
    v_purchase_id,
    'ticket_purchased',
    jsonb_build_object(
      'tickets_count', p_quantity,
      'total_m1u', v_total_cost,
      'unit_price', v_cycle.ticket_price_m1u,
      'ticket_ids', v_ticket_ids,
      'source', p_source,
      'request_id', p_request_id
    )
  );
  
  -- Log su analytics_events (esistente)
  INSERT INTO public.analytics_events (
    event_name, user_id, session_id, platform, props, event_version
  )
  VALUES (
    'lottery_buy_success',
    v_user_id,
    'server',
    COALESCE(p_source, 'web'),
    jsonb_build_object(
      'cycle_id', p_cycle_id,
      'purchase_id', v_purchase_id,
      'tickets_count', p_quantity,
      'total_m1u', v_total_cost
    ),
    1
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. RETURN SUCCESS
  -- ═══════════════════════════════════════════════════════════════════════════
  
  RETURN jsonb_build_object(
    'status', 'success',
    'purchase_id', v_purchase_id,
    'tickets_count', p_quantity,
    'ticket_ids', v_ticket_ids,
    'total_m1u', v_total_cost,
    'new_balance', v_current_m1u - v_total_cost,
    'user_total_tickets', v_user_tickets_count + p_quantity,
    'message', format('Acquistati %s biglietti per %s M1U!', p_quantity, v_total_cost)
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Idempotency: request_id duplicato
    SELECT id INTO v_existing_purchase
    FROM public.lottery_purchases
    WHERE request_id = p_request_id;
    
    RETURN jsonb_build_object(
      'status', 'already_purchased',
      'code', 'IDEMPOTENT_DUPLICATE',
      'purchase_id', v_existing_purchase,
      'message', 'Acquisto già completato'
    );
  WHEN OTHERS THEN
    -- Log errore
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, event_type, event_details
    )
    VALUES (
      p_cycle_id,
      v_user_id,
      'error',
      jsonb_build_object(
        'error', SQLERRM,
        'quantity', p_quantity,
        'request_id', p_request_id
      )
    );
    
    RAISE LOG 'Error in buy_lottery_tickets: %', SQLERRM;
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INTERNAL_ERROR',
      'message', 'Errore interno. Riprova.'
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 2: get_lottery_status
-- Status completo di un ciclo con statistiche utente
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_lottery_status(
  p_cycle_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_cycle RECORD;
  v_user_tickets_count INT;
  v_user_purchases JSONB;
  v_draw RECORD;
  v_progress_percent NUMERIC;
  v_time_remaining INTERVAL;
BEGIN
  v_user_id := auth.uid();
  
  -- Se non specificato, prende il ciclo attivo
  IF p_cycle_id IS NULL THEN
    SELECT * INTO v_cycle
    FROM public.mission_cycles
    WHERE status = 'active' AND now() BETWEEN starts_at AND ends_at
    ORDER BY starts_at DESC
    LIMIT 1;
  ELSE
    SELECT * INTO v_cycle
    FROM public.mission_cycles
    WHERE id = p_cycle_id;
  END IF;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'no_active_cycle',
      'message', 'Nessun ciclo lotteria attivo al momento'
    );
  END IF;
  
  -- Calcola statistiche utente (se autenticato)
  IF v_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_tickets_count
    FROM public.lottery_tickets
    WHERE cycle_id = v_cycle.id AND user_id = v_user_id AND status = 'active';
    
    SELECT jsonb_agg(jsonb_build_object(
      'id', lp.id,
      'tickets_count', lp.tickets_count,
      'total_m1u', lp.total_m1u,
      'created_at', lp.created_at
    ) ORDER BY lp.created_at DESC)
    INTO v_user_purchases
    FROM public.lottery_purchases lp
    WHERE lp.cycle_id = v_cycle.id AND lp.user_id = v_user_id AND lp.status = 'completed';
  ELSE
    v_user_tickets_count := 0;
    v_user_purchases := '[]'::jsonb;
  END IF;
  
  -- Calcola progresso soglia
  v_progress_percent := ROUND(
    (v_cycle.total_tickets::numeric / NULLIF(v_cycle.min_tickets_required, 0)) * 100, 
    2
  );
  
  -- Calcola tempo rimanente
  v_time_remaining := v_cycle.ends_at - now();
  
  -- Recupera draw se completato
  IF v_cycle.status = 'completed' THEN
    SELECT * INTO v_draw
    FROM public.lottery_draws
    WHERE cycle_id = v_cycle.id;
  END IF;
  
  RETURN jsonb_build_object(
    -- Ciclo
    'cycle_id', v_cycle.id,
    'status', v_cycle.status,
    'starts_at', v_cycle.starts_at,
    'ends_at', v_cycle.ends_at,
    'time_remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM v_time_remaining)::int),
    
    -- Configurazione
    'ticket_price_m1u', v_cycle.ticket_price_m1u,
    'min_tickets_required', v_cycle.min_tickets_required,
    'max_tickets_per_user', v_cycle.max_tickets_per_user,
    
    -- Statistiche globali
    'total_tickets', v_cycle.total_tickets,
    'total_participants', v_cycle.total_participants,
    'prize_pool_total', v_cycle.prize_pool_total,
    'progress_percent', LEAST(100, v_progress_percent),
    'threshold_reached', v_cycle.total_tickets >= v_cycle.min_tickets_required,
    
    -- Premi
    'prizes_json', v_cycle.prizes_json,
    'prizes_effective_json', v_cycle.prizes_effective_json,
    'prize_multiplier', v_cycle.prize_multiplier,
    
    -- User stats
    'user_tickets_count', v_user_tickets_count,
    'user_can_buy_more', v_user_tickets_count < v_cycle.max_tickets_per_user,
    'user_remaining_tickets', v_cycle.max_tickets_per_user - v_user_tickets_count,
    'user_purchases', COALESCE(v_user_purchases, '[]'::jsonb),
    
    -- Draw (se completato)
    'draw', CASE 
      WHEN v_draw IS NOT NULL THEN jsonb_build_object(
        'id', v_draw.id,
        'completed_at', v_draw.draw_completed_at,
        'winners', v_draw.winners,
        'public_seed', v_draw.public_seed,
        'draw_proof_hash', v_draw.draw_proof_hash,
        'threshold_reached', v_draw.threshold_reached,
        'prize_multiplier', v_draw.prize_multiplier
      )
      ELSE NULL
    END,
    
    -- Messaggi narrativi
    'narrative', CASE
      WHEN v_cycle.status = 'active' AND v_progress_percent < 25 THEN 
        'La Missione è appena iniziata. Ogni biglietto conta!'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 50 THEN 
        'La Missione sta prendendo forma. Partecipa per aumentare il montepremi!'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 75 THEN 
        'La Missione è a buon punto! Manca poco per raggiungere l''obiettivo.'
      WHEN v_cycle.status = 'active' AND v_progress_percent < 100 THEN 
        'La Missione è quasi completa! Ultimi biglietti disponibili.'
      WHEN v_cycle.status = 'active' AND v_progress_percent >= 100 THEN 
        'Obiettivo raggiunto! Premi al 100%. La Missione è un successo!'
      WHEN v_cycle.status = 'locking' THEN 
        'La Missione sta per concludersi. Estrazione imminente.'
      WHEN v_cycle.status = 'drawing' THEN 
        'Estrazione in corso...'
      WHEN v_cycle.status = 'completed' THEN 
        'La Missione è conclusa. Verifica i risultati!'
      ELSE 'Stato sconosciuto'
    END
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 3: get_active_lottery_cycle
-- Restituisce il ciclo attivo corrente (shortcut)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_active_lottery_cycle()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.get_lottery_status(NULL);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 4: get_user_lottery_tickets
-- Lista ticket utente (senza esporre seed)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_lottery_tickets(
  p_cycle_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_tickets JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Non autenticato'
    );
  END IF;
  
  SELECT jsonb_agg(jsonb_build_object(
    'id', lt.id,
    'status', lt.status,
    'created_at', lt.created_at,
    'ticket_hash', lt.ticket_hash, -- Solo hash, mai seed
    'draw_rank', lt.draw_rank,
    'prize_amount', lt.prize_amount
  ) ORDER BY lt.created_at DESC)
  INTO v_tickets
  FROM public.lottery_tickets lt
  WHERE lt.cycle_id = p_cycle_id AND lt.user_id = v_user_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', p_cycle_id,
    'tickets', COALESCE(v_tickets, '[]'::jsonb),
    'count', (SELECT COUNT(*) FROM public.lottery_tickets WHERE cycle_id = p_cycle_id AND user_id = v_user_id)
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.buy_lottery_tickets(UUID, INT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lottery_status(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_active_lottery_cycle() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_lottery_tickets(UUID) TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.buy_lottery_tickets IS 
'M1SSION™ Lottery - Acquisto atomico di N biglietti con idempotenza e cap utente.';

COMMENT ON FUNCTION public.get_lottery_status IS 
'M1SSION™ Lottery - Status completo ciclo con statistiche utente.';

COMMENT ON FUNCTION public.get_active_lottery_cycle IS 
'M1SSION™ Lottery - Shortcut per ciclo attivo corrente.';

COMMENT ON FUNCTION public.get_user_lottery_tickets IS 
'M1SSION™ Lottery - Lista ticket utente (senza seed esposto).';

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY RPC v1.0
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — ADMIN/DRAW FUNCTIONS
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- FUNZIONI ADMIN:
-- 1. create_lottery_cycle(...) — Crea nuovo ciclo
-- 2. finalize_cycle_and_draw(cycle_id) — Estrazione finale con prize_multiplier
-- 3. cancel_lottery_cycle(cycle_id) — Annulla ciclo con refund
-- 4. admin_get_lottery_analytics() — Analytics per admin
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 1: create_lottery_cycle
-- Crea un nuovo ciclo lotteria (solo admin)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_lottery_cycle(
  p_starts_at TIMESTAMPTZ DEFAULT now(),
  p_duration_days INT DEFAULT 30,
  p_ticket_price_m1u INT DEFAULT 10,
  p_min_tickets_required INT DEFAULT 4000,
  p_max_tickets_per_user INT DEFAULT 100,
  p_prizes_json JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle_id UUID;
  v_ends_at TIMESTAMPTZ;
  v_default_prizes JSONB := '[
    {"rank": 1, "percent": 50, "label": "1° Premio"},
    {"rank": 2, "percent": 30, "label": "2° Premio"},
    {"rank": 3, "percent": 20, "label": "3° Premio"}
  ]'::jsonb;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono creare cicli lotteria'
    );
  END IF;
  
  -- Verifica no cicli attivi sovrapposti
  IF EXISTS (
    SELECT 1 FROM public.mission_cycles
    WHERE status = 'active'
    AND (p_starts_at, p_starts_at + (p_duration_days || ' days')::interval) 
        OVERLAPS (starts_at, ends_at)
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'OVERLAPPING_CYCLE',
      'message', 'Esiste già un ciclo attivo che si sovrappone a queste date'
    );
  END IF;
  
  v_ends_at := p_starts_at + (p_duration_days || ' days')::interval;
  
  -- Crea ciclo
  INSERT INTO public.mission_cycles (
    starts_at,
    ends_at,
    status,
    ticket_price_m1u,
    min_tickets_required,
    max_tickets_per_user,
    prizes_json,
    created_by
  )
  VALUES (
    p_starts_at,
    v_ends_at,
    CASE WHEN p_starts_at <= now() THEN 'active' ELSE 'active' END,
    p_ticket_price_m1u,
    p_min_tickets_required,
    p_max_tickets_per_user,
    COALESCE(p_prizes_json, v_default_prizes),
    v_user_id
  )
  RETURNING id INTO v_cycle_id;
  
  -- Audit log
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    v_cycle_id,
    v_user_id,
    'cycle_created',
    jsonb_build_object(
      'starts_at', p_starts_at,
      'ends_at', v_ends_at,
      'duration_days', p_duration_days,
      'ticket_price_m1u', p_ticket_price_m1u,
      'min_tickets_required', p_min_tickets_required,
      'max_tickets_per_user', p_max_tickets_per_user
    )
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', v_cycle_id,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'message', 'Ciclo lotteria creato con successo'
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 2: finalize_cycle_and_draw
-- Esegue l'estrazione finale con calcolo prize_multiplier
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.finalize_cycle_and_draw(
  p_cycle_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle RECORD;
  v_draw_id UUID;
  v_public_seed TEXT;
  v_prize_multiplier NUMERIC(5,4);
  v_threshold_reached BOOLEAN;
  v_total_prize_pool INT;
  v_winners JSONB := '[]'::jsonb;
  v_ranked_tickets RECORD;
  v_prize_config RECORD;
  v_rank_counter INT := 0;
  v_prize_amount INT;
  v_winner_user_id UUID;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. VERIFICA AUTORIZZAZIONE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono eseguire l''estrazione'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. RECUPERA E BLOCCA CICLO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo non trovato'
    );
  END IF;
  
  IF v_cycle.status NOT IN ('active', 'locking') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'INVALID_STATUS',
      'message', format('Il ciclo è in stato "%s", non può essere estratto', v_cycle.status)
    );
  END IF;
  
  -- Verifica almeno 1 ticket
  IF v_cycle.total_tickets = 0 THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NO_TICKETS',
      'message', 'Nessun biglietto venduto, estrazione non possibile'
    );
  END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. LOCK CICLO (no nuovi acquisti)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  UPDATE public.mission_cycles
  SET status = 'drawing', updated_at = now()
  WHERE id = p_cycle_id;
  
  -- Audit
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'draw_started',
    jsonb_build_object('total_tickets', v_cycle.total_tickets)
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. GENERA PUBLIC SEED (verifiable randomness)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_public_seed := encode(
    sha256(
      (
        p_cycle_id::text || 
        now()::text || 
        gen_random_uuid()::text || 
        v_cycle.total_tickets::text ||
        (SELECT string_agg(id::text, '') FROM public.lottery_tickets WHERE cycle_id = p_cycle_id ORDER BY created_at LIMIT 10)
      )::bytea
    ),
    'hex'
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. CALCOLA PRIZE MULTIPLIER (CONTROMISURA SOGLIA)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  v_threshold_reached := v_cycle.total_tickets >= v_cycle.min_tickets_required;
  
  IF v_threshold_reached THEN
    v_prize_multiplier := 1.0000;
  ELSE
    -- Multiplier proporzionale, con minimo 0.25 (25%)
    v_prize_multiplier := GREATEST(
      0.2500,
      ROUND(v_cycle.total_tickets::numeric / v_cycle.min_tickets_required, 4)
    );
  END IF;
  
  -- Prize pool effettivo
  v_total_prize_pool := v_cycle.prize_pool_total;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. ESTRAZIONE VINCITORI (ranking deterministico basato su seed)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Per ogni ticket, calcola un rank_score = hash(public_seed + ticket_seed)
  -- Ordina per rank_score, i primi N sono i vincitori
  
  FOR v_ranked_tickets IN (
    SELECT 
      lt.id AS ticket_id,
      lt.user_id,
      lt.ticket_seed,
      encode(
        sha256((v_public_seed || lt.ticket_seed::text || lt.id::text)::bytea),
        'hex'
      ) AS rank_score
    FROM public.lottery_tickets lt
    WHERE lt.cycle_id = p_cycle_id AND lt.status = 'active'
    ORDER BY rank_score ASC
    LIMIT 3 -- Top 3
  ) LOOP
    v_rank_counter := v_rank_counter + 1;
    
    -- Calcola premio per questo rank
    SELECT 
      (elem->>'percent')::numeric / 100 * v_total_prize_pool * v_prize_multiplier
    INTO v_prize_amount
    FROM jsonb_array_elements(v_cycle.prizes_json) elem
    WHERE (elem->>'rank')::int = v_rank_counter;
    
    v_prize_amount := COALESCE(FLOOR(v_prize_amount), 0);
    
    -- Aggiorna ticket come vincitore
    UPDATE public.lottery_tickets
    SET status = 'winner',
        draw_rank = v_rank_counter,
        prize_amount = v_prize_amount
    WHERE id = v_ranked_tickets.ticket_id;
    
    -- Accredita M1U al vincitore
    IF v_prize_amount > 0 THEN
      UPDATE public.profiles
      SET m1_units = m1_units + v_prize_amount,
          updated_at = now()
      WHERE id = v_ranked_tickets.user_id;
      
      -- Registra in prize_awards
      INSERT INTO public.prize_awards (
        award_type, prize_id, user_id, source, evidence
      )
      VALUES (
        'event',
        'lottery_' || p_cycle_id::text || '_rank_' || v_rank_counter,
        v_ranked_tickets.user_id,
        'lottery_draw',
        jsonb_build_object(
          'cycle_id', p_cycle_id,
          'ticket_id', v_ranked_tickets.ticket_id,
          'rank', v_rank_counter,
          'prize_amount', v_prize_amount,
          'prize_multiplier', v_prize_multiplier
        )
      );
      
      -- Analytics
      INSERT INTO public.analytics_events (
        event_name, user_id, session_id, platform, props, event_version
      )
      VALUES (
        'lottery_prize_awarded',
        v_ranked_tickets.user_id,
        'server',
        'web',
        jsonb_build_object(
          'cycle_id', p_cycle_id,
          'rank', v_rank_counter,
          'prize_amount', v_prize_amount
        ),
        1
      );
    END IF;
    
    -- Aggiungi a winners JSON
    v_winners := v_winners || jsonb_build_object(
      'rank', v_rank_counter,
      'user_id', v_ranked_tickets.user_id,
      'ticket_id', v_ranked_tickets.ticket_id,
      'prize_m1u', v_prize_amount
    );
  END LOOP;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. CREA RECORD DRAW (immutabile)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_draws (
    cycle_id,
    draw_started_at,
    draw_completed_at,
    public_seed,
    algorithm_version,
    winners,
    total_tickets_at_draw,
    total_participants_at_draw,
    prize_multiplier,
    threshold_reached
  )
  VALUES (
    p_cycle_id,
    now() - interval '1 second', -- started appena prima
    now(),
    v_public_seed,
    'v1.0.0',
    v_winners,
    v_cycle.total_tickets,
    v_cycle.total_participants,
    v_prize_multiplier,
    v_threshold_reached
  )
  RETURNING id INTO v_draw_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. AGGIORNA CICLO COME COMPLETATO
  -- ═══════════════════════════════════════════════════════════════════════════
  
  UPDATE public.mission_cycles
  SET status = 'completed',
      prize_multiplier = v_prize_multiplier,
      prizes_effective_json = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'rank', (elem->>'rank')::int,
            'percent', (elem->>'percent')::numeric,
            'label', elem->>'label',
            'amount_m1u', FLOOR(
              (elem->>'percent')::numeric / 100 * v_total_prize_pool * v_prize_multiplier
            )
          )
        )
        FROM jsonb_array_elements(v_cycle.prizes_json) elem
      ),
      updated_at = now()
  WHERE id = p_cycle_id;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 9. AUDIT FINALE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'draw_completed',
    jsonb_build_object(
      'draw_id', v_draw_id,
      'winners', v_winners,
      'prize_multiplier', v_prize_multiplier,
      'threshold_reached', v_threshold_reached,
      'public_seed', v_public_seed
    )
  );
  
  -- Analytics globale
  INSERT INTO public.analytics_events (
    event_name, user_id, session_id, platform, props, event_version
  )
  VALUES (
    'lottery_draw_complete',
    v_user_id,
    'server',
    'web',
    jsonb_build_object(
      'cycle_id', p_cycle_id,
      'draw_id', v_draw_id,
      'total_tickets', v_cycle.total_tickets,
      'winners_count', jsonb_array_length(v_winners),
      'prize_multiplier', v_prize_multiplier,
      'threshold_reached', v_threshold_reached
    ),
    1
  );
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 10. RETURN SUCCESS
  -- ═══════════════════════════════════════════════════════════════════════════
  
  RETURN jsonb_build_object(
    'status', 'success',
    'draw_id', v_draw_id,
    'cycle_id', p_cycle_id,
    'total_tickets', v_cycle.total_tickets,
    'total_participants', v_cycle.total_participants,
    'prize_pool_total', v_total_prize_pool,
    'prize_multiplier', v_prize_multiplier,
    'threshold_reached', v_threshold_reached,
    'winners', v_winners,
    'public_seed', v_public_seed,
    'message', CASE 
      WHEN v_threshold_reached THEN 
        'Estrazione completata! Soglia raggiunta, premi al 100%!'
      ELSE 
        format('Estrazione completata! Soglia non raggiunta (%.0f%%), premi ridotti.', v_prize_multiplier * 100)
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback status
    UPDATE public.mission_cycles
    SET status = 'active', updated_at = now()
    WHERE id = p_cycle_id AND status = 'drawing';
    
    -- Log errore
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, event_type, event_details
    )
    VALUES (
      p_cycle_id, v_user_id, 'error',
      jsonb_build_object('error', SQLERRM, 'phase', 'draw')
    );
    
    RAISE LOG 'Error in finalize_cycle_and_draw: %', SQLERRM;
    
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DRAW_FAILED',
      'message', 'Errore durante l''estrazione. Il ciclo è stato ripristinato.',
      'error', SQLERRM
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 3: cancel_lottery_cycle
-- Annulla un ciclo e rimborsa tutti i partecipanti
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cancel_lottery_cycle(
  p_cycle_id UUID,
  p_reason TEXT DEFAULT 'Admin cancellation'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_cycle RECORD;
  v_refund_count INT := 0;
  v_total_refunded INT := 0;
  v_purchase RECORD;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono annullare cicli'
    );
  END IF;
  
  -- Recupera ciclo
  SELECT * INTO v_cycle
  FROM public.mission_cycles
  WHERE id = p_cycle_id
  FOR UPDATE;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'CYCLE_NOT_FOUND',
      'message', 'Ciclo non trovato'
    );
  END IF;
  
  IF v_cycle.status = 'completed' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'ALREADY_COMPLETED',
      'message', 'Il ciclo è già completato, non può essere annullato'
    );
  END IF;
  
  IF v_cycle.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'ALREADY_CANCELLED',
      'message', 'Il ciclo è già stato annullato'
    );
  END IF;
  
  -- Rimborsa tutti gli acquisti
  FOR v_purchase IN (
    SELECT * FROM public.lottery_purchases
    WHERE cycle_id = p_cycle_id AND status = 'completed'
  ) LOOP
    -- Accredita M1U
    UPDATE public.profiles
    SET m1_units = m1_units + v_purchase.total_m1u,
        updated_at = now()
    WHERE id = v_purchase.user_id;
    
    -- Marca come refunded
    UPDATE public.lottery_purchases
    SET status = 'refunded', refunded_at = now()
    WHERE id = v_purchase.id;
    
    -- Voida i ticket
    UPDATE public.lottery_tickets
    SET status = 'void'
    WHERE purchase_id = v_purchase.id;
    
    v_refund_count := v_refund_count + 1;
    v_total_refunded := v_total_refunded + v_purchase.total_m1u;
    
    -- Audit per singolo refund
    INSERT INTO public.lottery_audit_logs (
      cycle_id, user_id, purchase_id, event_type, event_details
    )
    VALUES (
      p_cycle_id, v_purchase.user_id, v_purchase.id, 'ticket_refunded',
      jsonb_build_object('amount', v_purchase.total_m1u, 'reason', p_reason)
    );
  END LOOP;
  
  -- Aggiorna ciclo come cancelled
  UPDATE public.mission_cycles
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_cycle_id;
  
  -- Audit finale
  INSERT INTO public.lottery_audit_logs (
    cycle_id, user_id, event_type, event_details
  )
  VALUES (
    p_cycle_id, v_user_id, 'cycle_cancelled',
    jsonb_build_object(
      'reason', p_reason,
      'refunds_count', v_refund_count,
      'total_refunded', v_total_refunded
    )
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'cycle_id', p_cycle_id,
    'refunds_count', v_refund_count,
    'total_refunded', v_total_refunded,
    'message', format('Ciclo annullato. Rimborsati %s acquisti per un totale di %s M1U.', v_refund_count, v_total_refunded)
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE 4: admin_get_lottery_analytics
-- Analytics dettagliate per admin
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.admin_get_lottery_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- Verifica admin
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_user_role NOT IN ('admin', 'owner') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'UNAUTHORIZED',
      'message', 'Solo gli admin possono vedere le analytics'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'success',
    
    -- Cicli totali
    'cycles', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')
      )
      FROM public.mission_cycles
    ),
    
    -- Vendite totali
    'sales', (
      SELECT jsonb_build_object(
        'total_purchases', COUNT(*),
        'total_tickets', SUM(tickets_count),
        'total_m1u', SUM(total_m1u),
        'unique_users', COUNT(DISTINCT user_id)
      )
      FROM public.lottery_purchases
      WHERE status = 'completed'
    ),
    
    -- Premi distribuiti
    'prizes', (
      SELECT jsonb_build_object(
        'total_winners', COUNT(*),
        'total_m1u_awarded', SUM(prize_amount),
        'avg_prize', ROUND(AVG(prize_amount), 2)
      )
      FROM public.lottery_tickets
      WHERE status = 'winner' AND prize_amount > 0
    ),
    
    -- Ultimi 10 cicli
    'recent_cycles', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', mc.id,
        'status', mc.status,
        'starts_at', mc.starts_at,
        'ends_at', mc.ends_at,
        'total_tickets', mc.total_tickets,
        'total_participants', mc.total_participants,
        'prize_pool_total', mc.prize_pool_total,
        'prize_multiplier', mc.prize_multiplier
      ) ORDER BY mc.created_at DESC)
      FROM public.mission_cycles mc
      LIMIT 10
    ),
    
    -- Ultimi 20 acquisti
    'recent_purchases', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', lp.id,
        'user_id', lp.user_id,
        'tickets_count', lp.tickets_count,
        'total_m1u', lp.total_m1u,
        'created_at', lp.created_at
      ) ORDER BY lp.created_at DESC)
      FROM public.lottery_purchases lp
      WHERE lp.status = 'completed'
      LIMIT 20
    )
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ══════════════════════════════════════════════════════════════════════════════

-- Admin-only functions
GRANT EXECUTE ON FUNCTION public.create_lottery_cycle(TIMESTAMPTZ, INT, INT, INT, INT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_cycle_and_draw(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_lottery_cycle(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_lottery_analytics() TO authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTI
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION public.create_lottery_cycle IS 
'M1SSION™ Lottery - Crea nuovo ciclo (solo admin). Verifica no overlap.';

COMMENT ON FUNCTION public.finalize_cycle_and_draw IS 
'M1SSION™ Lottery - Estrazione finale con prize_multiplier e assegnazione premi.';

COMMENT ON FUNCTION public.cancel_lottery_cycle IS 
'M1SSION™ Lottery - Annulla ciclo con refund completo (solo admin).';

COMMENT ON FUNCTION public.admin_get_lottery_analytics IS 
'M1SSION™ Lottery - Analytics complete per admin.';

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY ADMIN/DRAW v1.0
-- ══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — SEED TEST CYCLE
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- CREA UN CICLO DI TEST INIZIALE PER SVILUPPO
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- Crea ciclo di test (30 giorni da oggi)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.mission_cycles (
  starts_at,
  ends_at,
  status,
  ticket_price_m1u,
  min_tickets_required,
  max_tickets_per_user,
  prizes_json,
  created_by
)
VALUES (
  now(),
  now() + interval '30 days',
  'active',
  10,                                    -- 10 M1U per ticket
  4000,                                  -- Soglia minima
  100,                                   -- Max per utente
  '[
    {"rank": 1, "percent": 50, "label": "1° Premio - Il Grande Vincitore"},
    {"rank": 2, "percent": 30, "label": "2° Premio - Il Secondo"},
    {"rank": 3, "percent": 20, "label": "3° Premio - Il Terzo"}
  ]'::jsonb,
  NULL                                   -- Creato da sistema
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Log creazione
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_cycle_id UUID;
BEGIN
  SELECT id INTO v_cycle_id FROM public.mission_cycles WHERE status = 'active' LIMIT 1;
  
  IF v_cycle_id IS NOT NULL THEN
    INSERT INTO public.lottery_audit_logs (
      cycle_id, event_type, event_details
    )
    VALUES (
      v_cycle_id,
      'cycle_created',
      jsonb_build_object(
        'source', 'seed_migration',
        'note', 'Test cycle created for development'
      )
    );
    
    RAISE NOTICE 'Test lottery cycle created: %', v_cycle_id;
  END IF;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY TEST SEED v1.0
-- ══════════════════════════════════════════════════════════════════════════════

