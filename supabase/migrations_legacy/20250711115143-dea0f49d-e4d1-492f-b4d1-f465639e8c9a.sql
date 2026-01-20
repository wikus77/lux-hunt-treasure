-- by Joseph Mulé – M1SSION™ – FIX_TARGET_AGRIGENTO_110725
-- Aggiornamento target con dati Agrigento e reset contatore oggi

-- 1. Aggiorna target attivo con dati Agrigento
UPDATE buzz_game_targets 
SET 
  city = 'AGRIGENTO',
  address = 'Via Rossi 13, Agrigento', 
  prize_description = 'PORSCHE CAYENNE COUPÉ',
  lat = 37.3156,
  lon = 13.5858,
  is_active = true
WHERE is_active = true;

-- 2. Reset contatore BUZZ per oggi
UPDATE user_buzz_counter 
SET buzz_count = 0, 
    week_map_generations = '{0,0,0,0}'::integer[]
WHERE date = '2025-07-11';