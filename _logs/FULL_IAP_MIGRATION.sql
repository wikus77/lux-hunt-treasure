-- ============================================
-- M1SSION™ IAP Database Schema
-- In-App Purchases for M1U + Subscriptions
-- © 2026 Joseph MULÉ – NIYVORA KFT™
-- ============================================

-- 1) IAP PRODUCTS TABLE
-- Catalog of all IAP products (M1U packs + subscriptions)
CREATE TABLE IF NOT EXISTS public.iap_products (
    product_id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'both')),
    type TEXT NOT NULL CHECK (type IN ('consumable', 'subscription')),
    tier TEXT CHECK (tier IN ('silver', 'gold', 'black', 'titanium')),
    m1u_amount INTEGER,
    price_eur DECIMAL(10, 2) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    ios_sku TEXT,
    android_sku TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) IAP TRANSACTIONS TABLE
-- Every purchase attempt and verification
CREATE TABLE IF NOT EXISTS public.iap_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    product_id TEXT NOT NULL,
    
    -- iOS specific
    transaction_id TEXT,
    original_transaction_id TEXT,
    
    -- Android specific
    purchase_token TEXT,
    order_id TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'verified', 'rejected', 'refunded', 'duplicate', 'error')),
    
    -- Receipt/token for audit (minimal, no secrets)
    receipt_data JSONB,
    
    -- Result
    credited_m1u INTEGER,
    credited_tier TEXT,
    
    -- Error tracking
    error_code TEXT,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ,
    
    -- Idempotency constraints
    CONSTRAINT unique_ios_transaction UNIQUE NULLS NOT DISTINCT (transaction_id, user_id),
    CONSTRAINT unique_android_purchase UNIQUE NULLS NOT DISTINCT (purchase_token, user_id)
);

-- 3) USER WALLET TABLE (if not exists)
-- M1U balance - might already exist in profiles, this is fallback
CREATE TABLE IF NOT EXISTS public.user_wallet (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    balance_m1u BIGINT NOT NULL DEFAULT 0 CHECK (balance_m1u >= 0),
    total_earned_m1u BIGINT NOT NULL DEFAULT 0,
    total_spent_m1u BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) USER ENTITLEMENTS TABLE
-- Subscription status and entitlements
CREATE TABLE IF NOT EXISTS public.user_entitlements (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    
    -- Current subscription
    sub_tier TEXT CHECK (sub_tier IN ('silver', 'gold', 'black', 'titanium')),
    sub_status TEXT NOT NULL DEFAULT 'none' 
        CHECK (sub_status IN ('active', 'expired', 'grace', 'billing_retry', 'canceled', 'none')),
    sub_expires_at TIMESTAMPTZ,
    sub_platform TEXT CHECK (sub_platform IN ('ios', 'android')),
    
    -- Original purchase for subscription tracking
    original_transaction_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5) IAP AUDIT LOGS
