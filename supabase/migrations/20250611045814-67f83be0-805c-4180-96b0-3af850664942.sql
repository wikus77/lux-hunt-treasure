
-- Create buzz_logs table for comprehensive BUZZ operation logging
CREATE TABLE IF NOT EXISTS public.buzz_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  step text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buzz_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own logs
CREATE POLICY "Users can view their own buzz logs" 
  ON public.buzz_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for inserting logs (needed for the edge function)
CREATE POLICY "Allow buzz log insertion" 
  ON public.buzz_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS buzz_logs_user_id_created_at_idx 
  ON public.buzz_logs (user_id, created_at DESC);
