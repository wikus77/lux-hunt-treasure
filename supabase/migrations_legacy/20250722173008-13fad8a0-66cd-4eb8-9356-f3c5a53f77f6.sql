-- Fix INSERT policy for user_payment_methods to include WITH CHECK constraint
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.user_payment_methods;

CREATE POLICY "Users can insert their own payment methods" 
ON public.user_payment_methods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also ensure RLS is enabled
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;