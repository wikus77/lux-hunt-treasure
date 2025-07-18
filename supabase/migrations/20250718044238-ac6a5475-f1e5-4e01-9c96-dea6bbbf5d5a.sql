-- 🎯 INSERT BUZZ GAME TARGET FOR TESTING - RESET COMPLETO 17/07/2025
-- Inserisci target BUZZ attivo con coordinate PORSCHE AGRIGENTO

-- Disabilita tutti i target esistenti
UPDATE public.buzz_game_targets SET is_active = false;

-- Inserisci nuovo target attivo
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
);