-- BATTLE SYSTEM PHASE 2 - SCHEMA (Economy, PE, Reputation, Notifications)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Idempotent migration for Battle System Phase 2

-- ============================================================================
-- 1. USER WALLET (M1U Balance)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_wallet') THEN
    CREATE TABLE public.user_wallet (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      m1u_balance numeric NOT NULL DEFAULT 0 CHECK (m1u_balance >= 0),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_user_wallet_balance ON public.user_wallet(m1u_balance);
    
    RAISE NOTICE 'Created table: user_wallet';
  END IF;
END $$;

-- RLS for user_wallet
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_wallet' AND policyname = 'Users can view own wallet') THEN
    CREATE POLICY "Users can view own wallet" ON public.user_wallet
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_wallet' AND policyname = 'Users can update own wallet via RPC only') THEN
    CREATE POLICY "Users can update own wallet via RPC only" ON public.user_wallet
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 2. M1U LEDGER (Transaction Log)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'm1u_ledger') THEN
    CREATE TABLE public.m1u_ledger (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      delta numeric NOT NULL,
      reason text NOT NULL,
      ref_id uuid,
      idempotency_key text UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_m1u_ledger_user ON public.m1u_ledger(user_id, created_at DESC);
    CREATE INDEX idx_m1u_ledger_ref ON public.m1u_ledger(ref_id);
    
    RAISE NOTICE 'Created table: m1u_ledger';
  END IF;
END $$;

-- RLS for m1u_ledger
ALTER TABLE public.m1u_ledger ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'm1u_ledger' AND policyname = 'Users can view own ledger') THEN
    CREATE POLICY "Users can view own ledger" ON public.m1u_ledger
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 3. PE LEDGER (Pulse Energy Transaction Log)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pe_ledger') THEN
    CREATE TABLE public.pe_ledger (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      delta numeric NOT NULL,
      reason text NOT NULL,
      ref_id uuid,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_pe_ledger_user ON public.pe_ledger(user_id, created_at DESC);
    CREATE INDEX idx_pe_ledger_ref ON public.pe_ledger(ref_id);
    
    RAISE NOTICE 'Created table: pe_ledger';
  END IF;
END $$;

-- RLS for pe_ledger
ALTER TABLE public.pe_ledger ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pe_ledger' AND policyname = 'Users can view own PE ledger') THEN
    CREATE POLICY "Users can view own PE ledger" ON public.pe_ledger
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 4. REPUTATION LEDGER
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reputation_ledger') THEN
    CREATE TABLE public.reputation_ledger (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      delta numeric NOT NULL,
      reason text NOT NULL,
      ref_id uuid,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_reputation_ledger_user ON public.reputation_ledger(user_id, created_at DESC);
    CREATE INDEX idx_reputation_ledger_ref ON public.reputation_ledger(ref_id);
    
    RAISE NOTICE 'Created table: reputation_ledger';
  END IF;
END $$;

-- RLS for reputation_ledger
ALTER TABLE public.reputation_ledger ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reputation_ledger' AND policyname = 'Users can view own reputation ledger') THEN
    CREATE POLICY "Users can view own reputation ledger" ON public.reputation_ledger
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 5. BATTLE NOTIFICATIONS (for existing push pipeline)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'battle_notifications') THEN
    CREATE TABLE public.battle_notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id_target uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      type text NOT NULL CHECK (type IN ('attack_started', 'defense_needed', 'battle_resolved')),
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      consumed boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_battle_notifications_target ON public.battle_notifications(user_id_target, consumed, created_at DESC);
    CREATE INDEX idx_battle_notifications_type ON public.battle_notifications(type, created_at DESC);
    
    RAISE NOTICE 'Created table: battle_notifications';
  END IF;
END $$;

-- RLS for battle_notifications
ALTER TABLE public.battle_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'battle_notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON public.battle_notifications
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id_target);
  END IF;
END $$;

-- ============================================================================
-- 6. EXTEND WEAPONS_CATALOG with feature_flags
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'weapons_catalog' 
    AND column_name = 'feature_flags'
  ) THEN
    ALTER TABLE public.weapons_catalog 
    ADD COLUMN feature_flags jsonb DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'Added feature_flags to weapons_catalog';
  END IF;
END $$;

-- ============================================================================
-- 7. DEFENSE CATALOG
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'defense_catalog') THEN
    CREATE TABLE public.defense_catalog (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      key text UNIQUE NOT NULL,
      name text NOT NULL,
      description text,
      power integer NOT NULL CHECK (power > 0),
      m1u_cost integer NOT NULL CHECK (m1u_cost >= 0),
      cooldown_sec integer NOT NULL DEFAULT 0 CHECK (cooldown_sec >= 0),
      effect_key text NOT NULL,
      min_rank integer NOT NULL DEFAULT 1 CHECK (min_rank > 0),
      enabled boolean NOT NULL DEFAULT true,
      feature_flags jsonb DEFAULT '{}'::jsonb,
      version integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_defense_catalog_key ON public.defense_catalog(key);
    CREATE INDEX idx_defense_catalog_enabled ON public.defense_catalog(enabled);
    
    RAISE NOTICE 'Created table: defense_catalog';
  END IF;
END $$;

-- RLS for defense_catalog (read-only for all authenticated)
ALTER TABLE public.defense_catalog ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'defense_catalog' AND policyname = 'Anyone can view enabled defenses') THEN
    CREATE POLICY "Anyone can view enabled defenses" ON public.defense_catalog
      FOR SELECT TO authenticated
      USING (enabled = true);
  END IF;
