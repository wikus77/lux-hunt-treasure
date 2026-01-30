-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ STORE COMPLIANCE — IAP Products Catalog
-- Date: 2026-01-29
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- PURPOSE: Server-side source of truth for IAP product configuration
-- Used by verify-iap-purchase edge function to validate and credit purchases
-- ══════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ STEP 1: Create table if not exists (base structure)                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS public.iap_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'consumable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ STEP 2: Add missing columns (safe for existing tables)                      │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Product code (internal reference)
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS product_code TEXT;

-- Platform-specific IDs
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS apple_product_id TEXT;
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS google_product_id TEXT;

-- Display name
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS display_name TEXT;

-- For consumables: M1U amount
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS m1u_amount INT;

-- For subscriptions: tier
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS tier TEXT;

-- Pricing (reference only)
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS price_eur DECIMAL(10, 2);

-- Status
ALTER TABLE public.iap_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ STEP 2b: Fix existing columns that might have wrong constraints             │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Fix 'platform' column if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_products' AND column_name = 'platform') THEN
    ALTER TABLE public.iap_products ALTER COLUMN platform DROP NOT NULL;
    ALTER TABLE public.iap_products ALTER COLUMN platform SET DEFAULT 'both';
    UPDATE public.iap_products SET platform = 'both' WHERE platform IS NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not modify platform column: %', SQLERRM;
END $$;

-- Fix 'name' column if exists (we use display_name instead)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_products' AND column_name = 'name') THEN
    ALTER TABLE public.iap_products ALTER COLUMN name DROP NOT NULL;
    ALTER TABLE public.iap_products ALTER COLUMN name SET DEFAULT '';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not modify name column: %', SQLERRM;
END $$;

-- Fix 'description' column if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_products' AND column_name = 'description') THEN
    ALTER TABLE public.iap_products ALTER COLUMN description DROP NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not modify description column: %', SQLERRM;
END $$;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ STEP 3: Fix constraints and indexes                                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Drop old type constraint if exists (might have different values)
ALTER TABLE public.iap_products DROP CONSTRAINT IF EXISTS iap_products_type_check;

-- Add type constraint
ALTER TABLE public.iap_products ADD CONSTRAINT iap_products_type_check 
CHECK (type IN ('consumable', 'subscription'));

-- Drop old tier constraint if exists
ALTER TABLE public.iap_products DROP CONSTRAINT IF EXISTS iap_products_tier_check;

