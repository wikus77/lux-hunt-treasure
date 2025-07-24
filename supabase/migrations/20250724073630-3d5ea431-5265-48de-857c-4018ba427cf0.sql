-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- M1SSION™ Create user_payment_methods table (corrected syntax)

-- Create table only if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_payment_methods') THEN
    CREATE TABLE public.user_payment_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_pm_id TEXT NOT NULL,
      brand TEXT NOT NULL,
      last4 TEXT NOT NULL,
      exp_month INTEGER NOT NULL,
      exp_year INTEGER NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.user_payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.user_payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.user_payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.user_payment_methods;

-- Create policies for user payment methods
CREATE POLICY "Users can view their own payment methods"
ON public.user_payment_methods
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
ON public.user_payment_methods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
ON public.user_payment_methods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
ON public.user_payment_methods
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_default ON public.user_payment_methods(user_id, is_default);

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™