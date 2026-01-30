-- ============================================================================
-- M1SSION™ — RLS HARDENING V2: subscriptions (NO CLIENT ESCALATION)
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- PURPOSE: Prevent client-side privilege escalation
-- DATA MODEL: Multiple rows per user allowed (subscription history)
-- UNIQUE CONSTRAINT: stripe_subscription_id (NOT user_id)
-- 
-- SAFE: Idempotent, runs multiple times without errors
-- ============================================================================

-- ============================================================================
-- PHASE 1: ENSURE TABLE EXISTS WITH ALL REQUIRED COLUMNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan TEXT,
  tier TEXT,
  status TEXT DEFAULT 'inactive',
  provider TEXT,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns idempotently
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='tier') THEN
    ALTER TABLE public.subscriptions ADD COLUMN tier TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='is_active') THEN
    ALTER TABLE public.subscriptions ADD COLUMN is_active BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='provider') THEN
    ALTER TABLE public.subscriptions ADD COLUMN provider TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='metadata') THEN
    ALTER TABLE public.subscriptions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='start_date') THEN
    ALTER TABLE public.subscriptions ADD COLUMN start_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='end_date') THEN
    ALTER TABLE public.subscriptions ADD COLUMN end_date TIMESTAMPTZ;
  END IF;
END$$;

-- ============================================================================
-- PHASE 2: UNIQUE INDEXES (CORRECT SEMANTICS)
-- ============================================================================

-- IMPORTANT: We do NOT create UNIQUE(user_id) — multiple rows per user allowed

-- Unique index on stripe_subscription_id (WHERE NOT NULL)
-- This allows upsert by Stripe subscription ID
DROP INDEX IF EXISTS idx_subscriptions_stripe_sub_unique;
CREATE UNIQUE INDEX idx_subscriptions_stripe_sub_unique 
  ON public.subscriptions (stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

-- Partial unique index: ONE active FREE subscription per user
-- Handles both 'free' and 'FREE' tier values
DROP INDEX IF EXISTS idx_unique_free_active_per_user;
CREATE UNIQUE INDEX idx_unique_free_active_per_user
  ON public.subscriptions (user_id)
  WHERE status = 'active' AND LOWER(tier) = 'free';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);

-- ============================================================================
-- PHASE 3: ENABLE RLS + FORCE
-- ============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 4: DROP ALL EXISTING POLICIES (Clean slate)
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscriptions', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END$$;

-- ============================================================================
-- PHASE 5: CREATE MINIMAL SECURE POLICIES
-- ============================================================================

-- POLICY 1: SELECT OWN (authenticated users can read their own subscriptions)
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- POLICY 2: SERVICE ROLE FULL ACCESS (bypasses RLS by default, but explicit is clearer)
-- Note: service_role bypasses RLS automatically, this is for documentation
CREATE POLICY "subscriptions_service_role_all" ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- NO INSERT policy for authenticated — must use RPC
-- NO UPDATE policy for authenticated — must use service role/RPC
-- NO DELETE policy for authenticated — prevents data loss

-- ============================================================================
-- PHASE 6: REVOKE DIRECT TABLE PRIVILEGES (Defense in depth)
-- ============================================================================

-- Revoke ALL write operations from authenticated and anon
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;

-- Keep SELECT for authenticated (RLS will filter)
GRANT SELECT ON public.subscriptions TO authenticated;

-- Ensure service_role has full access
GRANT ALL ON public.subscriptions TO service_role;

-- ============================================================================
-- PHASE 7: RPC — create_free_subscription (CLIENT-SAFE)
-- ============================================================================

DROP FUNCTION IF EXISTS public.create_free_subscription();

CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_now timestamptz := now();
  v_sub_id uuid;
  v_existing record;
BEGIN
  -- Get calling user
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  -- Check for existing ACTIVE subscription (any tier)
  SELECT id, tier, status INTO v_existing
  FROM public.subscriptions
  WHERE user_id = v_uid AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true, 
      'already_active', true, 
      'subscription_id', v_existing.id,
      'tier', v_existing.tier,
      'message', 'User already has active subscription'
    );
  END IF;

  -- Create FREE subscription ONLY (hardcoded values prevent escalation)
  INSERT INTO public.subscriptions (
    user_id, 
    tier, 
    status, 
    provider, 
    is_active, 
    started_at,
    start_date,
    created_at, 
    updated_at, 
    metadata
  ) VALUES (
    v_uid, 
    'free',           -- HARDCODED: Only free tier
    'active', 
    'internal',       -- HARDCODED: Internal provider (not Stripe)
    true, 
    v_now,
    v_now,
    v_now, 
    v_now,
    jsonb_build_object(
      'source', 'create_free_subscription',
      'created_by', 'rls_hardened_rpc_v2'
    )
  )
  RETURNING id INTO v_sub_id;

  -- Also update profile tier for consistency
  UPDATE public.profiles 
  SET subscription_tier = 'free', tier = 'free', updated_at = v_now
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'ok', true, 
    'subscription_id', v_sub_id, 
    'tier', 'free'
  );
END
$$;

