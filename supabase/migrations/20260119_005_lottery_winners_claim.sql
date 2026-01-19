-- ═══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY — WINNERS CLAIM SYSTEM
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- FEATURES:
-- 1. Tabella lottery_winners con claim tracking
-- 2. RPC claim_lottery_prize per riscuotere
-- 3. Scadenza 15 giorni per claim
-- 4. Notifiche tracking
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: lottery_winners — Traccia vincitori e stato claim                     │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.lottery_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  draw_id UUID NOT NULL REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.mission_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Posizione e premio
  rank INT NOT NULL CHECK (rank >= 1 AND rank <= 10),
  prize_m1u INT NOT NULL CHECK (prize_m1u >= 0),
  prize_label TEXT,
  
  -- Claim status
  claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'claimed', 'expired', 'forfeited')),
  claim_deadline TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  
  -- Notifiche
  notification_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Vincoli
  UNIQUE(draw_id, rank),
  UNIQUE(draw_id, user_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_lottery_winners_user ON public.lottery_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_winners_cycle ON public.lottery_winners(cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_winners_claim_status ON public.lottery_winners(claim_status);
CREATE INDEX IF NOT EXISTS idx_lottery_winners_deadline ON public.lottery_winners(claim_deadline) WHERE claim_status = 'pending';

-- RLS
ALTER TABLE public.lottery_winners ENABLE ROW LEVEL SECURITY;

-- Users can read their own wins
CREATE POLICY "lottery_winners_select_own" ON public.lottery_winners
  FOR SELECT USING (auth.uid() = user_id);

-- Public can see winners (senza prize details se non claimed)
CREATE POLICY "lottery_winners_select_public" ON public.lottery_winners
  FOR SELECT USING (claim_status = 'claimed');

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: lottery_notifications — Log notifiche inviate                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.lottery_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.mission_cycles(id),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'draw_complete_participant',  -- A tutti i partecipanti
    'winner_announcement',        -- Solo ai vincitori
    'claim_reminder',             -- Reminder ai vincitori pending
    'prize_claimed',              -- Conferma claim
    'prize_expired'               -- Scadenza premio
  )),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fcm_success BOOLEAN,
  fcm_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lottery_notifications_cycle ON public.lottery_notifications(cycle_id);
CREATE INDEX IF NOT EXISTS idx_lottery_notifications_user ON public.lottery_notifications(user_id);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: claim_lottery_prize — Riscuote il premio                           │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.claim_lottery_prize(
  p_winner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_winner RECORD;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NOT_AUTHENTICATED',
      'message', 'Devi essere autenticato per riscuotere il premio'
    );
  END IF;
  
  -- Recupera il winner record
  SELECT * INTO v_winner
  FROM public.lottery_winners
  WHERE id = p_winner_id
  FOR UPDATE;
  
  IF v_winner IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'WINNER_NOT_FOUND',
      'message', 'Record vincitore non trovato'
    );
  END IF;
  
  -- Verifica ownership
  IF v_winner.user_id != v_user_id THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'NOT_OWNER',
      'message', 'Questo premio non ti appartiene'
    );
  END IF;
  
  -- Verifica stato
  IF v_winner.claim_status = 'claimed' THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'ALREADY_CLAIMED',
      'message', 'Premio già riscosso'
    );
  END IF;
  
  IF v_winner.claim_status IN ('expired', 'forfeited') THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'PRIZE_EXPIRED',
      'message', 'Il tempo per riscuotere il premio è scaduto'
    );
  END IF;
  
  -- Verifica deadline
  IF now() > v_winner.claim_deadline THEN
    -- Marca come expired
    UPDATE public.lottery_winners
    SET claim_status = 'expired', updated_at = now()
    WHERE id = p_winner_id;
    
    RETURN jsonb_build_object(
      'status', 'error',
      'code', 'DEADLINE_PASSED',
      'message', 'Il tempo per riscuotere il premio è scaduto'
    );
  END IF;
  
  -- Accredita M1U
  UPDATE public.profiles
  SET m1_units = m1_units + v_winner.prize_m1u,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING m1_units INTO v_new_balance;
  
  -- Marca come claimed
  UPDATE public.lottery_winners
  SET claim_status = 'claimed',
      claimed_at = now(),
      updated_at = now()
  WHERE id = p_winner_id;
  
  -- Log audit
  INSERT INTO public.lottery_audit_logs (cycle_id, event_type, user_id, event_details)
  VALUES (
    v_winner.cycle_id,
    'prize_claimed',
    v_user_id,
    jsonb_build_object(
      'winner_id', p_winner_id,
      'rank', v_winner.rank,
      'prize_m1u', v_winner.prize_m1u,
      'new_balance', v_new_balance
    )
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', format('Congratulazioni! Hai riscosso %s M1U!', v_winner.prize_m1u),
    'prize_m1u', v_winner.prize_m1u,
    'rank', v_winner.rank,
    'prize_label', v_winner.prize_label,
    'new_balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_lottery_prize(UUID) TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: get_my_lottery_wins — Recupera le vincite dell'utente              │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.get_my_lottery_wins()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_wins JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Non autenticato');
  END IF;
  
  SELECT jsonb_agg(jsonb_build_object(
    'id', lw.id,
    'cycle_id', lw.cycle_id,
    'rank', lw.rank,
    'prize_m1u', lw.prize_m1u,
    'prize_label', lw.prize_label,
    'claim_status', lw.claim_status,
    'claim_deadline', lw.claim_deadline,
    'claimed_at', lw.claimed_at,
    'time_remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM (lw.claim_deadline - now()))::int),
    'created_at', lw.created_at
  ) ORDER BY lw.created_at DESC)
  INTO v_wins
  FROM public.lottery_winners lw
  WHERE lw.user_id = v_user_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'wins', COALESCE(v_wins, '[]'::jsonb),
    'pending_count', (
      SELECT COUNT(*) FROM public.lottery_winners 
      WHERE user_id = v_user_id AND claim_status = 'pending'
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_lottery_wins() TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: expire_unclaimed_prizes — Marca premi scaduti (chiamata da cron)   │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.expire_unclaimed_prizes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expired_count INT;
BEGIN
  UPDATE public.lottery_winners
  SET claim_status = 'expired', updated_at = now()
  WHERE claim_status = 'pending' AND claim_deadline < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'expired_count', v_expired_count
  );
END;
$$;

-- Solo service role può chiamare questa funzione
REVOKE EXECUTE ON FUNCTION public.expire_unclaimed_prizes() FROM PUBLIC;

-- ═══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ═══════════════════════════════════════════════════════════════════════════════

