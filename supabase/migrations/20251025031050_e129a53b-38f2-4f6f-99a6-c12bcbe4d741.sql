-- TRON BATTLE DATABASE SCHEMA
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Main battles table
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ready', 'countdown', 'active', 'resolved', 'cancelled', 'expired')),
  
  -- Arena metadata
  arena_name TEXT,
  arena_lat DOUBLE PRECISION,
  arena_lng DOUBLE PRECISION,
  
  -- Stake configuration
  stake_type TEXT NOT NULL CHECK (stake_type IN ('buzz', 'clue', 'energy')),
  stake_amount NUMERIC NOT NULL CHECK (stake_amount >= 0),
  stake_percentage INTEGER NOT NULL CHECK (stake_percentage IN (25, 50, 75)),
  
  -- Participants
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Battle timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  countdown_start_at TIMESTAMPTZ,
  flash_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  
  -- Results
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_tap_at TIMESTAMPTZ,
  opponent_tap_at TIMESTAMPTZ,
  creator_reaction_ms INTEGER,
  opponent_reaction_ms INTEGER,
  
  -- Anti-cheat metadata
  creator_ping_ms INTEGER,
  opponent_ping_ms INTEGER,
  server_compensation_ms INTEGER,
  
  -- Phase 1.1: Ghost Mode tracking
  creator_ghost_until TIMESTAMPTZ,
  opponent_ghost_until TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Battle participants tracking (for stats)
CREATE TABLE IF NOT EXISTS public.battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'opponent')),
  tap_timestamp TIMESTAMPTZ,
  reaction_ms INTEGER,
  ping_ms INTEGER,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Atomic transfer ledger
CREATE TABLE IF NOT EXISTS public.battle_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('buzz', 'clue', 'energy')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Immutable audit log
CREATE TABLE IF NOT EXISTS public.battle_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Phase 1.1: Energy traces on map (24h winner trails)
CREATE TABLE IF NOT EXISTS public.battle_energy_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  end_lat DOUBLE PRECISION NOT NULL,
  end_lng DOUBLE PRECISION NOT NULL,
  intensity NUMERIC NOT NULL DEFAULT 1.0 CHECK (intensity >= 0 AND intensity <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Phase 1.1: Ghost mode tracking
CREATE TABLE IF NOT EXISTS public.battle_ghost_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consecutive_losses INTEGER NOT NULL DEFAULT 0,
  ghost_mode_active BOOLEAN NOT NULL DEFAULT false,
  ghost_until TIMESTAMPTZ,
  last_loss_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_battles_status ON public.battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_creator ON public.battles(creator_id);
CREATE INDEX IF NOT EXISTS idx_battles_opponent ON public.battles(opponent_id);
CREATE INDEX IF NOT EXISTS idx_battles_winner ON public.battles(winner_id);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_expires_at ON public.battles(expires_at);
CREATE INDEX IF NOT EXISTS idx_battle_participants_user ON public.battle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_transfers_from ON public.battle_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_battle_transfers_to ON public.battle_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_battle_audit_battle ON public.battle_audit(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_audit_timestamp ON public.battle_audit(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_energy_traces_expires ON public.battle_energy_traces(expires_at);
CREATE INDEX IF NOT EXISTS idx_ghost_mode_user ON public.battle_ghost_mode(user_id);

-- Enable RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_energy_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_ghost_mode ENABLE ROW LEVEL SECURITY;

-- RLS Policies: battles
CREATE POLICY "Users can view their own battles"
  ON public.battles FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create battles"
  ON public.battles FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- RLS Policies: battle_participants
CREATE POLICY "Users can view their own participation"
  ON public.battle_participants FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies: battle_transfers
CREATE POLICY "Users can view their own transfers"
  ON public.battle_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- RLS Policies: battle_audit (read-only for participants)
CREATE POLICY "Participants can view battle audit"
  ON public.battle_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles b
      WHERE b.id = battle_id
      AND (b.creator_id = auth.uid() OR b.opponent_id = auth.uid())
    )
  );

-- RLS Policies: energy_traces (public read for map display)
CREATE POLICY "Anyone can view active energy traces"
  ON public.battle_energy_traces FOR SELECT
  USING (expires_at > now());

-- RLS Policies: ghost_mode
CREATE POLICY "Users can view their own ghost mode status"
  ON public.battle_ghost_mode FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ghost mode"
  ON public.battle_ghost_mode FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: Update energy on transfer
CREATE OR REPLACE FUNCTION public.battle_apply_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct from loser
  IF NEW.transfer_type = 'energy' THEN
    UPDATE public.profiles
    SET energy_fragments = GREATEST(0, COALESCE(energy_fragments, 0) - NEW.amount)
    WHERE id = NEW.from_user_id;
    
    -- Add to winner
    UPDATE public.profiles
    SET energy_fragments = COALESCE(energy_fragments, 0) + NEW.amount
    WHERE id = NEW.to_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_battle_transfer_apply
  AFTER INSERT ON public.battle_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.battle_apply_transfer();

-- Trigger: Auto-audit on battle status change
CREATE OR REPLACE FUNCTION public.battle_auto_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.battle_audit (battle_id, event_type, payload)
    VALUES (
      NEW.id,
      'status_change',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_battle_status_audit
  AFTER UPDATE ON public.battles
  FOR EACH ROW
  EXECUTE FUNCTION public.battle_auto_audit();

-- Trigger: Update ghost mode timestamp
CREATE OR REPLACE FUNCTION public.battle_update_ghost_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ghost_mode_updated
  BEFORE UPDATE ON public.battle_ghost_mode
  FOR EACH ROW
  EXECUTE FUNCTION public.battle_update_ghost_timestamp();

-- Materialized View: Battle Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.battle_metrics AS
SELECT
  user_id,
  COUNT(*) as total_battles,
  SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN NOT is_winner THEN 1 ELSE 0 END) as losses,
  ROUND(AVG(reaction_ms)::numeric, 2) as avg_reaction_ms,
  MIN(reaction_ms) as fastest_reaction_ms,
  MAX(reaction_ms) as slowest_reaction_ms,
  ROUND(
    (SUM(CASE WHEN is_winner THEN 1 ELSE 0 END)::numeric / GREATEST(COUNT(*), 1)) * 100,
    2
  ) as win_rate_percentage
FROM public.battle_participants
WHERE reaction_ms IS NOT NULL
GROUP BY user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_metrics_user ON public.battle_metrics(user_id);

-- Function: Refresh battle metrics
CREATE OR REPLACE FUNCTION public.refresh_battle_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.battle_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™