-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX: Add missing columns to user_buzz_counter and user_clues

-- 1. Add daily_count column to user_buzz_counter if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_buzz_counter' 
        AND column_name = 'daily_count'
    ) THEN
        ALTER TABLE public.user_buzz_counter ADD COLUMN daily_count integer NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added daily_count column to user_buzz_counter';
    END IF;
END $$;

-- 2. Add metadata column to user_clues if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_clues' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.user_clues ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added metadata column to user_clues';
    END IF;
END $$;

-- 3. Ensure user_m1_units table exists with correct structure
CREATE TABLE IF NOT EXISTS public.user_m1_units (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance integer NOT NULL DEFAULT 0,
    total_earned integer NOT NULL DEFAULT 0,
    total_spent integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS on user_m1_units
ALTER TABLE public.user_m1_units ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for user_m1_units
DROP POLICY IF EXISTS "Users can view own M1U balance" ON public.user_m1_units;
CREATE POLICY "Users can view own M1U balance" ON public.user_m1_units
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own M1U balance" ON public.user_m1_units;
CREATE POLICY "Users can update own M1U balance" ON public.user_m1_units
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Create or replace buzz_spend_m1u RPC function
CREATE OR REPLACE FUNCTION public.buzz_spend_m1u(p_cost_m1u integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

    -- Get current balance
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.buzz_spend_m1u(integer) TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™