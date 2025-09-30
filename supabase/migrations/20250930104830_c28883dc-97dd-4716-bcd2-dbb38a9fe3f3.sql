-- Verifica tabelle e abilitazioni realtime Mission Control

-- 1) Verifica esistenza tabelle (no cambi distruttivi)
DO $$
BEGIN
  -- Verifica missions
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions') THEN
    RAISE NOTICE 'Tabella missions non trovata';
  END IF;
  
  -- Verifica user_mission_registrations  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mission_registrations') THEN
    RAISE NOTICE 'Tabella user_mission_registrations non trovata';
  END IF;
END $$;

-- 2) Abilita realtime se non già attivo
DO $$
BEGIN
  -- Abilita realtime su missions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions') THEN
    ALTER TABLE public.missions REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
    RAISE NOTICE 'Realtime abilitato su missions';
  END IF;
  
  -- Abilita realtime su mission_prizes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mission_prizes') THEN
    ALTER TABLE public.mission_prizes REPLICA IDENTITY FULL;  
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_prizes;
    RAISE NOTICE 'Realtime abilitato su mission_prizes';
  END IF;
  
  -- Abilita realtime su user_mission_registrations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mission_registrations') THEN
    ALTER TABLE public.user_mission_registrations REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_mission_registrations;
    RAISE NOTICE 'Realtime abilitato su user_mission_registrations';
  END IF;
EXCEPTION 
  WHEN duplicate_object THEN
    RAISE NOTICE 'Realtime già abilitato su alcune tabelle';
  WHEN OTHERS THEN
    RAISE NOTICE 'Errore: %', SQLERRM;
END $$;

-- 3) Helper per upsert categoria premio (additivo)
CREATE OR REPLACE FUNCTION public.upsert_prize_category(cat_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  cid uuid;
BEGIN
  -- Cerca categoria esistente
  SELECT id INTO cid 
  FROM public.prize_categories 
  WHERE lower(name) = lower(cat_name) 
  LIMIT 1;
  
  -- Se non esiste, creala
  IF cid IS NULL THEN
    INSERT INTO public.prize_categories(name, created_by) 
    VALUES (cat_name, auth.uid()) 
    RETURNING id INTO cid;
  END IF;
  
  RETURN cid;
END;
$$;

-- Permessi funzione
GRANT EXECUTE ON FUNCTION public.upsert_prize_category(text) TO authenticated;

-- 4) View per stato live missione (read-only)
CREATE OR REPLACE VIEW public.mission_status_v AS
SELECT
  m.*,
  (m.status = 'published' OR (m.status = 'scheduled' AND m.start_date <= now())) as is_live
FROM public.missions m;

-- Permessi view
GRANT SELECT ON public.mission_status_v TO anon, authenticated;