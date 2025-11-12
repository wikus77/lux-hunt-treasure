-- FASE 1 - BATTLE SYSTEM DATA MODEL BASE
-- Creazione tabelle fondamentali con RLS e indici (idempotente)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- ============================================================================
-- 1. BATTLE_SESSIONS - Tabella principale sessioni di battaglia
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'battle_sessions') THEN
    CREATE TABLE public.battle_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      attacker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      defender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'await_defense' CHECK (status IN ('await_defense', 'resolved', 'cancelled')),
      started_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      ended_at timestamptz,
      winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      weapon_key text NOT NULL,
      defense_key text,
      audit_seed_hash text,
      metadata jsonb DEFAULT '{}'::jsonb,
      version integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      
      -- Constraint: attacker != defender
      CONSTRAINT battle_sessions_different_users CHECK (attacker_id != defender_id)
    );
    
    RAISE NOTICE '✓ Tabella battle_sessions creata';
  ELSE
    RAISE NOTICE '→ Tabella battle_sessions già esistente';
  END IF;
END $$;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_battle_sessions_attacker 
  ON public.battle_sessions(attacker_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_battle_sessions_defender_status 
  ON public.battle_sessions(defender_id, status);

CREATE INDEX IF NOT EXISTS idx_battle_sessions_expires 
  ON public.battle_sessions(expires_at) 
  WHERE status = 'await_defense';

-- Indice parziale unico: un attaccante può avere solo una battaglia attiva
CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_sessions_active_attacker 
  ON public.battle_sessions(attacker_id) 
  WHERE status = 'await_defense';

-- Indice parziale unico: un difensore può avere solo una battaglia attiva
CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_sessions_active_defender 
  ON public.battle_sessions(defender_id) 
  WHERE status = 'await_defense';

-- Enable RLS
ALTER TABLE public.battle_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono vedere solo le proprie battaglie
DROP POLICY IF EXISTS "Users can view own battles" ON public.battle_sessions;
CREATE POLICY "Users can view own battles" 
  ON public.battle_sessions 
  FOR SELECT 
  USING (auth.uid() IN (attacker_id, defender_id));

-- Policy: solo RPC può inserire
DROP POLICY IF EXISTS "Only RPC can insert battles" ON public.battle_sessions;
CREATE POLICY "Only RPC can insert battles" 
  ON public.battle_sessions 
  FOR INSERT 
  WITH CHECK (false);

-- Policy: solo RPC può aggiornare
DROP POLICY IF EXISTS "Only RPC can update battles" ON public.battle_sessions;
CREATE POLICY "Only RPC can update battles" 
  ON public.battle_sessions 
  FOR UPDATE 
  USING (false);

-- ============================================================================
-- 2. BATTLE_ACTIONS - Log di tutte le azioni (attacco/difesa)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'battle_actions') THEN
    CREATE TABLE public.battle_actions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES public.battle_sessions(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('attacker', 'defender')),
      action_type text NOT NULL CHECK (action_type IN ('attack', 'defend')),
      item_key text NOT NULL,
      energy_cost_m1u numeric(10,2) NOT NULL DEFAULT 0,
      nonce text NOT NULL,
      result jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      
      -- Constraint: nonce unico per sessione
      CONSTRAINT battle_actions_unique_nonce UNIQUE (session_id, nonce)
    );
    
    RAISE NOTICE '✓ Tabella battle_actions creata';
  ELSE
    RAISE NOTICE '→ Tabella battle_actions già esistente';
  END IF;
END $$;

-- Indici
CREATE INDEX IF NOT EXISTS idx_battle_actions_session 
  ON public.battle_actions(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_battle_actions_user 
  ON public.battle_actions(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.battle_actions ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo le azioni delle proprie battaglie
DROP POLICY IF EXISTS "Users can view own battle actions" ON public.battle_actions;
CREATE POLICY "Users can view own battle actions" 
  ON public.battle_actions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_sessions bs
      WHERE bs.id = session_id 
        AND auth.uid() IN (bs.attacker_id, bs.defender_id)
    )
  );

-- Policy: solo RPC può inserire
DROP POLICY IF EXISTS "Only RPC can insert actions" ON public.battle_actions;
CREATE POLICY "Only RPC can insert actions" 
  ON public.battle_actions 
  FOR INSERT 
  WITH CHECK (false);

-- ============================================================================
-- 3. USER_ARSENAL - Inventario armi/difese degli utenti
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'user_arsenal') THEN
    CREATE TABLE public.user_arsenal (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      item_type text NOT NULL CHECK (item_type IN ('weapon', 'defense', 'stealth')),
      item_key text NOT NULL,
      quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      acquired_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      
      -- Constraint: una riga per user + item
      CONSTRAINT user_arsenal_unique_item UNIQUE (user_id, item_type, item_key)
    );
    
    RAISE NOTICE '✓ Tabella user_arsenal creata';
  ELSE
    RAISE NOTICE '→ Tabella user_arsenal già esistente';
  END IF;
END $$;

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_arsenal_user 
  ON public.user_arsenal(user_id, item_type);

-- Enable RLS
ALTER TABLE public.user_arsenal ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo il proprio inventario
DROP POLICY IF EXISTS "Users can view own arsenal" ON public.user_arsenal;
CREATE POLICY "Users can view own arsenal" 
  ON public.user_arsenal 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: RPC può inserire/aggiornare
