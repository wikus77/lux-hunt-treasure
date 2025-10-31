-- Migration: Fix PE triggers to use real tables (buzz_logs, buzz_map_actions, user_referrals) - CORRECTED
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- ============================================
-- 1. BUZZ TRIGGER (buzz_logs table)
-- ============================================
DROP TRIGGER IF EXISTS buzz_xp_trigger ON public.buzz_logs;
DROP TRIGGER IF EXISTS buzz_pe_trigger ON public.buzz_logs;

CREATE OR REPLACE FUNCTION public.handle_buzz_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award +15 PE directly and maintain backward compatibility
  PERFORM public.award_pulse_energy(NEW.user_id, 15, 'buzz', COALESCE(NEW.details, '{}'::jsonb));
  PERFORM public.award_xp(NEW.user_id, 15, 'buzz'); -- retro-compat: keeps total_xp aligned
  RETURN NEW;
END;
$$;

CREATE TRIGGER buzz_pe_trigger
  AFTER INSERT ON public.buzz_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_buzz_pe();

-- ============================================
-- 2. BUZZ MAP TRIGGER (buzz_map_actions table)
-- ============================================
DROP TRIGGER IF EXISTS buzz_map_xp_trigger ON public.buzz_map_actions;
DROP TRIGGER IF EXISTS buzz_map_pe_trigger ON public.buzz_map_actions;

CREATE OR REPLACE FUNCTION public.handle_buzz_map_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award +10 PE for map actions
  PERFORM public.award_pulse_energy(NEW.user_id, 10, 'buzz_map', COALESCE(NEW.meta, '{}'::jsonb));
  PERFORM public.award_xp(NEW.user_id, 10, 'buzz_map'); -- retro-compat
  RETURN NEW;
END;
$$;

CREATE TRIGGER buzz_map_pe_trigger
  AFTER INSERT ON public.buzz_map_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_buzz_map_pe();

-- ============================================
-- 3. REFERRAL TRIGGER (user_referrals table)
-- ============================================
DROP TRIGGER IF EXISTS referral_xp_trigger ON public.user_referrals;
DROP TRIGGER IF EXISTS referral_pe_trigger ON public.user_referrals;

CREATE OR REPLACE FUNCTION public.handle_referral_pe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award +25 PE to inviter when referral status becomes 'registered'
  IF NEW.inviter_id IS NOT NULL THEN
    PERFORM public.award_pulse_energy(
      NEW.inviter_id, 
      25, 
      'referral', 
      jsonb_build_object(
        'ref_user_id', NEW.user_id, 
        'status', NEW.status
      )
    );
    PERFORM public.award_xp(NEW.inviter_id, 25, 'referral'); -- retro-compat
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER referral_pe_trigger
  AFTER UPDATE OF status ON public.user_referrals
  FOR EACH ROW
  WHEN (NEW.status = 'registered' AND NEW.inviter_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_referral_pe();

-- ============================================
-- 4. Ensure agent_ranks is readable by all
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agent_ranks' 
    AND policyname = 'agent_ranks_public_read'
  ) THEN
    CREATE POLICY agent_ranks_public_read ON public.agent_ranks
      FOR SELECT USING (true);
  END IF;
END$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™