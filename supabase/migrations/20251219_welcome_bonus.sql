-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Welcome Bonus System: Aggiunge colonna per tracciare bonus 500 M1U alla prima registrazione

-- 1. Aggiunge colonna welcome_bonus_claimed alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT false;

-- 2. Aggiunge commento per documentazione
COMMENT ON COLUMN public.profiles.welcome_bonus_claimed IS 'Tracks if user has claimed the 500 M1U welcome bonus';

-- 3. Index per query veloci (opzionale ma utile)
CREATE INDEX IF NOT EXISTS idx_profiles_welcome_bonus ON public.profiles (welcome_bonus_claimed) WHERE welcome_bonus_claimed = false;

-- 4. Verifica
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'welcome_bonus_claimed';


