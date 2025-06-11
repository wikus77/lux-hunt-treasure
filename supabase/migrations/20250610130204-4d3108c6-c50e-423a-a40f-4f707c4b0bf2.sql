
-- RESET CHIRURGICO COMPLETO PER DEVELOPER wikus77@hotmail.it
-- Eliminazione totale di TUTTI i dati di gioco per ripartire da zero

-- 1. ELIMINAZIONE COMPLETA DATI UTENTE DEVELOPER
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

DELETE FROM public.user_buzz_bonuses 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.user_minigames_progress 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.map_points 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.payment_transactions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

DELETE FROM public.live_activity_state 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- 2. FORZA ABBONAMENTO BLACK ATTIVO
-- Elimina subscription esistente e ricrea
DELETE FROM public.subscriptions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

INSERT INTO public.subscriptions (
  user_id,
  tier,
  status,
  start_date,
  end_date,
  provider,
  created_at,
  updated_at
) 
SELECT 
  p.id,
  'Black',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  'stripe',
  NOW(),
  NOW()
FROM public.profiles p 
WHERE p.email = 'wikus77@hotmail.it';

-- 3. AGGIORNA PROFILO CON ABBONAMENTO BLACK COMPLETO
UPDATE public.profiles 
SET 
  subscription_tier = 'Black',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '1 year',
  credits = 99999,
  updated_at = NOW()
WHERE email = 'wikus77@hotmail.it';

-- 4. RESET E CREAZIONE ALLOWANCE ILLIMITATA BLACK
DELETE FROM public.weekly_buzz_allowances 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

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
  999,
  0,
  NOW()
FROM public.profiles p 
WHERE p.email = 'wikus77@hotmail.it';

-- 5. CONFIGURA MISSIONE ATTIVA DA OGGI
UPDATE public.missions 
SET 
  status = 'active',
  publication_date = NOW(),
  updated_at = NOW()
WHERE status = 'active';

-- 6. IMPOSTA PREMIO VENTIMIGLIA ATTIVO
UPDATE public.prizes 
SET 
  lat = 43.7915,
  lng = 7.6089,
  location_address = 'Corso Limone Piemonte 232, Ventimiglia (IM), Italia',
  area_radius_m = 1000,
  is_active = true
WHERE is_active = true;
