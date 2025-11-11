-- M1 UNITS™ System — User M1 Units Table
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- INSTRUCTIONS: Copy and paste this entire file into Supabase SQL Editor and run it

-- Create user_m1_units table
CREATE TABLE IF NOT EXISTS public.user_m1_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT user_m1_units_balance_check CHECK (balance >= 0)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_m1_units_user_id ON public.user_m1_units(user_id);

-- Enable RLS
ALTER TABLE public.user_m1_units ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own M1 Units
CREATE POLICY "Users can read own M1 Units"
  ON public.user_m1_units
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON public.user_m1_units
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable Realtime (REPLICA IDENTITY FULL for complete row data)
ALTER TABLE public.user_m1_units REPLICA IDENTITY FULL;

-- Add table to realtime publication
DO $$
BEGIN
  -- Check if publication exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add table to publication if not already added
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_m1_units'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_m1_units;
  END IF;
END $$;

-- Test RPC function: m1u_ping (for smoke test)
CREATE OR REPLACE FUNCTION public.m1u_ping(target_uid UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data jsonb;
BEGIN
  -- Only allow users to ping themselves (security)
  IF auth.uid() != target_uid THEN
    RAISE EXCEPTION 'Unauthorized: can only ping own M1U account';
  END IF;

  -- Get current M1U balance
  SELECT jsonb_build_object(
    'user_id', user_id,
    'balance', balance,
    'last_updated', last_updated,
    'ping_timestamp', NOW()
  )
  INTO result_data
  FROM public.user_m1_units
  WHERE user_id = target_uid;

  -- If no record exists, create one
  IF result_data IS NULL THEN
    INSERT INTO public.user_m1_units (user_id, balance)
    VALUES (target_uid, 0)
    RETURNING jsonb_build_object(
      'user_id', user_id,
      'balance', balance,
      'last_updated', last_updated,
      'ping_timestamp', NOW()
    )
    INTO result_data;
  END IF;

  -- Trigger an UPDATE to send realtime notification
  UPDATE public.user_m1_units
  SET last_updated = NOW()
  WHERE user_id = target_uid;

  RETURN result_data;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.m1u_ping(UUID) TO authenticated;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '✅ M1 Units table created successfully';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Realtime enabled';
  RAISE NOTICE '✅ m1u_ping() function created';
  RAISE NOTICE '🎯 Table ready for testing!';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
