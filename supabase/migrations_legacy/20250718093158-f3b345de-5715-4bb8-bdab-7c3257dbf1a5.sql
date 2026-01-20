-- Creazione tabella user_mission_status per gestione stato missione M1SSION™
CREATE TABLE IF NOT EXISTS public.user_mission_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clues_found INTEGER DEFAULT 0,
  total_clues INTEGER DEFAULT 200,
  mission_progress_percent REAL DEFAULT 0,
  mission_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mission_days_total INTEGER DEFAULT 30,
  mission_days_remaining INTEGER DEFAULT 30,
  mission_status TEXT DEFAULT 'ATTIVA',
  prize_city TEXT,
  prize_street TEXT,
  prize_coordinates JSONB,
  prize_name TEXT,
  buzz_counter INTEGER DEFAULT 0,
  map_radius_km REAL DEFAULT NULL,
  map_area_generated BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_mission_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mission status" 
ON public.user_mission_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission status" 
ON public.user_mission_status 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission status" 
ON public.user_mission_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all mission status" 
ON public.user_mission_status 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Creazione funzione reset_user_mission per azzeramento completo missione
CREATE OR REPLACE FUNCTION public.reset_user_mission(user_id_input UUID)
RETURNS void AS $$
BEGIN
  -- Inserisci o aggiorna lo stato della missione per l'utente
  INSERT INTO public.user_mission_status (
    user_id,
    clues_found,
    mission_progress_percent,
    mission_started_at,
    mission_days_remaining,
    buzz_counter,
    map_radius_km,
    map_area_generated,
    updated_at
  ) VALUES (
    user_id_input,
    0,
    0,
    NOW(),
    30,
    0,
    NULL,
    FALSE,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    clues_found = 0,
    mission_progress_percent = 0,
    mission_started_at = NOW(),
    mission_days_remaining = 30,
    buzz_counter = 0,
    map_radius_km = NULL,
    map_area_generated = FALSE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION public.update_user_mission_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mission_status_updated_at
BEFORE UPDATE ON public.user_mission_status
FOR EACH ROW
EXECUTE FUNCTION public.update_user_mission_status_updated_at();