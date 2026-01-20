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

