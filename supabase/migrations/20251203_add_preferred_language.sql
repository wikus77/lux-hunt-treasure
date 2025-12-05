-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Aggiunge campo preferred_language alla tabella profiles
-- Default: 'it' (italiano)

-- Aggiungi colonna se non esiste
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_language') THEN
    ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'it';
  END IF;
END $$;

-- Index per query veloci
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(preferred_language);

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


