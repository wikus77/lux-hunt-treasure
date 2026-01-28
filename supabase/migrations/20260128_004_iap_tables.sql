-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ STORE COMPLIANCE — In-App Purchase Tables
-- Date: 2026-01-28
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Store IAP transactions and entitlements for Apple IAP / Google Play
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: iap_transactions — Records all IAP purchases                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.iap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Platform info
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  
  -- Product info
  product_code TEXT NOT NULL,
  store_product_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('consumable', 'subscription')),
  
  -- Transaction info
  transaction_id TEXT NOT NULL,
  original_transaction_id TEXT, -- For subscription renewals
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'credited', 'failed', 'refunded')),
  
  -- Receipt data (encrypted/hashed for security)
  receipt_hash TEXT,
  
  -- Amounts
  price_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  
  -- For consumables: M1U credited
  m1u_credited INT,
  
  -- For subscriptions: tier info
  subscription_tier TEXT,
  subscription_expires_at TIMESTAMPTZ,
  
  -- Raw response (for debugging, will be cleaned periodically)
  validation_response JSONB,
  
  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT now(),
  validated_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT iap_transactions_unique_txn UNIQUE (platform, transaction_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_iap_transactions_user ON public.iap_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_status ON public.iap_transactions(status);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_platform ON public.iap_transactions(platform);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_product ON public.iap_transactions(product_code);

-- RLS
ALTER TABLE public.iap_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.iap_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "No direct insert from client" ON public.iap_transactions
  FOR INSERT WITH CHECK (false);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: subscription_entitlements — Active subscription status               │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.subscription_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription info
  tier TEXT NOT NULL CHECK (tier IN ('free', 'silver', 'gold', 'black', 'titanium')),
  
  -- Source
  source TEXT NOT NULL DEFAULT 'iap' CHECK (source IN ('iap', 'stripe', 'promo', 'admin')),
  source_transaction_id TEXT, -- Reference to iap_transactions or Stripe
  
  -- Validity
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'grace_period')),
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Only one active entitlement per user
  CONSTRAINT subscription_entitlements_unique_active UNIQUE (user_id, status) 
    WHERE (status = 'active')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON public.subscription_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_expires ON public.subscription_entitlements(expires_at);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON public.subscription_entitlements(status);

-- RLS
ALTER TABLE public.subscription_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements" ON public.subscription_entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ TABLE: m1u_ledger — M1U credit/debit history                                │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.m1u_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  delta INT NOT NULL, -- Positive = credit, Negative = debit
  balance_after INT NOT NULL,
  
  -- Source
  reason TEXT NOT NULL,
  ref_transaction_id UUID, -- Reference to iap_transactions or other source
  ref_type TEXT, -- 'iap', 'stripe', 'game', 'admin', etc.
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_m1u_ledger_user ON public.m1u_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_m1u_ledger_created ON public.m1u_ledger(created_at);

-- RLS
ALTER TABLE public.m1u_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger" ON public.m1u_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: process_iap_purchase — Validate and credit IAP purchase          │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.process_iap_purchase(
  p_user_id UUID,
  p_platform TEXT,
  p_product_code TEXT,
  p_store_product_id TEXT,
  p_transaction_id TEXT,
  p_receipt_hash TEXT DEFAULT NULL,
  p_validation_response JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction_id UUID;
  v_product_type TEXT;
  v_m1u_amount INT;
  v_subscription_tier TEXT;
  v_current_m1u INT;
  v_new_balance INT;
