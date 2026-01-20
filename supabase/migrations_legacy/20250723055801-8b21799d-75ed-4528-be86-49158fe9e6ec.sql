-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Create user_payment_transactions table for payment history tracking

CREATE TABLE IF NOT EXISTS public.user_payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'completed',
  payment_method_brand TEXT,
  last4 TEXT,
  subscription_id UUID,
  stripe_payment_intent_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user transactions
CREATE POLICY "Users can view their own payment transactions" 
ON public.user_payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment transactions" 
ON public.user_payment_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update payment transactions" 
ON public.user_payment_transactions 
FOR UPDATE 
USING (true);

-- Create index for performance
CREATE INDEX idx_user_payment_transactions_user_id ON public.user_payment_transactions(user_id);
CREATE INDEX idx_user_payment_transactions_created_at ON public.user_payment_transactions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_user_payment_transactions_updated_at
BEFORE UPDATE ON public.user_payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Log the creation
INSERT INTO public.panel_logs (event_type, details)
VALUES ('payment_transactions_table_created', jsonb_build_object(
  'table', 'user_payment_transactions',
  'security', 'RLS_enabled',
  'timestamp', now()
));