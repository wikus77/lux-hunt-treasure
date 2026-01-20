-- Aggiunge il campo plan alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN plan TEXT DEFAULT 'base';

-- Aggiunge un commento per documentare i valori possibili
COMMENT ON COLUMN public.profiles.plan IS 'Subscription plan: base, silver, gold, black, titanium';

-- Crea un constraint per validare i valori del piano
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('base', 'silver', 'gold', 'black', 'titanium'));