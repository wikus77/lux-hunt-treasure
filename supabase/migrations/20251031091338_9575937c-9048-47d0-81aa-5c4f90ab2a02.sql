-- ═══════════════════════════════════════════════════════════════════════════
-- M1SSION™ — PULSE ENERGY + GERARCHIA v2.0 — STRUTTURA BASE
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ═══════════════════════════════════════════════════════════════════════════

-- ============================================
-- FASE 1: Tabella agent_ranks (Catalogo Gerarchia)
-- ============================================

CREATE TABLE IF NOT EXISTS public.agent_ranks (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_it TEXT NOT NULL,
  description TEXT,
  pe_min INT NOT NULL,
  pe_max INT,
  color TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_ranks_pe_range ON agent_ranks (pe_min, pe_max);
CREATE INDEX IF NOT EXISTS idx_agent_ranks_code ON agent_ranks (code);

-- Seed data: Gerarchia M1SSION v2.0 (Recruit → Master + MCP)
INSERT INTO agent_ranks (code, name_en, name_it, description, pe_min, pe_max, color, symbol) VALUES
('AG-01', 'Recruit', 'Recluta', 'Nuovo agente in addestramento', 0, 999, '#808080', '🎖️'),
('AG-02', 'Field Agent', 'Agente sul Campo', 'Operativo base certificato', 1000, 2499, '#4A90E2', '🔰'),
('OP-03', 'Operative', 'Operativo', 'Agente esperto con missioni completate', 2500, 4999, '#50C878', '⚡'),
('SP-04', 'Specialist', 'Specialista', 'Esperto in tecniche avanzate', 5000, 9999, '#9370DB', '🎯'),
('SH-05', 'Shadow Operative', 'Operativo Ombra', 'Elite nell''infiltrazione', 10000, 19999, '#2F4F4F', '👁️'),
('EA-06', 'Elite Agent', 'Agente Elite', 'Top 5% degli agenti', 20000, 39999, '#FFD700', '⭐'),
('CM-07', 'Commander', 'Comandante', 'Leader di squadre operative', 40000, 79999, '#FF6347', '🎖️'),
('DR-08', 'Director', 'Direttore', 'Gestione strategica nazionale', 80000, 149999, '#8B0000', '🏆'),
('GM-09', 'Grand Master', 'Gran Maestro', 'Leggenda vivente del network', 150000, 299999, '#4B0082', '👑'),
('M1-10', 'Master', 'Maestro', 'Vertice della gerarchia', 300000, NULL, '#000080', '💎'),
('SRC-∞', 'MCP - Master Control Program', 'MCP - Programma di Controllo Principale', 'Grado riservato a Joseph Mulé', 999999999, NULL, '#FF0000', '🔺')
ON CONFLICT (code) DO NOTHING;

-- RLS Policies agent_ranks
ALTER TABLE agent_ranks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_ranks_public_read ON agent_ranks;
CREATE POLICY agent_ranks_public_read ON agent_ranks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS agent_ranks_admin_write ON agent_ranks;
CREATE POLICY agent_ranks_admin_write ON agent_ranks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FASE 2: Estensione profiles con pulse_energy e rank_id
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pulse_energy INT DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rank_id INT REFERENCES agent_ranks(id),
ADD COLUMN IF NOT EXISTS rank_updated_at TIMESTAMPTZ;

-- Indexes profiles
CREATE INDEX IF NOT EXISTS idx_profiles_pulse_energy ON profiles (pulse_energy DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rank_id ON profiles (rank_id);

-- Inizializza pulse_energy da user_xp.total_xp (backward compat sync)
UPDATE profiles p
SET pulse_energy = COALESCE(
  (SELECT total_xp FROM user_xp WHERE user_id = p.id),
  0
)
WHERE pulse_energy = 0;

-- Calcola rank_id iniziale basato su pulse_energy
UPDATE profiles p
SET 
  rank_id = (
    SELECT id FROM agent_ranks
    WHERE pe_min <= p.pulse_energy
      AND (pe_max IS NULL OR p.pulse_energy < pe_max)
    ORDER BY pe_min DESC
    LIMIT 1
  ),
  rank_updated_at = NOW()
WHERE rank_id IS NULL;

-- ============================================
-- FASE 3: Tabella rank_history (Storico Promozioni)
-- ============================================

CREATE TABLE IF NOT EXISTS public.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_rank_id INT REFERENCES agent_ranks(id),
  new_rank_id INT NOT NULL REFERENCES agent_ranks(id),
  delta_pe INT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes rank_history
CREATE INDEX IF NOT EXISTS idx_rank_history_user_id ON rank_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_history_new_rank ON rank_history (new_rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_created_at ON rank_history (created_at DESC);

-- RLS Policies rank_history
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rank_history_self_read ON rank_history;
CREATE POLICY rank_history_self_read ON rank_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS rank_history_service_insert ON rank_history;
CREATE POLICY rank_history_service_insert ON rank_history
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'service_role'
  );

DROP POLICY IF EXISTS rank_history_admin_read ON rank_history;
CREATE POLICY rank_history_admin_read ON rank_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FASE 4: Funzioni award_pulse_energy + recompute_rank
-- ============================================

-- Funzione principale: Assegna PE + auto-rank-up
CREATE OR REPLACE FUNCTION award_pulse_energy(
  p_user_id UUID,
  p_delta_pe INT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_old_pe INT;
  v_new_pe INT;
  v_old_rank_id INT;
  v_new_rank_id INT;
  v_rank_changed BOOLEAN := FALSE;
BEGIN
  -- Lock profile row for update
  SELECT pulse_energy, rank_id INTO v_old_pe, v_old_rank_id
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  -- Calculate new PE
  v_new_pe := v_old_pe + p_delta_pe;

  -- Update pulse_energy in profiles
  UPDATE profiles
  SET 
    pulse_energy = v_new_pe,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Sync user_xp for backward compatibility
  UPDATE user_xp
  SET 
    total_xp = v_new_pe,
    xp_since_reward = xp_since_reward + p_delta_pe
  WHERE user_id = p_user_id;

  -- Recompute rank based on new PE
  SELECT id INTO v_new_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_new_pe
    AND (pe_max IS NULL OR v_new_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Check if rank changed
  IF v_new_rank_id IS DISTINCT FROM v_old_rank_id THEN
    v_rank_changed := TRUE;

    -- Update rank in profiles
    UPDATE profiles
    SET 
      rank_id = v_new_rank_id,
      rank_updated_at = NOW()
    WHERE id = p_user_id;

    -- Log rank change in history
    INSERT INTO rank_history (user_id, old_rank_id, new_rank_id, delta_pe, reason, metadata)
    VALUES (p_user_id, v_old_rank_id, v_new_rank_id, p_delta_pe, p_reason, p_metadata);
  END IF;

  -- Return result JSON
  RETURN jsonb_build_object(
    'success', TRUE,
    'old_pe', v_old_pe,
    'new_pe', v_new_pe,
    'delta_pe', p_delta_pe,
    'rank_changed', v_rank_changed,
    'old_rank_id', v_old_rank_id,
    'new_rank_id', v_new_rank_id,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione utility: Ricalcola rank (idempotente)
CREATE OR REPLACE FUNCTION recompute_rank(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_pe INT;
  v_correct_rank_id INT;
  v_updated BOOLEAN := FALSE;
BEGIN
  -- Get current PE
  SELECT pulse_energy INTO v_current_pe
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found in profiles', p_user_id;
  END IF;

  -- Calculate correct rank
  SELECT id INTO v_correct_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_current_pe
    AND (pe_max IS NULL OR v_current_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Update if different
  UPDATE profiles
  SET 
    rank_id = v_correct_rank_id,
    rank_updated_at = NOW()
  WHERE id = p_user_id
    AND rank_id IS DISTINCT FROM v_correct_rank_id;

  v_updated := FOUND;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 5: Protezione MCP (SRC-∞) Rank
-- ============================================

CREATE OR REPLACE FUNCTION prevent_mcp_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mcp_rank_id INT;
  v_is_joseph BOOLEAN := FALSE;
BEGIN
  -- Get MCP rank ID
  SELECT id INTO v_mcp_rank_id
  FROM agent_ranks
  WHERE code = 'SRC-∞';

  -- Skip check if MCP rank doesn't exist or rank_id not changing to MCP
  IF v_mcp_rank_id IS NULL OR NEW.rank_id != v_mcp_rank_id THEN
    RETURN NEW;
  END IF;

  -- Check if user is Joseph (admin with specific email)
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE p.id = NEW.id
      AND p.role = 'admin'
      AND u.email = 'wikus77@hotmail.it'
  ) INTO v_is_joseph;

  -- Block MCP assignment for non-Joseph users
  IF NOT v_is_joseph THEN
    RAISE EXCEPTION 'MCP rank (SRC-∞) is reserved for Joseph Mulé only. User: %, Rank: %', NEW.id, NEW.rank_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_mcp_protection ON profiles;

CREATE TRIGGER enforce_mcp_protection
  BEFORE UPDATE OF rank_id ON profiles
  FOR EACH ROW
  WHEN (NEW.rank_id IS DISTINCT FROM OLD.rank_id)
  EXECUTE FUNCTION prevent_mcp_assignment();

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAZIONE COMPLETATA ✅
-- Nota: I trigger XP→PE per Buzz/Map/Referral devono essere aggiunti separatamente
-- una volta identificate le tabelle e i punti di integrazione corretti.
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ═══════════════════════════════════════════════════════════════════════════