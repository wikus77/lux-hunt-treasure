-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SMART PUSH TEMPLATES - Aggiunge nuovi template al sistema esistente
-- USA IL CRON GIÀ ESISTENTE (auto-push-cron)

-- ============================================
-- 1. TABELLA TRACKING COMPORTAMENTALE (NUOVA)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tempo su pagine (secondi)
  time_on_home INTEGER DEFAULT 0,
  time_on_map INTEGER DEFAULT 0,
  time_on_buzz INTEGER DEFAULT 0,
  time_on_intelligence INTEGER DEFAULT 0,
  time_on_leaderboard INTEGER DEFAULT 0,
  
  -- Contatori
  total_buzzes INTEGER DEFAULT 0,
  total_map_views INTEGER DEFAULT 0,
  total_aion_chats INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  
  -- Pattern temporali
  favorite_hour INTEGER,
  avg_session_minutes INTEGER DEFAULT 0,
  
  -- Ultima attività
  last_buzz_at TIMESTAMPTZ,
  last_map_view_at TIMESTAMPTZ,
  last_aion_chat_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,
  
  -- Streak
  current_streak INTEGER DEFAULT 0,
  
  -- Posizione
  last_known_lat DECIMAL(10, 7),
  last_known_lng DECIMAL(10, 7),
  last_location_update TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_stats(user_id);

-- RLS
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own activity" ON user_activity_stats;
CREATE POLICY "Users read own activity" ON user_activity_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service full access activity" ON user_activity_stats;
CREATE POLICY "Service full access activity" ON user_activity_stats
  FOR ALL USING (true);

