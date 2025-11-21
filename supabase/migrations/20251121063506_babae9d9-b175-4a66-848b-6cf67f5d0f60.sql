-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Add INSERT policy for user_m1_units and set search_path for buzz_spend_m1u

-- 1. Add INSERT policy for user_m1_units (needed for RPC to initialize records)
DROP POLICY IF EXISTS "Users can insert own M1U record" ON public.user_m1_units;
CREATE POLICY "Users can insert own M1U record" ON public.user_m1_units
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 2. Fix buzz_spend_m1u search_path and ensure it uses user_m1_units
CREATE OR REPLACE FUNCTION public.buzz_spend_m1u(p_cost_m1u integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_id uuid;
    v_old_balance integer;
    v_new_balance integer;
    v_timestamp timestamptz;
BEGIN
    -- Get authenticated user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'unauthorized',
            'message', 'User not authenticated'
        );
    END IF;

    -- Get current balance from user_m1_units
    SELECT balance INTO v_old_balance
    FROM public.user_m1_units
    WHERE user_id = v_user_id;

    -- Initialize if no record exists
    IF v_old_balance IS NULL THEN
        INSERT INTO public.user_m1_units (user_id, balance, total_earned, total_spent)
        VALUES (v_user_id, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        v_old_balance := 0;
    END IF;

    -- Check if user has enough M1U
    IF v_old_balance < p_cost_m1u THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'insufficient_m1u',
            'message', 'Saldo M1U insufficiente',
            'current_balance', v_old_balance,
            'required', p_cost_m1u
        );
    END IF;

    -- Deduct M1U and update totals
    v_new_balance := v_old_balance - p_cost_m1u;
    v_timestamp := now();

    UPDATE public.user_m1_units
    SET 
        balance = v_new_balance,
        total_spent = total_spent + p_cost_m1u,
        updated_at = v_timestamp
    WHERE user_id = v_user_id;

    -- Log the transaction
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES (
        v_user_id,
        -p_cost_m1u,
        'buzz_spend',
        jsonb_build_object(
            'cost_m1u', p_cost_m1u,
            'old_balance', v_old_balance,
            'new_balance', v_new_balance
        )
    );

    -- Return success with details
    RETURN jsonb_build_object(
        'success', true,
        'spent', p_cost_m1u,
        'old_balance', v_old_balance,
        'new_balance', v_new_balance,
        'timestamp', v_timestamp
    );
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™