-- Detailed audit trail for all IAP operations
CREATE TABLE IF NOT EXISTS public.iap_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    transaction_id UUID REFERENCES public.iap_transactions(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_iap_transactions_user_id ON public.iap_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_status ON public.iap_transactions(status);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_created_at ON public.iap_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_iap_transactions_transaction_id ON public.iap_transactions(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_transactions_purchase_token ON public.iap_transactions(purchase_token) WHERE purchase_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_entitlements_sub_status ON public.user_entitlements(sub_status);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_sub_expires ON public.user_entitlements(sub_expires_at) WHERE sub_expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_iap_audit_logs_user_id ON public.iap_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_audit_logs_created_at ON public.iap_audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.iap_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iap_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iap_audit_logs ENABLE ROW LEVEL SECURITY;

-- IAP PRODUCTS: Public read, no write from client
CREATE POLICY "iap_products_public_read" ON public.iap_products
    FOR SELECT TO authenticated, anon
    USING (active = true);

-- IAP TRANSACTIONS: Users can only read their own, no direct write
CREATE POLICY "iap_transactions_own_read" ON public.iap_transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies - only service role can write

-- USER WALLET: Users can only read their own
CREATE POLICY "user_wallet_own_read" ON public.user_wallet
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- USER ENTITLEMENTS: Users can only read their own
CREATE POLICY "user_entitlements_own_read" ON public.user_entitlements
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- AUDIT LOGS: No direct access from client
-- Only service role can read/write

-- ============================================
-- SEED IAP PRODUCTS
-- ============================================

INSERT INTO public.iap_products (product_id, platform, type, tier, m1u_amount, price_eur, name, description, ios_sku, android_sku)
VALUES
    -- M1U Consumables
    ('m1u_starter', 'both', 'consumable', NULL, 50, 4.99, 'Starter Pack', '50 M1U Credits', 'eu.m1ssion.m1u_starter', 'm1u_starter'),
    ('m1u_agent', 'both', 'consumable', NULL, 110, 9.99, 'Agent Pack', '110 M1U Credits (+10% bonus)', 'eu.m1ssion.m1u_agent', 'm1u_agent'),
    ('m1u_elite', 'both', 'consumable', NULL, 250, 19.99, 'Elite Pack', '250 M1U Credits (+20% bonus)', 'eu.m1ssion.m1u_elite', 'm1u_elite'),
    ('m1u_commander', 'both', 'consumable', NULL, 550, 39.99, 'Commander Pack', '550 M1U Credits (+27% bonus)', 'eu.m1ssion.m1u_commander', 'm1u_commander'),
    ('m1u_director', 'both', 'consumable', NULL, 1200, 79.99, 'Director Pack', '1200 M1U Credits (+33% bonus)', 'eu.m1ssion.m1u_director', 'm1u_director'),
    ('m1u_master', 'both', 'consumable', NULL, 3000, 199.99, 'Master Control Pack', '3000 M1U Credits (+33% bonus)', 'eu.m1ssion.m1u_master', 'm1u_master'),
    
    -- Subscriptions
    ('silver_monthly', 'both', 'subscription', 'silver', NULL, 3.99, 'Silver', 'Piano Silver - 3 indizi premium/settimana', 'eu.m1ssion.silver_monthly', 'silver_monthly'),
    ('gold_monthly', 'both', 'subscription', 'gold', NULL, 6.99, 'Gold', 'Piano Gold - 4 indizi premium/settimana + estrazioni', 'eu.m1ssion.gold_monthly', 'gold_monthly'),
    ('black_monthly', 'both', 'subscription', 'black', NULL, 9.99, 'Black', 'Piano Black - 5 indizi premium/settimana + VIP', 'eu.m1ssion.black_monthly', 'black_monthly'),
    ('titanium_monthly', 'both', 'subscription', 'titanium', NULL, 14.99, 'Titanium', 'Piano Titanium - Accesso totale + supporto prioritario', 'eu.m1ssion.titanium_monthly', 'titanium_monthly')
ON CONFLICT (product_id) DO UPDATE SET
    price_eur = EXCLUDED.price_eur,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    ios_sku = EXCLUDED.ios_sku,
    android_sku = EXCLUDED.android_sku;

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Get user's current M1U balance
CREATE OR REPLACE FUNCTION public.get_user_m1u_balance(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance BIGINT;
BEGIN
    -- Try user_wallet first
    SELECT balance_m1u INTO v_balance
    FROM user_wallet
    WHERE user_id = p_user_id;
    
    IF v_balance IS NOT NULL THEN
        RETURN v_balance;
    END IF;
    
    -- Fallback to profiles.m1_units
    SELECT m1_units INTO v_balance
    FROM profiles
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_balance, 0);
END;
$$;

-- Get user's current subscription entitlements
CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'sub_tier', COALESCE(sub_tier, 'none'),
        'sub_status', sub_status,
        'sub_expires_at', sub_expires_at,
        'sub_platform', sub_platform,
        'is_active', (sub_status = 'active' AND (sub_expires_at IS NULL OR sub_expires_at > now()))
    ) INTO v_result
    FROM user_entitlements
    WHERE user_id = p_user_id;
    
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'sub_tier', 'none',
            'sub_status', 'none',
            'sub_expires_at', NULL,
            'sub_platform', NULL,
            'is_active', false
        );
    END IF;
    
    RETURN v_result;
END;
$$;

