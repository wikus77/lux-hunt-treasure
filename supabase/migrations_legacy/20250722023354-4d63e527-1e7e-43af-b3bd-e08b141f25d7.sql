-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Crea tabella daily_spin_logs per tracciare i giri giornalieri della ruota

CREATE TABLE public.daily_spin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- formato YYYY-MM-DD
  prize TEXT NOT NULL,
  rotation_deg INTEGER NOT NULL,
  client_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Vincolo: massimo 1 giro per giorno per utente
  CONSTRAINT unique_user_daily_spin UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_spin_logs ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
CREATE POLICY "Users can view their own daily spin logs" 
ON public.daily_spin_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily spin logs" 
ON public.daily_spin_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Indice per performance
CREATE INDEX idx_daily_spin_logs_user_date ON public.daily_spin_logs(user_id, date);

-- Funzione per verificare se l'utente ha già giocato oggi
CREATE OR REPLACE FUNCTION public.has_user_played_spin_today(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date TEXT;
BEGIN
  today_date := to_char(CURRENT_DATE, 'YYYY-MM-DD');
  
  RETURN EXISTS (
    SELECT 1 FROM public.daily_spin_logs
    WHERE user_id = p_user_id 
    AND date = today_date
  );
END;
$$;