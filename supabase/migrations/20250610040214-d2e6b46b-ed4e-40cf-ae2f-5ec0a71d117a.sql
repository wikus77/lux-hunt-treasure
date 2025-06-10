
-- Create user_payment_methods table to store tokenized payment method information
CREATE TABLE public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_pm_id TEXT NOT NULL,
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payment methods
CREATE POLICY "Users can view their own payment methods" 
  ON public.user_payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own payment methods
CREATE POLICY "Users can insert their own payment methods" 
  ON public.user_payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own payment methods
CREATE POLICY "Users can update their own payment methods" 
  ON public.user_payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own payment methods
CREATE POLICY "Users can delete their own payment methods" 
  ON public.user_payment_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);
