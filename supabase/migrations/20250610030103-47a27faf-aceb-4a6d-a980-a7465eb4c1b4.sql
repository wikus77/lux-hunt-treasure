
-- Aggiungi la colonna preferred_language alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN preferred_language text DEFAULT 'italiano';
