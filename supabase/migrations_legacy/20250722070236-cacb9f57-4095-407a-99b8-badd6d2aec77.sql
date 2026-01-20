-- Create payment_intents table for in-app payments tracking
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'requires_payment_method',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment intents" 
ON public.payment_intents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment intents" 
ON public.payment_intents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment intents" 
ON public.payment_intents 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX idx_payment_intents_status ON public.payment_intents(status);

-- Trigger for updated_at
CREATE TRIGGER update_payment_intents_updated_at
BEFORE UPDATE ON public.payment_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();