-- Funzione update activity
CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id UUID,
  p_page VARCHAR(50),
  p_seconds INTEGER DEFAULT 0,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_stats (user_id, last_session_at, total_sessions)
  VALUES (p_user_id, NOW(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    last_session_at = NOW(),
    total_sessions = user_activity_stats.total_sessions + 1,
    updated_at = NOW();

  -- Update page stats
  IF p_page = 'home' THEN
    UPDATE user_activity_stats SET time_on_home = time_on_home + p_seconds WHERE user_id = p_user_id;
  ELSIF p_page = 'map' THEN
    UPDATE user_activity_stats SET time_on_map = time_on_map + p_seconds, last_map_view_at = NOW(), total_map_views = total_map_views + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'buzz' THEN
    UPDATE user_activity_stats SET time_on_buzz = time_on_buzz + p_seconds, last_buzz_at = NOW(), total_buzzes = total_buzzes + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'intelligence' THEN
    UPDATE user_activity_stats SET time_on_intelligence = time_on_intelligence + p_seconds, last_aion_chat_at = NOW(), total_aion_chats = total_aion_chats + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'leaderboard' THEN
    UPDATE user_activity_stats SET time_on_leaderboard = time_on_leaderboard + p_seconds WHERE user_id = p_user_id;
  END IF;

  -- Update location
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    UPDATE user_activity_stats SET 
      last_known_lat = p_lat, 
      last_known_lng = p_lng, 
      last_location_update = NOW() 
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. AGGIUNGI NUOVI TEMPLATE (usa tabella esistente)
-- ============================================

-- AION BRIEFING (19:00)
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🔮 AION Daily Briefing', 'Agente {agent_code}, i Pattern Energetici rivelano nuove informazioni. L''Oracolo ti attende.', 'aion', 'all', 20, '/intelligence', 1, true)
ON CONFLICT DO NOTHING;

-- AION REVELATION (random)
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('⚡ AION ha una Rivelazione', 'Le coordinate del destino si allineano, Agente. Una verità ti attende nell''ombra.', 'aion', 'all', 5, '/intelligence', 1, true)
ON CONFLICT DO NOTHING;

-- CLASSIFICA ALERT
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🏆 Movimento in Classifica!', 'Agente {agent_code}, la classifica si agita! Controlla la tua posizione #{rank}.', 'social', 'all', 15, '/leaderboard', 1, true)
ON CONFLICT DO NOTHING;

-- NEARBY REWARD
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🎁 Reward Nelle Vicinanze!', 'Agente, un Marker Reward è stato rilevato nella tua zona! Apri la mappa!', 'gameplay', 'all', 18, '/map-3d-tiler', 2, true)
ON CONFLICT DO NOTHING;

-- MILESTONE
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🎯 Milestone Raggiunto!', 'Incredibile Agente {agent_code}! Stai scalando la missione! La vittoria si avvicina!', 'gameplay', 'all', 15, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- STREAK WARNING
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('⚠️ Streak in Pericolo!', 'Agente, non perdere il tuo streak! Fai almeno 1 azione oggi!', 'engagement', 'all', 20, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- MOTIVAZIONALE: QUASI REWARD
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🏃 Eri Così Vicino!', 'Agente, ieri sei arrivato vicinissimo a un Reward! Oggi potresti vincere!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true)
ON CONFLICT DO NOTHING;

-- MOTIVAZIONALE: PREMI TROVATI
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🎁 Premi Trovati Oggi!', 'Oggi altri agenti hanno trovato premi sulla mappa. Sarai tu il prossimo?', 'motivation', 'all', 12, '/map-3d-tiler', 1, true)
ON CONFLICT DO NOTHING;

-- MOTIVAZIONALE: TU PUOI VINCERE
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🌟 Tu Puoi Vincere!', 'Agente {agent_code}, esplora la mappa, trova indizi col BUZZ. Il premio finale sarà TUO!', 'motivation', 'all', 15, '/map-3d-tiler', 1, true)
ON CONFLICT DO NOTHING;

-- MOTIVAZIONALE: RITORNO
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('💪 Il Ritorno dell''Agente!', 'Ci sei mancato, Agente {agent_code}! La missione ti aspetta. Torna in gioco!', 'motivation', 'inactive_24h', 18, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- MOTIVAZIONALE: TOP PLAYER
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🔝 Sei tra i Migliori!', 'Agente, sei in ottima posizione! Ancora uno sforzo per la vetta!', 'motivation', 'all', 10, '/leaderboard', 1, true)
ON CONFLICT DO NOTHING;

-- MISTERIOSO: SEGNALE
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('📡 Segnale Rilevato', 'Un''anomalia energetica è stata rilevata. Le coordinate... si stanno allineando.', 'mysterious', 'all', 5, '/map-3d-tiler', 1, true)
ON CONFLICT DO NOTHING;

-- MISTERIOSO: PATTERN
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🌀 Pattern Insolito', 'I dati mostrano qualcosa di strano nella tua zona. Indaga, Agente.', 'mysterious', 'all', 5, '/map-3d-tiler', 1, true)
ON CONFLICT DO NOTHING;

-- MISTERIOSO: COUNTDOWN
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('⏳ Il Tempo Scorre', 'Qualcosa si avvicina. Il conto alla rovescia è iniziato. Sei pronto?', 'mysterious', 'all', 8, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- MISTERIOSO: SCELTO
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('✨ Sei Stato Scelto', 'Agente {agent_code}, non è un caso che tu sia qui. Il destino ha un piano.', 'mysterious', 'all', 5, '/intelligence', 1, true)
ON CONFLICT DO NOTHING;

-- MISTERIOSO: VICINO
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('🔍 Sei Più Vicino di Quanto Pensi', 'Le tue azioni recenti... interessanti. Continua su questa strada.', 'mysterious', 'all', 6, '/buzz', 1, true)
ON CONFLICT DO NOTHING;

-- WEEKLY SUMMARY
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('📊 Il Tuo Report Settimanale', 'Agente {agent_code}: settimana completata! Controlla i tuoi progressi e preparati per la prossima!', 'summary', 'all', 10, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- WELCOME BACK
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled)
VALUES 
('👋 Bentornato Agente!', 'Buongiorno {agent_code}! La missione ti aspetta. Oggi sarà il giorno giusto?', 'morning', 'all', 12, '/home', 1, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FATTO! Ora il CRON esistente userà anche questi template
-- ============================================

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




