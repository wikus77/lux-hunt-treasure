-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ IAP Transactions Patch — Align schema with verify-iap-purchase
-- Date: 2026-01-29
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Add missing columns and align status values for verify-iap-purchase
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ ADD MISSING COLUMNS to iap_transactions                                     │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Add product_id column (store product ID for lookup)
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Add purchase_token column (Android)
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS purchase_token TEXT;

-- Add order_id column (Android)
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add receipt_data column (JSONB for metadata)
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS receipt_data JSONB;

-- Add verified_at timestamp
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add error tracking columns
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS error_code TEXT;

ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add credited_tier for subscriptions
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS credited_tier TEXT;

-- Add credited_m1u for consumables (might already exist as m1u_credited)
ALTER TABLE public.iap_transactions 
ADD COLUMN IF NOT EXISTS credited_m1u INT;

-- Copy from m1u_credited if exists (backward compatibility)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_transactions' AND column_name = 'm1u_credited') THEN
    UPDATE public.iap_transactions SET credited_m1u = m1u_credited WHERE credited_m1u IS NULL AND m1u_credited IS NOT NULL;
  END IF;
END $$;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ UPDATE STATUS VALUES to match verify-iap-purchase                           │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Current: 'pending', 'validated', 'credited', 'failed', 'refunded'
-- Expected: 'pending', 'verified', 'rejected', 'error'

-- Remove old constraint if exists
ALTER TABLE public.iap_transactions DROP CONSTRAINT IF EXISTS iap_transactions_status_check;

-- Add new constraint with all possible values
ALTER TABLE public.iap_transactions 
ADD CONSTRAINT iap_transactions_status_check 
CHECK (status IN ('pending', 'validated', 'credited', 'verified', 'rejected', 'error', 'failed', 'refunded'));

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ ADD INDEXES for new columns                                                 │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE INDEX IF NOT EXISTS idx_iap_transactions_product_id 
ON public.iap_transactions(product_id);

CREATE INDEX IF NOT EXISTS idx_iap_transactions_purchase_token 
ON public.iap_transactions(purchase_token) 
WHERE purchase_token IS NOT NULL;

-- Add unique constraint on purchase_token for Android idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_iap_transactions_unique_android 
ON public.iap_transactions(purchase_token) 
WHERE purchase_token IS NOT NULL AND platform = 'android';

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ SYNC product_id from store_product_id if missing                           │
-- └──────────────────────────────────────────────────────────────────────────────┘

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_transactions' AND column_name = 'store_product_id') THEN
    UPDATE public.iap_transactions SET product_id = store_product_id WHERE product_id IS NULL AND store_product_id IS NOT NULL;
  END IF;
END $$;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ CREATE user_entitlements table if missing                                   │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sub_tier TEXT NOT NULL DEFAULT 'free',
  sub_status TEXT NOT NULL DEFAULT 'none',
  sub_expires_at TIMESTAMPTZ,
  sub_platform TEXT,
  original_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_entitlements_unique_user UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_entitlements_user 
ON public.user_entitlements(user_id);

-- RLS
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own entitlements" ON public.user_entitlements;
CREATE POLICY "Users can view own entitlements" 
ON public.user_entitlements FOR SELECT USING (auth.uid() = user_id);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ CREATE user_wallet table if missing                                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.user_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_m1u INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_wallet_unique_user UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_wallet_user 
ON public.user_wallet(user_id);

-- RLS
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallet;
CREATE POLICY "Users can view own wallet" 
ON public.user_wallet FOR SELECT USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.user_entitlements IS 'User subscription entitlements for IAP verification';
COMMENT ON TABLE public.user_wallet IS 'User M1U wallet balance (synced with profiles.m1_units)';