DROP POLICY IF EXISTS "RPC can manage arsenal" ON public.user_arsenal;
CREATE POLICY "RPC can manage arsenal" 
  ON public.user_arsenal 
  FOR ALL 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. WEAPONS_CATALOG - Catalogo armi disponibili
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'weapons_catalog') THEN
    CREATE TABLE public.weapons_catalog (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      key text NOT NULL UNIQUE,
      name text NOT NULL,
      description text,
      power numeric(5,2) NOT NULL CHECK (power > 0),
      m1u_cost numeric(10,2) NOT NULL DEFAULT 0 CHECK (m1u_cost >= 0),
      cooldown_sec integer NOT NULL DEFAULT 0 CHECK (cooldown_sec >= 0),
      effect_key text NOT NULL,
      min_rank integer NOT NULL DEFAULT 1,
      enabled boolean NOT NULL DEFAULT true,
      metadata jsonb DEFAULT '{}'::jsonb,
      version integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    RAISE NOTICE '✓ Tabella weapons_catalog creata';
  ELSE
    RAISE NOTICE '→ Tabella weapons_catalog già esistente';
  END IF;
END $$;

-- Policy: tutti possono leggere il catalogo
ALTER TABLE public.weapons_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view weapons catalog" ON public.weapons_catalog;
CREATE POLICY "Anyone can view weapons catalog" 
  ON public.weapons_catalog 
  FOR SELECT 
  USING (enabled = true);

-- ============================================================================
-- 5. USER_COOLDOWNS - Gestione cooldown per azioni
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'user_cooldowns') THEN
    CREATE TABLE public.user_cooldowns (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      cooldown_key text NOT NULL,
      until_ts timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      
      -- Constraint: un cooldown per chiave
      CONSTRAINT user_cooldowns_unique_key UNIQUE (user_id, cooldown_key)
    );
    
    RAISE NOTICE '✓ Tabella user_cooldowns creata';
  ELSE
    RAISE NOTICE '→ Tabella user_cooldowns già esistente';
  END IF;
END $$;

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_cooldowns_user 
  ON public.user_cooldowns(user_id, until_ts);

-- Auto-cleanup expired cooldowns
CREATE INDEX IF NOT EXISTS idx_user_cooldowns_cleanup 
  ON public.user_cooldowns(until_ts) 
  WHERE until_ts < now();

-- Enable RLS
ALTER TABLE public.user_cooldowns ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri cooldown
DROP POLICY IF EXISTS "Users can view own cooldowns" ON public.user_cooldowns;
CREATE POLICY "Users can view own cooldowns" 
  ON public.user_cooldowns 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: RPC può gestire cooldowns
DROP POLICY IF EXISTS "RPC can manage cooldowns" ON public.user_cooldowns;
CREATE POLICY "RPC can manage cooldowns" 
  ON public.user_cooldowns 
  FOR ALL 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. REALTIME PUBLICATION
-- ============================================================================
DO $$
BEGIN
  -- Aggiungi battle_sessions a realtime se non già presente
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'battle_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_sessions;
    RAISE NOTICE '✓ battle_sessions aggiunta a supabase_realtime';
  ELSE
    RAISE NOTICE '→ battle_sessions già in supabase_realtime';
  END IF;
END $$;

-- ============================================================================
-- 7. TRIGGER PER UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applica trigger alle tabelle con updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_battle_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_battle_sessions_updated_at
      BEFORE UPDATE ON public.battle_sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✓ Trigger updated_at creato per battle_sessions';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_arsenal_updated_at'
  ) THEN
    CREATE TRIGGER update_user_arsenal_updated_at
      BEFORE UPDATE ON public.user_arsenal
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✓ Trigger updated_at creato per user_arsenal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_weapons_catalog_updated_at'
  ) THEN
    CREATE TRIGGER update_weapons_catalog_updated_at
      BEFORE UPDATE ON public.weapons_catalog
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✓ Trigger updated_at creato per weapons_catalog';
  END IF;
END $$;

-- ============================================================================
-- 8. SEED DATI INIZIALI - Armi base
-- ============================================================================
DO $$
BEGIN
  -- Inserisci armi base solo se tabella vuota
  IF NOT EXISTS (SELECT 1 FROM public.weapons_catalog LIMIT 1) THEN
    INSERT INTO public.weapons_catalog (key, name, description, power, m1u_cost, cooldown_sec, effect_key, min_rank)
    VALUES
      ('pulse_beam', 'Pulse Beam', 'Raggio energetico base', 50.0, 10.0, 30, 'pulse_beam_fx', 1),
      ('emp_wave', 'EMP Wave', 'Impulso elettromagnetico', 75.0, 20.0, 60, 'emp_wave_fx', 3),
      ('missile', 'Missile Strike', 'Missile guidato ad alto impatto', 100.0, 50.0, 120, 'missile_trail_fx', 5)
    ON CONFLICT (key) DO NOTHING;
    
    RAISE NOTICE '✓ Armi base inserite nel catalogo';
  ELSE
    RAISE NOTICE '→ Catalogo armi già popolato';
  END IF;
END $$;

-- ============================================================================
-- FINE MIGRATION FASE 1
-- ============================================================================

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
