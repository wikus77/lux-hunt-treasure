
-- RESET TOTALE M1SSION PER TEST LANCIO 19 LUGLIO 2025
-- Eliminazione completa di TUTTI i dati di gioco per ripartire da zero

-- 1. RESET COMPLETO DATI UTENTE DEVELOPER (wikus77@hotmail.it)
DELETE FROM public.user_clues 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_buzz_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_map_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_notifications 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.buzz_generation_logs 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_buzz_map_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_buzz_map 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.buzz_map_actions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.search_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.map_points 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.live_activity_state 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- 2. RESET COMPLETO WEEKLY ALLOWANCES
DELETE FROM public.weekly_buzz_allowances 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Ricrea allowance BLACK per settimana corrente
INSERT INTO public.weekly_buzz_allowances (
  user_id,
  week_number,
  year,
  max_buzz_count,
  used_buzz_count,
  created_at
)
SELECT 
  p.id,
  EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  999, -- BLACK = illimitato
  0,   -- Inizia da 0 utilizzati
  NOW()
FROM public.profiles p 
WHERE p.email = 'wikus77@hotmail.it';

-- 3. RESET CLASSIFICA (tutti gli utenti per test pulito)
-- Nota: In produzione si gestirebbe diversamente, ma per il test di lancio azzeriamo tutto
UPDATE public.profiles 
SET credits = 0
WHERE email != 'wikus77@hotmail.it'; -- Mantieni solo developer

-- 4. IMPOSTA STATO MISSIONE ATTIVA PER LANCIO
UPDATE public.missions 
SET 
  status = 'active',
  publication_date = CURRENT_DATE,
  updated_at = NOW()
WHERE status = 'active';

-- 5. CONFIGURA PREMIO PRINCIPALE ATTIVO
UPDATE public.prizes 
SET 
  lat = 43.7915,
  lng = 7.6089,
  location_address = 'Costa del confine, area mediterranea',
  area_radius_m = 1000,
  is_active = true,
  start_date = CURRENT_DATE,
  end_date = CURRENT_DATE + INTERVAL '30 days'
WHERE is_active = true;

-- 6. RESET CONTATORI GLOBALI PER NUOVO LANCIO
UPDATE public.profiles 
SET 
  subscription_tier = 'Black',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '1 year',
  credits = 0, -- Reset crediti per test pulito
  updated_at = NOW()
WHERE email = 'wikus77@hotmail.it';
