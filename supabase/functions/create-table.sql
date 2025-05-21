
-- SQL per creare la tabella e le funzioni di supporto da eseguire manualmente
-- se tutto il resto fallisce

-- Funzione per verificare se una tabella esiste
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  does_exist BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  ) INTO does_exist;
  
  RETURN does_exist;
END;
$$;

-- Funzione per eseguire comandi SQL con privilegi di amministratore
CREATE OR REPLACE FUNCTION public.execute_admin_command(command TEXT) 
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE command;
END;
$$;

-- Concedi i permessi di esecuzione agli utenti autenticati
GRANT EXECUTE ON FUNCTION public.check_table_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_admin_command(TEXT) TO authenticated;

-- Crea la tabella prize_clues
CREATE TABLE IF NOT EXISTS public.prize_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID REFERENCES public.prizes(id) NOT NULL,
  week INTEGER NOT NULL,
  clue_type TEXT NOT NULL DEFAULT 'regular',
  title_it TEXT NOT NULL,
  title_en TEXT,
  title_fr TEXT,
  description_it TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Abilita la sicurezza a livello di riga
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

-- Crea la policy per gli admin
CREATE POLICY IF NOT EXISTS "Admin users can manage prize clues"
  ON public.prize_clues
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
