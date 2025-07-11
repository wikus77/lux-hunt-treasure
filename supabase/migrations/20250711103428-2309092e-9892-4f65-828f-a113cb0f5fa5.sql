-- Creazione tabella buzz_game_targets per sistema integrato premio/località
-- by Joseph Mulé – M1SSION™

CREATE TABLE public.buzz_game_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lon NUMERIC NOT NULL, 
  prize_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.buzz_game_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Solo admin possono gestire i targets
CREATE POLICY "Admin can manage buzz game targets" 
ON public.buzz_game_targets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- RLS Policy: Tutti possono leggere i targets attivi
CREATE POLICY "Public can view active targets" 
ON public.buzz_game_targets 
FOR SELECT 
USING (is_active = true);

-- Inserimento target di test: PORSCHE CAYENNE COUPÉ
INSERT INTO public.buzz_game_targets (
  city, 
  address, 
  lat, 
  lon, 
  prize_description, 
  is_active
) VALUES (
  'Agrigento',
  'Via Rossi 13, Agrigento',
  37.3156,
  13.5858,
  'PORSCHE CAYENNE COUPÉ',
  true
);

-- Assicurarsi che ci sia solo un target attivo alla volta
CREATE OR REPLACE FUNCTION public.ensure_single_active_target()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.buzz_game_targets 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per mantenere un solo target attivo
CREATE TRIGGER trigger_single_active_target
  BEFORE INSERT OR UPDATE ON public.buzz_game_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_active_target();