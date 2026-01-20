-- 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
-- M1SSION™ GAME RESET - SIMULAZIONE LANCIO 17/07/2025

-- Reset user clues (mantenendo la struttura)
TRUNCATE user_clues RESTART IDENTITY CASCADE;

-- Reset buzz counters 
TRUNCATE user_buzz_counter RESTART IDENTITY CASCADE;

-- Reset buzz map data
TRUNCATE user_buzz_map RESTART IDENTITY CASCADE;
TRUNCATE user_buzz_map_counter RESTART IDENTITY CASCADE;

-- Reset map click events (tracking analytics)
TRUNCATE map_click_events RESTART IDENTITY CASCADE;

-- Reset search areas
TRUNCATE search_areas RESTART IDENTITY CASCADE;

-- Reset user notifications per nuovo gioco
TRUNCATE user_notifications RESTART IDENTITY CASCADE;

-- Aggiorna la data di inizio missione a oggi
UPDATE missions 
SET publication_date = '2025-07-17 00:00:00+00',
    updated_at = NOW()
WHERE status = 'active';

-- Reset prize to simulate new game start
UPDATE prizes 
SET start_date = '2025-07-17',
    end_date = '2025-08-16',  -- 30 giorni
    is_active = true,
    updated_at = NOW();

-- Inserisci messaggio di benvenuto per il nuovo gioco
INSERT INTO app_messages (title, content, message_type, is_active, target_users, created_at)
VALUES (
  '🎯 M1SSION™ È INIZIATA!',
  '🔥 Benvenuto nella missione più esclusiva d''Italia! 30 giorni per trovare il premio da 100.000€. Usa il tasto BUZZ per rivelare indizi esclusivi sulla posizione del tesoro. Che la caccia abbia inizio! 🏆',
  'announcement',
  true,
  ARRAY['all'],
  NOW()
);

-- Log del reset sistema
INSERT INTO admin_logs (event_type, context, timestamp, note)
VALUES (
  'GAME_RESET',
  'Sistema azzerato per simulazione lancio M1SSION™',
  NOW(),
  'Reset completo dati gioco - Launch Simulation 17/07/2025'
);