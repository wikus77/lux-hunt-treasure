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

COMMENT ON FUNCTION public.increment_user_m1u IS 'Atomically increment user M1U balance';
COMMENT ON FUNCTION public.decrement_user_m1u IS 'Atomically decrement user M1U balance with balance check';
COMMENT ON FUNCTION public.grant_subscription_entitlement IS 'Grant subscription tier to user';
COMMENT ON FUNCTION public.revoke_subscription_entitlement IS 'Revoke subscription from user';
COMMENT ON FUNCTION public.has_active_subscription IS 'Check if user has active subscription';
COMMENT ON FUNCTION public.get_user_subscription_tier IS 'Get user current subscription tier';

