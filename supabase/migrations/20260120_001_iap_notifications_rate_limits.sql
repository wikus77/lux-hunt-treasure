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
    
    -- Idempotency constraints
    CONSTRAINT unique_ios_notification 
        UNIQUE NULLS NOT DISTINCT (platform, notification_id) 
        WHERE platform = 'ios' AND notification_id IS NOT NULL,
    CONSTRAINT unique_ios_event 
        UNIQUE NULLS NOT DISTINCT (platform, original_transaction_id, notification_type, notification_subtype, event_timestamp)
        WHERE platform = 'ios',
    CONSTRAINT unique_android_event 
        UNIQUE NULLS NOT DISTINCT (platform, purchase_token, notification_type, event_timestamp)
        WHERE platform = 'android'
);

-- Indexes for iap_notifications
CREATE INDEX IF NOT EXISTS idx_iap_notifications_platform ON public.iap_notifications(platform);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_status ON public.iap_notifications(status);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_user_id ON public.iap_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_received_at ON public.iap_notifications(received_at);
CREATE INDEX IF NOT EXISTS idx_iap_notifications_original_txn ON public.iap_notifications(original_transaction_id) WHERE original_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_notifications_purchase_token ON public.iap_notifications(purchase_token) WHERE purchase_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_notifications_correlation ON public.iap_notifications(correlation_id) WHERE correlation_id IS NOT NULL;

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
DO $$
BEGIN
    -- iOS transaction_id unique (if not already)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'iap_transactions_ios_txn_unique'
    ) THEN
        ALTER TABLE public.iap_transactions 
        ADD CONSTRAINT iap_transactions_ios_txn_unique 
        UNIQUE NULLS NOT DISTINCT (transaction_id) 
        WHERE transaction_id IS NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Constraint might already exist with different name
    NULL;
END $$;

DO $$
BEGIN
    -- Android purchase_token unique (if not already)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'iap_transactions_android_token_unique'
    ) THEN
        ALTER TABLE public.iap_transactions 
        ADD CONSTRAINT iap_transactions_android_token_unique 
        UNIQUE NULLS NOT DISTINCT (purchase_token) 
        WHERE purchase_token IS NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

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

COMMENT ON FUNCTION public.check_rate_limit IS 'Check and update rate limit for a request';
COMMENT ON FUNCTION public.check_replay IS 'Check if request is a replay attack';
COMMENT ON FUNCTION public.map_notification_to_status IS 'Map platform notification to normalized status';

