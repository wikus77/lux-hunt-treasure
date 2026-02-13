-- ═══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ MARKER SYSTEM SCHEMA BACKUP
-- Data: 2026-02-11
-- Stato: PRE-FIX
-- Tag rollback: ROLLBACK_MARKER_SYSTEM_PRE_FIX
-- © 2026 Joseph MULÉ – NIYVORA KFT™
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ NOTA: Questo file è un BACKUP di riferimento.                               │
-- │ NON eseguirlo direttamente - serve per documentazione rollback.             │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABELLA: markers (riferimento - NON creare, esiste già)
-- ═══════════════════════════════════════════════════════════════════════════════

-- COLONNE RILEVANTI:
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- lat DOUBLE PRECISION
-- lng DOUBLE PRECISION
-- title TEXT
-- active BOOLEAN
-- visible_from TIMESTAMPTZ
-- visible_to TIMESTAMPTZ
-- reward_type reward_type (ENUM)
-- reward_payload JSONB
-- drop_id UUID

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABELLA: marker_rewards
-- ═══════════════════════════════════════════════════════════════════════════════

-- DEFINIZIONE 1 (Migration 20250814124057 - AGOSTO 2025):
-- marker_id UUID NOT NULL

-- DEFINIZIONE 2 (Migration 20251120052534 - NOVEMBRE 2025):
-- marker_id TEXT NOT NULL

-- ⚠️ CONFLITTO TIPO: La definizione più recente usa TEXT, ma marker_claims usa UUID

CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id TEXT NOT NULL,  -- ⚠️ Potrebbe essere UUID in produzione!
  reward_type TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_marker_rewards_marker_id ON public.marker_rewards(marker_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABELLA: marker_claims
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.marker_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL,  -- ⚠️ UUID, mentre marker_rewards potrebbe essere TEXT
  user_id UUID NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(marker_id, user_id)
);

ALTER TABLE public.marker_claims ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Tutti possono vedere (per visualizzazione marker viola)
CREATE POLICY "Anyone can view marker claims for visibility"
ON public.marker_claims
FOR SELECT
USING (true);

-- Policy INSERT: Solo proprio user_id
CREATE POLICY "Users can insert their own claims"
ON public.marker_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS: markers (policies rilevanti)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Policy SELECT: Tutti possono leggere marker attivi
-- CREATE POLICY markers_read_auth ON public.markers
--   FOR SELECT TO authenticated USING (true);

-- ⚠️ Policy INSERT BLOCCANTE (da migration 20250919031352):
-- CREATE POLICY markers_no_insert ON public.markers
--   FOR INSERT TO authenticated WITH CHECK (false);

-- Policy UPDATE/DELETE: Bloccate
-- CREATE POLICY markers_no_update ON public.markers
--   FOR UPDATE TO authenticated USING (false);
-- CREATE POLICY markers_no_delete ON public.markers
--   FOR DELETE TO authenticated USING (false);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNZIONE RPC: admin_credit_m1u (per accredito M1U da marker reward)
-- ═══════════════════════════════════════════════════════════════════════════════

-- La funzione admin_credit_m1u esiste e funziona con SERVICE_ROLE
-- Non toccare - usata da claim-marker-reward Edge Function

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROCEDURA ROLLBACK
-- ═══════════════════════════════════════════════════════════════════════════════

-- Per ripristinare lo stato pre-fix:
-- 
-- 1. Git:
--    git reset --hard ROLLBACK_MARKER_SYSTEM_PRE_FIX
--    git clean -fd
--
-- 2. Se sono state modificate tabelle DB:
--    -- Ripristinare tipo marker_id se modificato:
--    ALTER TABLE public.marker_rewards 
--      ALTER COLUMN marker_id TYPE TEXT;
--    
--    -- Ripristinare policy INSERT bloccante se rimossa:
--    DROP POLICY IF EXISTS markers_admin_insert ON public.markers;
--    CREATE POLICY markers_no_insert ON public.markers
--      FOR INSERT TO authenticated WITH CHECK (false);
--
-- 3. Redeploy Edge Function:
--    npx supabase functions deploy claim-marker-reward --project-ref vkjrqirvdvjbemsfzxof

-- © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
