-- Correggi politiche RLS per daily_spin_logs
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own daily spin logs" ON public.daily_spin_logs;
DROP POLICY IF EXISTS "Users can view their own daily spin logs" ON public.daily_spin_logs;

-- Create correct RLS policies for daily_spin_logs
CREATE POLICY "Users can insert their own daily spin logs" 
ON public.daily_spin_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily spin logs" 
ON public.daily_spin_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.daily_spin_logs ENABLE ROW LEVEL SECURITY;