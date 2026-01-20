-- Aggiunge la colonna language alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN language TEXT DEFAULT 'en';

-- Aggiunge un commento per documentare i valori possibili
COMMENT ON COLUMN public.profiles.language IS 'Supported languages: en, it, fr, es, de, pt, zh, ar';

-- Opzionale: crea un constraint per validare i valori
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_language_check 
CHECK (language IN ('en', 'it', 'fr', 'es', 'de', 'pt', 'zh', 'ar'));