-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- M1SSION Cashback Vault™ - Database Schema
-- Sistema di cashback in M1U per BUZZ, BUZZ MAP e AION (futuro)

-- ============================================================================
-- TABELLA: user_cashback_wallet
-- Contiene il wallet cashback per ogni utente
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_cashback_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  accumulated_m1u INTEGER DEFAULT 0,
  lifetime_earned_m1u INTEGER DEFAULT 0,
  last_claim_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indice per lookup veloce per user
CREATE INDEX IF NOT EXISTS idx_cashback_wallet_user_id ON user_cashback_wallet(user_id);

-- ============================================================================
-- TABELLA: cashback_transactions
-- Log delle transazioni cashback (accrual)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_type VARCHAR(20) NOT NULL, -- 'buzz' | 'buzz_map' | 'aion'
  source_cost_eur DECIMAL(10,2) NOT NULL,
  cashback_m1u INTEGER NOT NULL,
  tier_at_time VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per lookup storico utente
CREATE INDEX IF NOT EXISTS idx_cashback_tx_user_id ON cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_tx_created_at ON cashback_transactions(created_at);

-- ============================================================================
-- RLS POLICIES
-- Solo lettura per utenti, scrittura solo via Edge Functions/RPC
-- ============================================================================

ALTER TABLE user_cashback_wallet ENABLE ROW LEVEL SECURITY;

-- Utenti possono vedere solo il proprio wallet
CREATE POLICY "Users can view own cashback wallet" ON user_cashback_wallet
  FOR SELECT USING (auth.uid() = user_id);

-- Nessun INSERT/UPDATE/DELETE diretto - solo via server

ALTER TABLE cashback_transactions ENABLE ROW LEVEL SECURITY;

-- Utenti possono vedere solo le proprie transazioni
CREATE POLICY "Users can view own cashback tx" ON cashback_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Nessun INSERT/UPDATE/DELETE diretto - solo via server

-- ============================================================================
-- FUNCTION: Accrue cashback (per uso interno server)
-- Incrementa il cashback accumulato e logga la transazione
-- ============================================================================

CREATE OR REPLACE FUNCTION accrue_cashback(
  p_user_id UUID,
  p_source_type VARCHAR(20),
  p_source_cost_eur DECIMAL(10,2),
  p_cashback_m1u INTEGER,
  p_tier_at_time VARCHAR(20)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert wallet se non esiste
  INSERT INTO user_cashback_wallet (user_id, accumulated_m1u, lifetime_earned_m1u)
  VALUES (p_user_id, p_cashback_m1u, p_cashback_m1u)
  ON CONFLICT (user_id) DO UPDATE SET
    accumulated_m1u = user_cashback_wallet.accumulated_m1u + p_cashback_m1u,
    lifetime_earned_m1u = user_cashback_wallet.lifetime_earned_m1u + p_cashback_m1u,
    updated_at = NOW();

  -- Log transazione
  INSERT INTO cashback_transactions (user_id, source_type, source_cost_eur, cashback_m1u, tier_at_time)
  VALUES (p_user_id, p_source_type, p_source_cost_eur, p_cashback_m1u, p_tier_at_time);
END;
$$;

-- ============================================================================
-- FUNCTION: Claim cashback (per uso da Edge Function)
-- Trasferisce cashback accumulato a M1U profilo
-- ============================================================================

CREATE OR REPLACE FUNCTION claim_cashback(p_user_id UUID)
RETURNS TABLE(credited_m1u INTEGER, new_balance INTEGER, next_claim_available TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_accumulated INTEGER;
  v_last_claim TIMESTAMPTZ;
  v_new_balance INTEGER;
BEGIN
  -- Carica wallet
  SELECT accumulated_m1u, last_claim_at 
  INTO v_accumulated, v_last_claim
  FROM user_cashback_wallet
  WHERE user_id = p_user_id;

  -- Verifica esistenza wallet
  IF v_accumulated IS NULL THEN
    RAISE EXCEPTION 'No cashback wallet found';
  END IF;

  -- Verifica se c'è qualcosa da riscattare
  IF v_accumulated <= 0 THEN
    RAISE EXCEPTION 'Nothing to claim';
  END IF;

  -- Verifica cooldown 7 giorni
  IF v_last_claim IS NOT NULL AND v_last_claim > NOW() - INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Claim available in % days', 
      CEIL(EXTRACT(EPOCH FROM (v_last_claim + INTERVAL '7 days' - NOW())) / 86400);
  END IF;

  -- Trasferisci M1U al profilo
  UPDATE profiles
  SET m1_units = COALESCE(m1_units, 0) + v_accumulated
  WHERE id = p_user_id
  RETURNING m1_units INTO v_new_balance;

  -- Reset wallet e aggiorna last_claim
  UPDATE user_cashback_wallet
  SET 
    accumulated_m1u = 0,
    last_claim_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return result
  RETURN QUERY SELECT 
    v_accumulated AS credited_m1u,
    v_new_balance AS new_balance,
    NOW() + INTERVAL '7 days' AS next_claim_available;
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