-- Log IAP audit event
CREATE OR REPLACE FUNCTION public.log_iap_audit(
    p_user_id UUID,
    p_action TEXT,
    p_transaction_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO iap_audit_logs (user_id, action, transaction_id, details)
    VALUES (p_user_id, p_action, p_transaction_id, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.iap_products IS 'M1SSION IAP Product Catalog';
COMMENT ON TABLE public.iap_transactions IS 'All IAP purchase attempts and verifications';
COMMENT ON TABLE public.user_wallet IS 'User M1U balance (alternative to profiles.m1_units)';
COMMENT ON TABLE public.user_entitlements IS 'User subscription status and entitlements';
COMMENT ON TABLE public.iap_audit_logs IS 'Audit trail for all IAP operations';

-- ============================================
-- M1SSION™ IAP Helper Functions
-- Additional functions for M1U credit operations
-- © 2026 Joseph MULÉ – NIYVORA KFT™
-- ============================================

-- Increment user M1U balance atomically
CREATE OR REPLACE FUNCTION public.increment_user_m1u(
    p_user_id UUID,
    p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update profiles.m1_units
    UPDATE profiles
    SET 
        m1_units = COALESCE(m1_units, 0) + p_amount,
        updated_at = now()
    WHERE id = p_user_id
    RETURNING m1_units INTO v_new_balance;
    
    -- Also update user_wallet if exists
    INSERT INTO user_wallet (user_id, balance_m1u, total_earned_m1u, updated_at)
    VALUES (p_user_id, p_amount, p_amount, now())
    ON CONFLICT (user_id) DO UPDATE SET
        balance_m1u = user_wallet.balance_m1u + p_amount,
        total_earned_m1u = user_wallet.total_earned_m1u + p_amount,
        updated_at = now();
    
    RETURN COALESCE(v_new_balance, p_amount);
END;
$$;

-- Decrement user M1U balance atomically (for spending)
CREATE OR REPLACE FUNCTION public.decrement_user_m1u(
    p_user_id UUID,
    p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT COALESCE(m1_units, 0) INTO v_current_balance
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient M1U balance: % < %', v_current_balance, p_amount;
    END IF;
    
    -- Update profiles.m1_units
    UPDATE profiles
    SET 
        m1_units = m1_units - p_amount,
        updated_at = now()
    WHERE id = p_user_id
    RETURNING m1_units INTO v_new_balance;
    
    -- Also update user_wallet if exists
    UPDATE user_wallet
    SET 
        balance_m1u = balance_m1u - p_amount,
        total_spent_m1u = total_spent_m1u + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN v_new_balance;
END;
$$;

-- Grant subscription entitlement
CREATE OR REPLACE FUNCTION public.grant_subscription_entitlement(
    p_user_id UUID,
    p_tier TEXT,
    p_platform TEXT,
    p_expires_at TIMESTAMPTZ,
    p_original_transaction_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Validate tier
    IF p_tier NOT IN ('silver', 'gold', 'black', 'titanium') THEN
        RAISE EXCEPTION 'Invalid subscription tier: %', p_tier;
    END IF;
    
    -- Upsert entitlements
    INSERT INTO user_entitlements (
        user_id, 
        sub_tier, 
        sub_status, 
        sub_expires_at, 
        sub_platform, 
        original_transaction_id,
        updated_at
    )
    VALUES (
        p_user_id, 
        p_tier, 
        'active', 
        p_expires_at, 
        p_platform, 
        p_original_transaction_id,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        sub_tier = EXCLUDED.sub_tier,
        sub_status = EXCLUDED.sub_status,
        sub_expires_at = EXCLUDED.sub_expires_at,
        sub_platform = EXCLUDED.sub_platform,
        original_transaction_id = COALESCE(EXCLUDED.original_transaction_id, user_entitlements.original_transaction_id),
        updated_at = now();
    
    -- Update profiles
    UPDATE profiles
    SET 
        subscription_tier = p_tier,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Return updated entitlements
    SELECT jsonb_build_object(
        'sub_tier', sub_tier,
        'sub_status', sub_status,
        'sub_expires_at', sub_expires_at,
        'sub_platform', sub_platform,
        'is_active', true
    ) INTO v_result
    FROM user_entitlements
    WHERE user_id = p_user_id;
    
    RETURN v_result;
END;
$$;

-- Revoke subscription entitlement (on expiry or cancellation)
CREATE OR REPLACE FUNCTION public.revoke_subscription_entitlement(
    p_user_id UUID,
    p_reason TEXT DEFAULT 'expired'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update entitlements
    UPDATE user_entitlements
    SET 
        sub_status = CASE 
            WHEN p_reason = 'canceled' THEN 'canceled'
            WHEN p_reason = 'refunded' THEN 'canceled'
            ELSE 'expired'
        END,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Update profiles to Base
    UPDATE profiles
    SET 
        subscription_tier = 'Base',
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Log the revocation
    PERFORM log_iap_audit(
        p_user_id,
        'SUBSCRIPTION_REVOKED',
        NULL,
        jsonb_build_object('reason', p_reason)
    );
END;
$$;

-- Check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM user_entitlements
        WHERE user_id = p_user_id
          AND sub_status IN ('active', 'grace')
          AND (sub_expires_at IS NULL OR sub_expires_at > now())
    ) INTO v_has_active;
    
    RETURN COALESCE(v_has_active, false);
END;
$$;

-- Get user's subscription tier (or 'Base')
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tier TEXT;
BEGIN
    SELECT sub_tier INTO v_tier
    FROM user_entitlements
    WHERE user_id = p_user_id
      AND sub_status IN ('active', 'grace')
      AND (sub_expires_at IS NULL OR sub_expires_at > now());
    
    RETURN COALESCE(v_tier, 'Base');
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.increment_user_m1u(UUID, INTEGER) IS 'Atomically increment user M1U balance';
COMMENT ON FUNCTION public.decrement_user_m1u(UUID, INTEGER) IS 'Atomically decrement user M1U balance with balance check';
COMMENT ON FUNCTION public.grant_subscription_entitlement(UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT) IS 'Grant subscription tier to user';
COMMENT ON FUNCTION public.revoke_subscription_entitlement(UUID, TEXT) IS 'Revoke subscription from user';
COMMENT ON FUNCTION public.has_active_subscription(UUID) IS 'Check if user has active subscription';
COMMENT ON FUNCTION public.get_user_subscription_tier(UUID) IS 'Get user current subscription tier';

-- ============================================
-- M1SSION™ IAP Enterprise Hardening
-- Notifications + Rate Limits + Replay Defense
-- © 2026 Joseph MULÉ – NIYVORA KFT™
-- ============================================

-- ============================================
-- 1. IAP NOTIFICATIONS TABLE (Apple ASN + Google RTDN)
-- ============================================

CREATE TABLE IF NOT EXISTS public.iap_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Platform identification
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    
    -- Notification metadata
    notification_id TEXT,  -- Apple: notificationUUID, Google: messageId
    notification_type TEXT NOT NULL,
    notification_subtype TEXT,
    
    -- Transaction/purchase identification
    original_transaction_id TEXT,  -- iOS
    transaction_id TEXT,           -- iOS
    purchase_token TEXT,           -- Android
    product_id TEXT,
    
    -- User mapping (if resolvable)
    user_id UUID REFERENCES auth.users(id),
    
    -- Raw payload for audit
    payload JSONB NOT NULL,
    signature_valid BOOLEAN,
    
    -- Environment
    environment TEXT CHECK (environment IN ('sandbox', 'production')),
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'received' 
        CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored', 'duplicate')),
    processing_error TEXT,
    
    -- Correlation for logging
    correlation_id TEXT,
    
    -- Timestamps
    event_timestamp TIMESTAMPTZ,  -- When event occurred at Apple/Google
    received_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    
    -- Basic constraints (partial uniques handled via indexes below)
    CONSTRAINT chk_notification_platform CHECK (platform IN ('ios', 'android'))
);

-- Indexes for iap_notifications
CREATE INDEX IF NOT EXISTS idx_iap_notifications_platform ON public.iap_notifications(platform);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_status ON public.iap_notifications(status);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_user_id ON public.iap_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_received_at ON public.iap_notifications(received_at);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_original_txn ON public.iap_notifications(original_transaction_id) WHERE original_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_notifications_purchase_token ON public.iap_notifications(purchase_token) WHERE purchase_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_notifications_correlation ON public.iap_notifications(correlation_id) WHERE correlation_id IS NOT NULL;

-- Partial unique indexes for idempotency (replaces inline CONSTRAINT UNIQUE with WHERE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ios_notification 
    ON public.iap_notifications(notification_id) 
    WHERE platform = 'ios' AND notification_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ios_event 
    ON public.iap_notifications(original_transaction_id, notification_type, notification_subtype, event_timestamp)
    WHERE platform = 'ios' AND original_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_android_event 
    ON public.iap_notifications(purchase_token, notification_type, event_timestamp)
    WHERE platform = 'android' AND purchase_token IS NOT NULL;

-- ============================================
-- 2. RATE LIMITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.iap_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rate limit key (user_id, ip, or composite)
    limit_key TEXT NOT NULL,
    limit_type TEXT NOT NULL CHECK (limit_type IN ('user', 'ip', 'endpoint', 'transaction')),
    
    -- Endpoint being rate limited
    endpoint TEXT NOT NULL,
    
    -- Request tracking
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    window_duration_seconds INTEGER NOT NULL DEFAULT 60,
    
    -- Last request
    last_request_at TIMESTAMPTZ DEFAULT now(),
    
    -- Unique constraint per key per window
    CONSTRAINT unique_rate_limit_key UNIQUE (limit_key, limit_type, endpoint, window_start)
);

-- Indexes for rate limits
CREATE INDEX IF NOT EXISTS idx_iap_rate_limits_key ON public.iap_rate_limits(limit_key, limit_type);
CREATE INDEX IF NOT EXISTS idx_iap_rate_limits_window ON public.iap_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_iap_rate_limits_endpoint ON public.iap_rate_limits(endpoint);

-- ============================================
-- 3. REPLAY DEFENSE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.iap_request_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Token composition
    token_hash TEXT NOT NULL UNIQUE,  -- SHA256 of (user_id + transaction_id/purchase_token + endpoint)
    
    -- Components (for debugging)
    user_id UUID,
    transaction_id TEXT,
    purchase_token TEXT,
    endpoint TEXT NOT NULL,
    
    -- TTL management
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Index for token lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_iap_request_tokens_hash ON public.iap_request_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_iap_request_tokens_expires ON public.iap_request_tokens(expires_at);

-- ============================================
-- 4. SUBSCRIPTION STATUS MAPPING
-- ============================================

-- Reference table for status normalization
CREATE TABLE IF NOT EXISTS public.iap_status_mapping (
    id SERIAL PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'both')),
    source_status TEXT NOT NULL,
    source_context TEXT,  -- e.g., notificationType for Apple
    normalized_status TEXT NOT NULL 
        CHECK (normalized_status IN ('active', 'expired', 'grace', 'billing_retry', 'canceled', 'revoked', 'pending')),
    description TEXT
);

-- Seed Apple status mappings
INSERT INTO public.iap_status_mapping (platform, source_status, source_context, normalized_status, description)
VALUES
    -- Apple notification types
    ('ios', 'SUBSCRIBED', NULL, 'active', 'New subscription'),
    ('ios', 'DID_RENEW', NULL, 'active', 'Subscription renewed'),
    ('ios', 'DID_CHANGE_RENEWAL_STATUS', 'AUTO_RENEW_ENABLED', 'active', 'Auto-renew re-enabled'),
    ('ios', 'DID_CHANGE_RENEWAL_STATUS', 'AUTO_RENEW_DISABLED', 'active', 'Auto-renew disabled but still active'),
    ('ios', 'DID_CHANGE_RENEWAL_PREF', NULL, 'active', 'Plan change scheduled'),
    ('ios', 'OFFER_REDEEMED', NULL, 'active', 'Offer redeemed'),
    ('ios', 'GRACE_PERIOD', NULL, 'grace', 'In grace period'),
    ('ios', 'DID_FAIL_TO_RENEW', NULL, 'billing_retry', 'Billing retry'),
    ('ios', 'EXPIRED', NULL, 'expired', 'Subscription expired'),
    ('ios', 'REVOKE', NULL, 'revoked', 'Refund granted, access revoked'),
    ('ios', 'REFUND', NULL, 'revoked', 'Refund processed'),
    ('ios', 'REFUND_DECLINED', NULL, 'active', 'Refund declined, still active'),
    ('ios', 'CONSUMPTION_REQUEST', NULL, 'active', 'Consumption request (no status change)'),
    -- Google notification types
    ('android', 'SUBSCRIPTION_RECOVERED', NULL, 'active', 'Recovered from account hold'),
    ('android', 'SUBSCRIPTION_RENEWED', NULL, 'active', 'Subscription renewed'),
    ('android', 'SUBSCRIPTION_PURCHASED', NULL, 'active', 'New subscription'),
    ('android', 'SUBSCRIPTION_RESTARTED', NULL, 'active', 'Subscription restarted'),
    ('android', 'SUBSCRIPTION_IN_GRACE_PERIOD', NULL, 'grace', 'In grace period'),
    ('android', 'SUBSCRIPTION_ON_HOLD', NULL, 'billing_retry', 'Account hold'),
    ('android', 'SUBSCRIPTION_PAUSED', NULL, 'billing_retry', 'Subscription paused'),
    ('android', 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED', NULL, 'active', 'Pause schedule changed'),
    ('android', 'SUBSCRIPTION_CANCELED', NULL, 'canceled', 'User canceled'),
    ('android', 'SUBSCRIPTION_EXPIRED', NULL, 'expired', 'Subscription expired'),
    ('android', 'SUBSCRIPTION_REVOKED', NULL, 'revoked', 'Subscription revoked'),
    ('android', 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED', NULL, 'active', 'Price change confirmed')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. ENHANCED CONSTRAINTS ON EXISTING TABLES
-- ============================================

-- Add missing unique constraints to iap_transactions if not exist
-- Partial unique indexes for iOS and Android transaction idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_iap_transactions_ios_txn_unique 
    ON public.iap_transactions(transaction_id) 
    WHERE transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_iap_transactions_android_token_unique 
    ON public.iap_transactions(purchase_token) 
    WHERE purchase_token IS NOT NULL;

-- Add correlation_id to iap_transactions if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'iap_transactions' AND column_name = 'correlation_id'
    ) THEN
        ALTER TABLE public.iap_transactions ADD COLUMN correlation_id TEXT;
    END IF;
END $$;

-- ============================================
-- 6. CLEANUP FUNCTIONS
-- ============================================

-- Cleanup expired rate limit windows
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM iap_rate_limits
    WHERE window_start < now() - (window_duration_seconds * INTERVAL '1 second') * 2;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- Cleanup expired request tokens (replay defense)
CREATE OR REPLACE FUNCTION public.cleanup_expired_request_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM iap_request_tokens
    WHERE expires_at < now();
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Check rate limit (returns true if allowed, false if blocked)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_limit_key TEXT,
    p_limit_type TEXT,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 5,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
    v_remaining INTEGER;
    v_allowed BOOLEAN;
BEGIN
    -- Calculate current window start
    v_window_start := date_trunc('second', now()) - 
        (EXTRACT(EPOCH FROM now())::INTEGER % p_window_seconds) * INTERVAL '1 second';
    
    -- Try to insert or update rate limit record
    INSERT INTO iap_rate_limits (limit_key, limit_type, endpoint, request_count, window_start, window_duration_seconds, last_request_at)
    VALUES (p_limit_key, p_limit_type, p_endpoint, 1, v_window_start, p_window_seconds, now())
    ON CONFLICT (limit_key, limit_type, endpoint, window_start) DO UPDATE SET
        request_count = iap_rate_limits.request_count + 1,
        last_request_at = now()
    RETURNING request_count INTO v_current_count;
    
    v_remaining := GREATEST(0, p_max_requests - v_current_count);
    v_allowed := v_current_count <= p_max_requests;
    
    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'current_count', v_current_count,
        'max_requests', p_max_requests,
        'remaining', v_remaining,
        'window_seconds', p_window_seconds,
        'reset_at', v_window_start + (p_window_seconds * INTERVAL '1 second')
    );
END;
$$;

-- Check for replay (returns true if this is a replay, false if new request)
CREATE OR REPLACE FUNCTION public.check_replay(
    p_user_id UUID,
    p_transaction_id TEXT,
    p_purchase_token TEXT,
    p_endpoint TEXT,
    p_ttl_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token_hash TEXT;
    v_is_replay BOOLEAN;
BEGIN
    -- Create unique token hash
    v_token_hash := encode(
        sha256(
            (COALESCE(p_user_id::TEXT, '') || '|' || 
             COALESCE(p_transaction_id, '') || '|' || 
             COALESCE(p_purchase_token, '') || '|' || 
             p_endpoint)::BYTEA
        ), 
        'hex'
    );
    
    -- Try to insert token
    INSERT INTO iap_request_tokens (token_hash, user_id, transaction_id, purchase_token, endpoint, expires_at)
    VALUES (v_token_hash, p_user_id, p_transaction_id, p_purchase_token, p_endpoint, now() + (p_ttl_minutes * INTERVAL '1 minute'))
    ON CONFLICT (token_hash) DO NOTHING;
    
    -- If insert succeeded (affected rows = 1), it's a new request
    -- If insert was skipped (conflict), it's a replay
    GET DIAGNOSTICS v_is_replay = ROW_COUNT;
    
    RETURN v_is_replay = 0;  -- True if replay (no rows inserted)
END;
$$;

-- Map notification to normalized status
CREATE OR REPLACE FUNCTION public.map_notification_to_status(
    p_platform TEXT,
    p_notification_type TEXT,
    p_subtype TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT normalized_status INTO v_status
    FROM iap_status_mapping
    WHERE platform IN (p_platform, 'both')
      AND source_status = p_notification_type
      AND (source_context IS NULL OR source_context = p_subtype)
    ORDER BY 
        CASE WHEN source_context = p_subtype THEN 0 ELSE 1 END
    LIMIT 1;
    
    RETURN COALESCE(v_status, 'active');  -- Default to active if unknown
END;
$$;

-- Log notification (with idempotency)
CREATE OR REPLACE FUNCTION public.log_iap_notification(
    p_platform TEXT,
    p_notification_id TEXT,
    p_notification_type TEXT,
    p_notification_subtype TEXT,
    p_original_transaction_id TEXT,
    p_transaction_id TEXT,
    p_purchase_token TEXT,
    p_product_id TEXT,
    p_user_id UUID,
    p_payload JSONB,
    p_signature_valid BOOLEAN,
    p_environment TEXT,
    p_event_timestamp TIMESTAMPTZ,
    p_correlation_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO iap_notifications (
        platform, notification_id, notification_type, notification_subtype,
        original_transaction_id, transaction_id, purchase_token, product_id,
        user_id, payload, signature_valid, environment, 
        event_timestamp, correlation_id, status
    )
    VALUES (
        p_platform, p_notification_id, p_notification_type, p_notification_subtype,
        p_original_transaction_id, p_transaction_id, p_purchase_token, p_product_id,
        p_user_id, p_payload, p_signature_valid, p_environment,
        p_event_timestamp, p_correlation_id, 'received'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_notification_id;
    
    -- If NULL, it was a duplicate
    IF v_notification_id IS NULL THEN
        -- Mark as duplicate and return existing ID
        SELECT id INTO v_notification_id
        FROM iap_notifications
        WHERE platform = p_platform
          AND (
            (p_notification_id IS NOT NULL AND notification_id = p_notification_id)
            OR (p_platform = 'ios' AND original_transaction_id = p_original_transaction_id 
                AND notification_type = p_notification_type 
                AND COALESCE(notification_subtype, '') = COALESCE(p_notification_subtype, '')
                AND event_timestamp = p_event_timestamp)
            OR (p_platform = 'android' AND purchase_token = p_purchase_token 
                AND notification_type = p_notification_type 
                AND event_timestamp = p_event_timestamp)
          )
        LIMIT 1;
    END IF;
    
    RETURN v_notification_id;
END;
$$;

-- Update notification status
CREATE OR REPLACE FUNCTION public.update_notification_status(
    p_notification_id UUID,
    p_status TEXT,
    p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE iap_notifications
    SET 
        status = p_status,
        processing_error = p_error,
        processed_at = CASE WHEN p_status IN ('processed', 'failed', 'ignored') THEN now() ELSE processed_at END
    WHERE id = p_notification_id;
END;
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.iap_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iap_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iap_request_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iap_status_mapping ENABLE ROW LEVEL SECURITY;

-- No direct client access to these tables - only service role
-- (No policies = denied by default when RLS enabled)

-- Status mapping is read-only public
CREATE POLICY "iap_status_mapping_public_read" ON public.iap_status_mapping
    FOR SELECT TO authenticated, anon
    USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.iap_notifications IS 'Apple ASN v2 and Google RTDN notifications audit log';
COMMENT ON TABLE public.iap_rate_limits IS 'Rate limiting for IAP endpoints';
COMMENT ON TABLE public.iap_request_tokens IS 'Replay defense tokens with TTL';
COMMENT ON TABLE public.iap_status_mapping IS 'Subscription status normalization mapping';

COMMENT ON FUNCTION public.check_rate_limit(TEXT, TEXT, TEXT, INTEGER, INTEGER) IS 'Check and update rate limit for a request';
COMMENT ON FUNCTION public.check_replay(UUID, TEXT, TEXT, TEXT, INTEGER) IS 'Check if request is a replay attack';
COMMENT ON FUNCTION public.map_notification_to_status(TEXT, TEXT, TEXT) IS 'Map platform notification to normalized status';

