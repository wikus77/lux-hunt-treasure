
-- 1. UPGRADE ABBONAMENTO: Set BLACK subscription for developer
-- First, delete existing subscription if any
DELETE FROM public.subscriptions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Insert new BLACK subscription
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
  'developer',
  NOW(),
  NOW()
FROM public.profiles p 
WHERE p.email = 'wikus77@hotmail.it';

-- Update profile subscription tier
UPDATE public.profiles 
SET 
  subscription_tier = 'Black',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '1 year',
  updated_at = NOW()
WHERE email = 'wikus77@hotmail.it';

-- Create weekly buzz allowance with unlimited access for Black tier
DELETE FROM public.weekly_buzz_allowances 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

INSERT INTO public.weekly_buzz_allowances (
  user_id,
  week_number,
  year,
  max_buzz_count,
  used_buzz_count
)
SELECT 
  p.id,
  EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  999,
  0
FROM public.profiles p 
WHERE p.email = 'wikus77@hotmail.it';

-- 2. AZZERAMENTO COMPLETO DEI DATI DI GIOCO
-- Delete all user buzz logs
DELETE FROM public.user_buzz_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete all map areas
DELETE FROM public.user_map_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete all user clues
DELETE FROM public.user_clues 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete map counter data
DELETE FROM public.user_buzz_map_counter 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete buzz map data
DELETE FROM public.user_buzz_map 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete map actions
DELETE FROM public.buzz_map_actions 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete search areas
DELETE FROM public.search_areas 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete user notifications (buzz-related)
DELETE FROM public.user_notifications 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it')
AND type IN ('buzz', 'buzz_map', 'clue');

-- Delete buzz bonuses
DELETE FROM public.user_buzz_bonuses 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Delete minigames progress
DELETE FROM public.user_minigames_progress 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');

-- Reset buzz generation logs
DELETE FROM public.buzz_generation_logs 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'wikus77@hotmail.it');
