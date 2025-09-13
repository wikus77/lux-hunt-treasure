-- Aggiunge colonna is_admin alla tabella profiles esistente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Imposta admin per l'utente
UPDATE public.profiles 
SET is_admin = true 
WHERE id = '495246c1-9154-4f01-a428-7f37fe230180'::uuid;