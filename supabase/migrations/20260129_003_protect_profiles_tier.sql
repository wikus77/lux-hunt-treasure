-- ============================================================================
-- M1SSION™ — PROTECT profiles.subscription_tier FROM CLIENT ESCALATION
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- PURPOSE: Prevent users from self-upgrading their subscription tier
-- APPROACH: Use trigger to reject changes to sensitive columns
-- SAFE: Idempotent, does not affect service_role operations
-- ============================================================================

-- ============================================================================
-- PHASE 1: CREATE TRIGGER FUNCTION TO PROTECT SENSITIVE COLUMNS
-- ============================================================================

DROP FUNCTION IF EXISTS public.protect_profile_tier_escalation() CASCADE;

CREATE OR REPLACE FUNCTION public.protect_profile_tier_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to update anything (bypasses this check)
  -- Check if the current role is NOT service_role
  IF current_setting('role', true) != 'service_role' 
     AND current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
    
    -- Block subscription_tier escalation (can only go DOWN or stay same)
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
      -- Define tier hierarchy
      -- base < silver < gold < black < titanium
      DECLARE
        old_rank int := CASE LOWER(COALESCE(OLD.subscription_tier, 'base'))
          WHEN 'base' THEN 1
          WHEN 'free' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'black' THEN 4
          WHEN 'titanium' THEN 5
          ELSE 1
        END;
        new_rank int := CASE LOWER(COALESCE(NEW.subscription_tier, 'base'))
          WHEN 'base' THEN 1
          WHEN 'free' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'black' THEN 4
          WHEN 'titanium' THEN 5
          ELSE 1
        END;
      BEGIN
        -- Block UPGRADE attempts (new_rank > old_rank)
        IF new_rank > old_rank THEN
          RAISE EXCEPTION 'M1SSION™ Security: subscription_tier upgrade blocked. Use authorized payment flow.';
        END IF;
      END;
    END IF;
    
    -- Block direct tier column changes too
    IF NEW.tier IS DISTINCT FROM OLD.tier THEN
      DECLARE
        old_rank int := CASE LOWER(COALESCE(OLD.tier, 'base'))
          WHEN 'base' THEN 1
          WHEN 'free' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'black' THEN 4
          WHEN 'titanium' THEN 5
          ELSE 1
        END;
        new_rank int := CASE LOWER(COALESCE(NEW.tier, 'base'))
          WHEN 'base' THEN 1
          WHEN 'free' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'black' THEN 4
          WHEN 'titanium' THEN 5
          ELSE 1
        END;
      BEGIN
        IF new_rank > old_rank THEN
          RAISE EXCEPTION 'M1SSION™ Security: tier upgrade blocked. Use authorized payment flow.';
        END IF;
      END;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PHASE 2: ATTACH TRIGGER TO profiles TABLE
-- ============================================================================

DROP TRIGGER IF EXISTS tr_protect_profile_tier ON public.profiles;

CREATE TRIGGER tr_protect_profile_tier
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_tier_escalation();

-- ============================================================================
-- PHASE 3: CREATE RPC FOR SAFE TIER DOWNGRADE (e.g., cancellation)
-- ============================================================================

DROP FUNCTION IF EXISTS public.downgrade_to_free();

CREATE OR REPLACE FUNCTION public.downgrade_to_free()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;
  
  -- Update profile to base/free
  UPDATE public.profiles
  SET subscription_tier = 'base', tier = 'base', updated_at = now()
  WHERE id = v_uid;
  
  -- Mark all active subscriptions as canceled
  UPDATE public.subscriptions
  SET status = 'canceled', is_active = false, updated_at = now()
  WHERE user_id = v_uid AND status = 'active';
  
  RETURN jsonb_build_object('ok', true, 'tier', 'base');
END;
$$;

REVOKE ALL ON FUNCTION public.downgrade_to_free() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.downgrade_to_free() TO authenticated;

-- ============================================================================
-- PHASE 4: VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ M1SSION™ SECURITY: profiles.subscription_tier now protected';
  RAISE NOTICE '✅ Users can DOWNGRADE (or same), but CANNOT UPGRADE directly';
  RAISE NOTICE '✅ Upgrades require: Stripe webhook / IAP validation / service_role';
END$$;
