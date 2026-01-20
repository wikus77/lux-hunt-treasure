-- © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
-- Aggiungi colonna referral_code alla tabella profiles
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;

-- Aggiorna i referral_code esistenti nel formato CODE AG-XXXX
UPDATE public.profiles 
SET referral_code = 'CODE AG-' || CASE 
  WHEN agent_code IS NOT NULL THEN REPLACE(agent_code, 'AG-', '')
  ELSE LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
END
WHERE referral_code IS NULL;

-- Crea funzione per generare codici referral univoci
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera codice nel formato CODE AG-XXXX
    new_code := 'CODE AG-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verifica se il codice esiste già
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = new_code
    ) INTO code_exists;
    
    -- Se non esiste, lo restituisce
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per generare automaticamente referral_code se mancante
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_referral_code_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_referral_code();