END $$;

-- ============================================================================
-- 8. PRICING RULES (server-tunable)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    CREATE TABLE public.pricing_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      rule_key text UNIQUE NOT NULL,
      type text NOT NULL CHECK (type IN ('m1u_reward', 'pe_reward', 'reputation_reward')),
      value numeric NOT NULL,
      active boolean NOT NULL DEFAULT true,
      version integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_pricing_rules_key ON public.pricing_rules(rule_key);
    
    RAISE NOTICE 'Created table: pricing_rules';
  END IF;
END $$;

-- RLS for pricing_rules (read-only)
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pricing_rules' AND policyname = 'Anyone can view pricing rules') THEN
    CREATE POLICY "Anyone can view pricing rules" ON public.pricing_rules
      FOR SELECT TO authenticated, anon
      USING (active = true);
  END IF;
END $$;

-- ============================================================================
-- 9. RANK MODIFIERS (server-tunable)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rank_modifiers') THEN
    CREATE TABLE public.rank_modifiers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      rank_code text UNIQUE NOT NULL,
      att_mult numeric NOT NULL DEFAULT 1.0 CHECK (att_mult > 0),
      def_mult numeric NOT NULL DEFAULT 1.0 CHECK (def_mult > 0),
      pe_reward_mult numeric NOT NULL DEFAULT 1.0 CHECK (pe_reward_mult > 0),
      m1u_reward_mult numeric NOT NULL DEFAULT 1.0 CHECK (m1u_reward_mult > 0),
      version integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX idx_rank_modifiers_code ON public.rank_modifiers(rank_code);
    
    RAISE NOTICE 'Created table: rank_modifiers';
  END IF;
END $$;

-- RLS for rank_modifiers (read-only)
ALTER TABLE public.rank_modifiers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rank_modifiers' AND policyname = 'Anyone can view rank modifiers') THEN
    CREATE POLICY "Anyone can view rank modifiers" ON public.rank_modifiers
      FOR SELECT TO authenticated, anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- 10. SEED DEFAULT DATA (catalogs)
-- ============================================================================

-- Default weapons (if empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.weapons_catalog LIMIT 1) THEN
    INSERT INTO public.weapons_catalog (key, name, description, power, m1u_cost, cooldown_sec, effect_key, min_rank, enabled)
    VALUES
      ('plasma_strike', 'Plasma Strike', 'Basic energy weapon', 100, 50, 300, 'plasma_beam', 1, true),
      ('emp_pulse', 'EMP Pulse', 'Disables defenses', 150, 100, 600, 'emp_wave', 3, true),
      ('quantum_missile', 'Quantum Missile', 'High-power projectile', 250, 200, 900, 'missile_trail', 5, true);
    
    RAISE NOTICE 'Seeded weapons_catalog';
  END IF;
END $$;

-- Default defenses (if empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.defense_catalog LIMIT 1) THEN
    INSERT INTO public.defense_catalog (key, name, description, power, m1u_cost, cooldown_sec, effect_key, min_rank, enabled)
    VALUES
      ('energy_shield', 'Energy Shield', 'Basic shield', 80, 40, 300, 'shield_bubble', 1, true),
      ('stealth_cloak', 'Stealth Cloak', 'Avoidance system', 120, 80, 600, 'stealth_fade', 3, true),
      ('quantum_barrier', 'Quantum Barrier', 'Maximum defense', 200, 150, 900, 'barrier_dome', 5, true);
    
    RAISE NOTICE 'Seeded defense_catalog';
  END IF;
END $$;

-- Default pricing rules
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pricing_rules LIMIT 1) THEN
    INSERT INTO public.pricing_rules (rule_key, type, value, active)
    VALUES
      ('base_m1u_reward', 'm1u_reward', 100, true),
      ('base_pe_reward', 'pe_reward', 50, true),
      ('base_reputation_reward', 'reputation_reward', 10, true);
    
    RAISE NOTICE 'Seeded pricing_rules';
  END IF;
END $$;

-- Default rank modifiers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.rank_modifiers LIMIT 1) THEN
    INSERT INTO public.rank_modifiers (rank_code, att_mult, def_mult, pe_reward_mult, m1u_reward_mult)
    VALUES
      ('R1', 1.0, 1.0, 1.0, 1.0),
      ('R2', 1.1, 1.1, 1.2, 1.1),
      ('R3', 1.2, 1.2, 1.4, 1.2),
      ('R4', 1.3, 1.3, 1.6, 1.3),
      ('R5', 1.5, 1.5, 2.0, 1.5);
    
    RAISE NOTICE 'Seeded rank_modifiers';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== PHASE 2 SCHEMA VERIFICATION ===';
  RAISE NOTICE 'Tables created: user_wallet, m1u_ledger, pe_ledger, reputation_ledger, battle_notifications, defense_catalog, pricing_rules, rank_modifiers';
  RAISE NOTICE 'Run: SELECT * FROM user_wallet; SELECT * FROM m1u_ledger; SELECT * FROM defense_catalog;';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
