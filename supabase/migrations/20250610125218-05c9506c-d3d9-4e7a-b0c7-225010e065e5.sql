
-- 1. AGGIORNA LOCALIZZAZIONE PREMIO PER IL TEST
-- Imposta Ventimiglia come area attiva del premio
UPDATE public.prizes 
SET 
  lat = 43.7915,
  lng = 7.6089,
  location_address = 'Corso Limone Piemonte 232, Ventimiglia (IM), Italia',
  area_radius_m = 1000,
  is_active = true
WHERE is_active = true;

-- Se non esiste un premio attivo, creane uno per Ventimiglia
INSERT INTO public.prizes (
  title,
  name,
  description,
  lat,
  lng,
  location_address,
  area_radius_m,
  is_active,
  start_date,
  end_date,
  created_at
)
SELECT 
  'Premio Test M1SSION™ Ventimiglia',
  'Test Premium Ventimiglia',
  'Premio di test localizzato a Ventimiglia per testing ufficiale',
  43.7915,
  7.6089,
  'Corso Limone Piemonte 232, Ventimiglia (IM), Italia',
  1000,
  true,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.prizes WHERE is_active = true);

-- 2. RESET COMPLETO DATI DI GIOCO PER DEVELOPER
-- Reset user_clues per developer
DELETE FROM public.user_clues 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_buzz_counter per developer  
DELETE FROM public.user_buzz_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_map_areas per developer
DELETE FROM public.user_map_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_notifications per developer
DELETE FROM public.user_notifications 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset buzz_generation_logs per developer
DELETE FROM public.buzz_generation_logs 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_buzz_map_counter per developer
DELETE FROM public.user_buzz_map_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_buzz_map per developer
DELETE FROM public.user_buzz_map 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset buzz_map_actions per developer
DELETE FROM public.buzz_map_actions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset search_areas per developer
DELETE FROM public.search_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_buzz_bonuses per developer
DELETE FROM public.user_buzz_bonuses 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset user_minigames_progress per developer
DELETE FROM public.user_minigames_progress 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- 3. AGGIORNA ABBONAMENTO BLACK E ALLOWANCE ILLIMITATA
-- Aggiorna profilo developer con data di inizio gioco = oggi
UPDATE public.profiles 
SET 
  subscription_tier = 'Black',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '1 year',
  credits = 99999,
  updated_at = NOW()
WHERE email = 'wikus77@hotmail.it';

-- Aggiorna subscription per developer
UPDATE public.subscriptions 
SET 
  tier = 'Black',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW()
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset e aggiorna weekly_buzz_allowances per developer (accesso illimitato)
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

-- 4. AGGIORNA MISSIONE ATTIVA CON DATA INIZIO = OGGI
UPDATE public.missions 
SET 
  status = 'active',
  publication_date = NOW(),
  updated_at = NOW()
WHERE status = 'active';

-- Se non esiste missione attiva, creane una per il test
INSERT INTO public.missions (
  title,
  description,
  status,
  publication_date,
  created_at,
  updated_at
)
SELECT 
  'Missione Test M1SSION™ Ventimiglia',
  'Missione di test ufficiale localizzata a Ventimiglia per testing completo',
  'active',
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE status = 'active');