-- Grant execute to authenticated users ONLY
REVOKE ALL ON FUNCTION public.create_free_subscription() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_free_subscription() TO authenticated;

-- ============================================================================
-- PHASE 8: RPC — upsert_subscription_from_stripe (SERVICE-ROLE ONLY)
-- ============================================================================

DROP FUNCTION IF EXISTS public.upsert_subscription_from_stripe(uuid, text, text, text, text, timestamptz, timestamptz, jsonb);

CREATE OR REPLACE FUNCTION public.upsert_subscription_from_stripe(
  p_user_id uuid,
  p_tier text,
  p_status text,
  p_stripe_subscription_id text,
  p_stripe_customer_id text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id uuid;
  v_now timestamptz := now();
BEGIN
  -- Validate required inputs
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_id required');
  END IF;
  
  IF p_tier IS NULL OR p_tier = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tier required');
  END IF;

  IF p_stripe_subscription_id IS NULL OR p_stripe_subscription_id = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'stripe_subscription_id required for Stripe subscriptions');
  END IF;

  -- First, mark any existing active subscriptions for this user as canceled
  -- (except the one we're about to upsert)
  UPDATE public.subscriptions
  SET status = 'canceled', is_active = false, updated_at = v_now
  WHERE user_id = p_user_id 
    AND status = 'active'
    AND (stripe_subscription_id IS NULL OR stripe_subscription_id != p_stripe_subscription_id);

  -- Upsert by stripe_subscription_id (NOT user_id)
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    status,
    provider,
    is_active,
    stripe_subscription_id,
    stripe_customer_id,
    current_period_start,
    current_period_end,
    start_date,
    started_at,
    created_at,
    updated_at,
    metadata
  ) VALUES (
    p_user_id,
    p_tier,
    COALESCE(p_status, 'active'),
    'stripe',
    (COALESCE(p_status, 'active') = 'active'),
    p_stripe_subscription_id,
    p_stripe_customer_id,
    p_current_period_start,
    p_current_period_end,
    COALESCE(p_current_period_start, v_now),
    COALESCE(p_current_period_start, v_now),
    v_now,
    v_now,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL
  DO UPDATE SET
    tier = EXCLUDED.tier,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = v_now,
    metadata = COALESCE(public.subscriptions.metadata, '{}'::jsonb) || EXCLUDED.metadata
  RETURNING id INTO v_sub_id;

  -- Update profile tier for consistency
  UPDATE public.profiles 
  SET 
    subscription_tier = p_tier, 
    tier = p_tier, 
    updated_at = v_now
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'subscription_id', v_sub_id,
    'tier', p_tier,
    'status', COALESCE(p_status, 'active'),
    'stripe_subscription_id', p_stripe_subscription_id
  );
END
$$;

-- CRITICAL: Only service_role can execute this
REVOKE ALL ON FUNCTION public.upsert_subscription_from_stripe(uuid, text, text, text, text, timestamptz, timestamptz, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_subscription_from_stripe(uuid, text, text, text, text, timestamptz, timestamptz, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_subscription_from_stripe(uuid, text, text, text, text, timestamptz, timestamptz, jsonb) TO service_role;

-- ============================================================================
-- PHASE 9: RPC — cancel_user_subscriptions (SERVICE-ROLE ONLY)
-- ============================================================================

DROP FUNCTION IF EXISTS public.cancel_user_subscriptions(uuid);

CREATE OR REPLACE FUNCTION public.cancel_user_subscriptions(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_now timestamptz := now();
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_id required');
  END IF;

  UPDATE public.subscriptions
  SET status = 'canceled', is_active = false, updated_at = v_now
  WHERE user_id = p_user_id AND status = 'active';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Reset profile tier to free
  UPDATE public.profiles 
  SET subscription_tier = 'free', tier = 'free', updated_at = v_now
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'canceled_count', v_count
  );
END
$$;

-- Only service_role can cancel subscriptions
REVOKE ALL ON FUNCTION public.cancel_user_subscriptions(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_user_subscriptions(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_user_subscriptions(uuid) TO service_role;

-- ============================================================================
-- PHASE 10: VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_policy_count INT;
  v_rls_enabled BOOLEAN;
  v_rls_forced BOOLEAN;
  v_grants TEXT;
BEGIN
  -- Check RLS status
  SELECT relrowsecurity, relforcerowsecurity INTO v_rls_enabled, v_rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'subscriptions';
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'subscriptions';

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ RLS HARDENING V2 VERIFICATION';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS Enabled: %', v_rls_enabled;
  RAISE NOTICE 'RLS Forced: %', v_rls_forced;
  RAISE NOTICE 'Policy Count: % (expected: 2)', v_policy_count;
  RAISE NOTICE '============================================';
  
  IF NOT v_rls_enabled OR NOT v_rls_forced THEN
    RAISE WARNING '⚠️ RLS not properly enabled!';
  END IF;
  
  IF v_policy_count != 2 THEN
    RAISE WARNING '⚠️ Expected 2 policies, found %', v_policy_count;
  END IF;
END$$;

-- ============================================================================
-- END OF RLS HARDENING MIGRATION V2
-- ============================================================================
