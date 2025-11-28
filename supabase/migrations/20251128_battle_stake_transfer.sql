-- =====================================================================
-- BATTLE STAKE TRANSFER - M1U & Pulse Energy
-- Transfer stakes between winner and loser
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- Function to resolve battle and transfer stakes
CREATE OR REPLACE FUNCTION public.battle_resolve_stakes(
  p_battle_id UUID,
  p_winner_id UUID,
  p_loser_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle RECORD;
  v_stake_type TEXT;
  v_stake_percentage INTEGER;
  v_loser_balance INTEGER;
  v_transfer_amount INTEGER;
  v_winner_new_balance INTEGER;
  v_loser_new_balance INTEGER;
BEGIN
  -- Get battle details
  SELECT * INTO v_battle FROM public.battles WHERE id = p_battle_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found');
  END IF;

  v_stake_type := v_battle.stake_type;
  v_stake_percentage := v_battle.stake_percentage;

  -- Handle M1U stakes
  IF v_stake_type = 'm1u' THEN
    -- Get loser's current M1U balance
    SELECT COALESCE(m1_units, 0) INTO v_loser_balance
    FROM public.profiles WHERE id = p_loser_id;

    -- Calculate transfer amount
    v_transfer_amount := FLOOR(v_loser_balance * v_stake_percentage / 100);
    
    IF v_transfer_amount <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Loser has insufficient M1U');
    END IF;

    -- Deduct from loser
    UPDATE public.profiles
    SET m1_units = m1_units - v_transfer_amount, updated_at = NOW()
    WHERE id = p_loser_id;

    -- Add to winner
    UPDATE public.profiles
    SET m1_units = m1_units + v_transfer_amount, updated_at = NOW()
    WHERE id = p_winner_id;

    -- Get new balances
    SELECT m1_units INTO v_winner_new_balance FROM public.profiles WHERE id = p_winner_id;
    SELECT m1_units INTO v_loser_new_balance FROM public.profiles WHERE id = p_loser_id;

    -- Log transactions
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES 
      (p_loser_id, -v_transfer_amount, 'battle_loss', jsonb_build_object('battle_id', p_battle_id, 'opponent_id', p_winner_id)),
      (p_winner_id, v_transfer_amount, 'battle_win', jsonb_build_object('battle_id', p_battle_id, 'opponent_id', p_loser_id));

  -- Handle Pulse Energy stakes
  ELSIF v_stake_type = 'pulse_energy' THEN
    -- Get loser's current pulse_energy
    SELECT COALESCE(pulse_energy, 0) INTO v_loser_balance
    FROM public.profiles WHERE id = p_loser_id;

    -- Calculate transfer amount
    v_transfer_amount := FLOOR(v_loser_balance * v_stake_percentage / 100);
    
    IF v_transfer_amount <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Loser has insufficient Pulse Energy');
    END IF;

    -- Deduct from loser
    UPDATE public.profiles
    SET pulse_energy = GREATEST(0, pulse_energy - v_transfer_amount), updated_at = NOW()
    WHERE id = p_loser_id;

    -- Add to winner
    UPDATE public.profiles
    SET pulse_energy = COALESCE(pulse_energy, 0) + v_transfer_amount, updated_at = NOW()
    WHERE id = p_winner_id;

    -- Get new balances
    SELECT pulse_energy INTO v_winner_new_balance FROM public.profiles WHERE id = p_winner_id;
    SELECT pulse_energy INTO v_loser_new_balance FROM public.profiles WHERE id = p_loser_id;

  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Unknown stake type: ' || v_stake_type);
  END IF;

  -- Update battle record with transfer info
  UPDATE public.battles
  SET 
    winner_id = p_winner_id,
    status = 'resolved',
    stake_amount = v_transfer_amount,
    resolved_at = NOW()
  WHERE id = p_battle_id;

  RETURN jsonb_build_object(
    'success', true,
    'stake_type', v_stake_type,
    'transfer_amount', v_transfer_amount,
    'winner_id', p_winner_id,
    'winner_new_balance', v_winner_new_balance,
    'loser_id', p_loser_id,
    'loser_new_balance', v_loser_new_balance
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.battle_resolve_stakes(UUID, UUID, UUID) TO authenticated;

-- Add pulse_energy column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'pulse_energy'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN pulse_energy INTEGER DEFAULT 100;
  END IF;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