-- Add tier constraint
ALTER TABLE public.iap_products ADD CONSTRAINT iap_products_tier_check 
CHECK (tier IS NULL OR tier IN ('free', 'silver', 'gold', 'black', 'titanium'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_iap_products_product_id ON public.iap_products(product_id);
CREATE INDEX IF NOT EXISTS idx_iap_products_code ON public.iap_products(product_code) WHERE product_code IS NOT NULL;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ STEP 4: Clear and re-seed products (clean slate)                            │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- Delete existing products to avoid conflicts
DELETE FROM public.iap_products WHERE product_id LIKE 'com.m1ssion.%' OR product_id LIKE 'm1u_pack_%' OR product_id LIKE 'sub_%';

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ SEED: Insert M1U Packs using dynamic column detection                       │
-- └──────────────────────────────────────────────────────────────────────────────┘

DO $$
DECLARE
  has_platform BOOLEAN;
  has_name BOOLEAN;
  col_list TEXT;
BEGIN
  -- Check which columns exist
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_products' AND column_name = 'platform') INTO has_platform;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'iap_products' AND column_name = 'name') INTO has_name;

  -- Build dynamic insert based on available columns
  IF has_platform AND has_name THEN
    -- Full legacy schema with platform and name
    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, name, m1u_amount, price_eur, is_active, platform)
    VALUES 
      ('com.m1ssion.m1u.pack.starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 'Starter Pack', 50, 4.99, true, 'both'),
      ('com.m1ssion.m1u.pack.agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 'Agent Pack', 110, 9.99, true, 'both'),
      ('com.m1ssion.m1u.pack.elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 'Elite Pack', 250, 19.99, true, 'both'),
      ('com.m1ssion.m1u.pack.commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 'Commander Pack', 550, 39.99, true, 'both'),
      ('com.m1ssion.m1u.pack.director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 'Director Pack', 1200, 79.99, true, 'both'),
      ('com.m1ssion.m1u.pack.master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 'Master Control', 3000, 199.99, true, 'both');

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, name, m1u_amount, price_eur, is_active, platform)
    VALUES 
      ('m1u_pack_starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 'Starter Pack', 50, 4.99, true, 'android'),
      ('m1u_pack_agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 'Agent Pack', 110, 9.99, true, 'android'),
      ('m1u_pack_elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 'Elite Pack', 250, 19.99, true, 'android'),
      ('m1u_pack_commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 'Commander Pack', 550, 39.99, true, 'android'),
      ('m1u_pack_director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 'Director Pack', 1200, 79.99, true, 'android'),
      ('m1u_pack_master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 'Master Control', 3000, 199.99, true, 'android');

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, name, tier, price_eur, is_active, platform)
    VALUES 
      ('com.m1ssion.sub.silver', 'SUB_SILVER', 'com.m1ssion.sub.silver', 'sub_silver_monthly', 'subscription', 'Silver Plan', 'Silver Plan', 'silver', 4.99, true, 'both'),
      ('com.m1ssion.sub.gold', 'SUB_GOLD', 'com.m1ssion.sub.gold', 'sub_gold_monthly', 'subscription', 'Gold Plan', 'Gold Plan', 'gold', 9.99, true, 'both'),
      ('com.m1ssion.sub.black', 'SUB_BLACK', 'com.m1ssion.sub.black', 'sub_black_monthly', 'subscription', 'Black Plan', 'Black Plan', 'black', 19.99, true, 'both'),
      ('com.m1ssion.sub.titanium', 'SUB_TITANIUM', 'com.m1ssion.sub.titanium', 'sub_titanium_monthly', 'subscription', 'Titanium Plan', 'Titanium Plan', 'titanium', 49.99, true, 'both');

  ELSIF has_platform THEN
    -- Schema with platform but no name
    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, m1u_amount, price_eur, is_active, platform)
    VALUES 
      ('com.m1ssion.m1u.pack.starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 50, 4.99, true, 'both'),
      ('com.m1ssion.m1u.pack.agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 110, 9.99, true, 'both'),
      ('com.m1ssion.m1u.pack.elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 250, 19.99, true, 'both'),
      ('com.m1ssion.m1u.pack.commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 550, 39.99, true, 'both'),
      ('com.m1ssion.m1u.pack.director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 1200, 79.99, true, 'both'),
      ('com.m1ssion.m1u.pack.master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 3000, 199.99, true, 'both');

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, m1u_amount, price_eur, is_active, platform)
    VALUES 
      ('m1u_pack_starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 50, 4.99, true, 'android'),
      ('m1u_pack_agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 110, 9.99, true, 'android'),
      ('m1u_pack_elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 250, 19.99, true, 'android'),
      ('m1u_pack_commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 550, 39.99, true, 'android'),
      ('m1u_pack_director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 1200, 79.99, true, 'android'),
      ('m1u_pack_master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 3000, 199.99, true, 'android');

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, tier, price_eur, is_active, platform)
    VALUES 
      ('com.m1ssion.sub.silver', 'SUB_SILVER', 'com.m1ssion.sub.silver', 'sub_silver_monthly', 'subscription', 'Silver Plan', 'silver', 4.99, true, 'both'),
      ('com.m1ssion.sub.gold', 'SUB_GOLD', 'com.m1ssion.sub.gold', 'sub_gold_monthly', 'subscription', 'Gold Plan', 'gold', 9.99, true, 'both'),
      ('com.m1ssion.sub.black', 'SUB_BLACK', 'com.m1ssion.sub.black', 'sub_black_monthly', 'subscription', 'Black Plan', 'black', 19.99, true, 'both'),
      ('com.m1ssion.sub.titanium', 'SUB_TITANIUM', 'com.m1ssion.sub.titanium', 'sub_titanium_monthly', 'subscription', 'Titanium Plan', 'titanium', 49.99, true, 'both');

  ELSE
    -- New clean schema
    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, m1u_amount, price_eur, is_active)
    VALUES 
      ('com.m1ssion.m1u.pack.starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 50, 4.99, true),
      ('com.m1ssion.m1u.pack.agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 110, 9.99, true),
      ('com.m1ssion.m1u.pack.elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 250, 19.99, true),
      ('com.m1ssion.m1u.pack.commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 550, 39.99, true),
      ('com.m1ssion.m1u.pack.director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 1200, 79.99, true),
      ('com.m1ssion.m1u.pack.master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 3000, 199.99, true);

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, m1u_amount, price_eur, is_active)
    VALUES 
      ('m1u_pack_starter', 'M1U_STARTER', 'com.m1ssion.m1u.pack.starter', 'm1u_pack_starter', 'consumable', 'Starter Pack', 50, 4.99, true),
      ('m1u_pack_agent', 'M1U_AGENT', 'com.m1ssion.m1u.pack.agent', 'm1u_pack_agent', 'consumable', 'Agent Pack', 110, 9.99, true),
      ('m1u_pack_elite', 'M1U_ELITE', 'com.m1ssion.m1u.pack.elite', 'm1u_pack_elite', 'consumable', 'Elite Pack', 250, 19.99, true),
      ('m1u_pack_commander', 'M1U_COMMANDER', 'com.m1ssion.m1u.pack.commander', 'm1u_pack_commander', 'consumable', 'Commander Pack', 550, 39.99, true),
      ('m1u_pack_director', 'M1U_DIRECTOR', 'com.m1ssion.m1u.pack.director', 'm1u_pack_director', 'consumable', 'Director Pack', 1200, 79.99, true),
      ('m1u_pack_master', 'M1U_MASTER', 'com.m1ssion.m1u.pack.master', 'm1u_pack_master', 'consumable', 'Master Control', 3000, 199.99, true);

    INSERT INTO public.iap_products (product_id, product_code, apple_product_id, google_product_id, type, display_name, tier, price_eur, is_active)
    VALUES 
      ('com.m1ssion.sub.silver', 'SUB_SILVER', 'com.m1ssion.sub.silver', 'sub_silver_monthly', 'subscription', 'Silver Plan', 'silver', 4.99, true),
      ('com.m1ssion.sub.gold', 'SUB_GOLD', 'com.m1ssion.sub.gold', 'sub_gold_monthly', 'subscription', 'Gold Plan', 'gold', 9.99, true),
      ('com.m1ssion.sub.black', 'SUB_BLACK', 'com.m1ssion.sub.black', 'sub_black_monthly', 'subscription', 'Black Plan', 'black', 19.99, true),
      ('com.m1ssion.sub.titanium', 'SUB_TITANIUM', 'com.m1ssion.sub.titanium', 'sub_titanium_monthly', 'subscription', 'Titanium Plan', 'titanium', 49.99, true);
  END IF;
END $$;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: get_user_m1u_balance — Get user's M1U balance                     │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.get_user_m1u_balance(UUID);

CREATE OR REPLACE FUNCTION public.get_user_m1u_balance(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT COALESCE(m1_units, 0) INTO v_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_m1u_balance TO service_role;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: increment_user_m1u — Atomically increment M1U balance             │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.increment_user_m1u(UUID, INT);

CREATE OR REPLACE FUNCTION public.increment_user_m1u(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  UPDATE public.profiles
  SET m1_units = COALESCE(m1_units, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING m1_units INTO v_new_balance;
  
  RETURN COALESCE(v_new_balance, p_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_user_m1u TO service_role;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: get_user_entitlements — Get user's subscription entitlements      │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.get_user_entitlements(UUID);

CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'sub_tier', COALESCE(tier, 'free'),
    'sub_status', COALESCE(status, 'none'),
    'sub_expires_at', expires_at,
    'is_active', (status = 'active' AND (expires_at IS NULL OR expires_at > now()))
  ) INTO v_result
  FROM public.subscription_entitlements
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'sub_tier', 'free',
      'sub_status', 'none',
      'sub_expires_at', NULL,
      'is_active', false
    );
  END IF;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_entitlements TO service_role;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ FUNCTION: log_iap_audit — Log IAP actions for audit trail                   │
-- └──────────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.log_iap_audit(UUID, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.log_iap_audit(
  p_user_id UUID,
  p_action TEXT,
  p_transaction_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.m1u_ledger (user_id, delta, balance_after, reason, ref_transaction_id, ref_type, metadata)
  VALUES (
    p_user_id,
    0, -- Audit entries have 0 delta
    COALESCE((SELECT m1_units FROM public.profiles WHERE id = p_user_id), 0),
    'AUDIT: ' || p_action,
    p_transaction_id,
    'audit',
    p_details
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail on audit log errors
  RAISE WARNING 'Failed to log IAP audit: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_iap_audit TO service_role;

-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ COMMENTS                                                                    │
-- └──────────────────────────────────────────────────────────────────────────────┘

COMMENT ON TABLE public.iap_products IS 'Server-side product catalog for IAP validation';
COMMENT ON FUNCTION public.get_user_m1u_balance IS 'Get user M1U balance from profiles';
COMMENT ON FUNCTION public.increment_user_m1u IS 'Atomically increment user M1U balance';
COMMENT ON FUNCTION public.get_user_entitlements IS 'Get user subscription entitlements';
COMMENT ON FUNCTION public.log_iap_audit IS 'Log IAP actions for audit trail';
