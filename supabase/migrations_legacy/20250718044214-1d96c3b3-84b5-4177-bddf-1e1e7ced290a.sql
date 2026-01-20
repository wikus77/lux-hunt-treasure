-- 🎯 INSERT BUZZ GAME TARGET FOR TESTING - RESET COMPLETO 17/07/2025
-- Inserisci target BUZZ attivo con coordinate PORSCHE AGRIGENTO

INSERT INTO public.buzz_game_targets (
  city,
  address,
  lat,
  lon,
  is_active,
  prize_description,
  created_at
) VALUES (
  'AGRIGENTO',
  'Via Atenea, 123, Agrigento AG, Italia',
  37.3156,
  13.5839,
  true,
  'PORSCHE CAYENNE COUPÉ - M1SSION™ Target Attivo - RESET COMPLETO 17/07/2025',
  NOW()
)
ON CONFLICT (city, address) DO UPDATE SET
  is_active = true,
  lat = 37.3156,
  lon = 13.5839,
  prize_description = 'PORSCHE CAYENNE COUPÉ - M1SSION™ Target Attivo - RESET COMPLETO 17/07/2025';

-- Disabilita tutti gli altri target
UPDATE public.buzz_game_targets 
SET is_active = false 
WHERE city != 'AGRIGENTO';