BEGIN
  -- 1. Determine product type and amounts
  CASE p_product_code
    WHEN 'M1U_PACK_100' THEN v_product_type := 'consumable'; v_m1u_amount := 100;
    WHEN 'M1U_PACK_500' THEN v_product_type := 'consumable'; v_m1u_amount := 500;
    WHEN 'M1U_PACK_1000' THEN v_product_type := 'consumable'; v_m1u_amount := 1000;
    WHEN 'M1U_PACK_2500' THEN v_product_type := 'consumable'; v_m1u_amount := 2500;
    WHEN 'M1U_PACK_5000' THEN v_product_type := 'consumable'; v_m1u_amount := 5000;
    WHEN 'SUB_SILVER' THEN v_product_type := 'subscription'; v_subscription_tier := 'silver';
    WHEN 'SUB_GOLD' THEN v_product_type := 'subscription'; v_subscription_tier := 'gold';
    WHEN 'SUB_BLACK' THEN v_product_type := 'subscription'; v_subscription_tier := 'black';
    WHEN 'SUB_TITANIUM' THEN v_product_type := 'subscription'; v_subscription_tier := 'titanium';
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Unknown product code');
  END CASE;

  -- 2. Check for duplicate transaction
  IF EXISTS (
    SELECT 1 FROM public.iap_transactions 
    WHERE platform = p_platform AND transaction_id = p_transaction_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction already processed');
  END IF;

  -- 3. Insert transaction record
  INSERT INTO public.iap_transactions (
    user_id, platform, product_code, store_product_id, 
    product_type, transaction_id, receipt_hash,
    validation_response, status, validated_at
  ) VALUES (
    p_user_id, p_platform, p_product_code, p_store_product_id,
    v_product_type, p_transaction_id, p_receipt_hash,
    p_validation_response, 'validated', now()
  )
  RETURNING id INTO v_transaction_id;

  -- 4. Process based on product type
  IF v_product_type = 'consumable' THEN
    -- Credit M1U
    SELECT COALESCE(m1_units, 0) INTO v_current_m1u
    FROM public.profiles WHERE id = p_user_id;
    
    v_new_balance := v_current_m1u + v_m1u_amount;
    
    UPDATE public.profiles
    SET m1_units = v_new_balance
    WHERE id = p_user_id;
    
    -- Update transaction
    UPDATE public.iap_transactions
    SET status = 'credited', m1u_credited = v_m1u_amount, credited_at = now()
    WHERE id = v_transaction_id;
    
    -- Log to ledger
    INSERT INTO public.m1u_ledger (user_id, delta, balance_after, reason, ref_transaction_id, ref_type)
    VALUES (p_user_id, v_m1u_amount, v_new_balance, 'IAP Purchase: ' || p_product_code, v_transaction_id, 'iap');
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'consumable',
      'm1u_credited', v_m1u_amount,
      'new_balance', v_new_balance,
      'transaction_id', v_transaction_id
    );
    
  ELSE
    -- Subscription
    -- Deactivate existing entitlements
    UPDATE public.subscription_entitlements
    SET status = 'expired', updated_at = now()
    WHERE user_id = p_user_id AND status = 'active';
    
    -- Create new entitlement
    INSERT INTO public.subscription_entitlements (
      user_id, tier, source, source_transaction_id,
      starts_at, expires_at, status
    ) VALUES (
      p_user_id, v_subscription_tier, 'iap', v_transaction_id::text,
      now(), now() + INTERVAL '1 month', 'active'
    );
    
    -- Update transaction
    UPDATE public.iap_transactions
    SET status = 'credited', 
        subscription_tier = v_subscription_tier,
        subscription_expires_at = now() + INTERVAL '1 month',
        credited_at = now()
    WHERE id = v_transaction_id;
    
    -- Update profile tier
    UPDATE public.profiles
    SET subscription_tier = v_subscription_tier,
        subscription_expires_at = now() + INTERVAL '1 month'
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'subscription',
      'tier', v_subscription_tier,
      'expires_at', (now() + INTERVAL '1 month')::text,
      'transaction_id', v_transaction_id
    );
  END IF;
END;
$$;

-- Grant execute to service role only (called from edge function)
REVOKE ALL ON FUNCTION public.process_iap_purchase FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_iap_purchase TO service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.iap_transactions IS 'Store compliance: All IAP transactions from Apple/Google';
COMMENT ON TABLE public.subscription_entitlements IS 'Active subscription status per user';
COMMENT ON TABLE public.m1u_ledger IS 'M1U credit/debit history for audit';
COMMENT ON FUNCTION public.process_iap_purchase IS 'Validate and credit IAP purchases. Called from edge function only.';
