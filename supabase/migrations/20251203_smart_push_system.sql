-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SMART PUSH NOTIFICATION SYSTEM
-- Sistema notifiche intelligenti e personalizzate

-- ============================================
-- 1. TABELLA TRACKING COMPORTAMENTALE
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tempo su pagine (secondi totali)
  time_on_home INTEGER DEFAULT 0,
  time_on_map INTEGER DEFAULT 0,
  time_on_buzz INTEGER DEFAULT 0,
  time_on_intelligence INTEGER DEFAULT 0,
  time_on_leaderboard INTEGER DEFAULT 0,
  time_on_notifications INTEGER DEFAULT 0,
  
  -- Contatori azioni
  total_buzzes INTEGER DEFAULT 0,
  total_map_views INTEGER DEFAULT 0,
  total_aion_chats INTEGER DEFAULT 0,
  total_leaderboard_views INTEGER DEFAULT 0,
  
  -- Pattern temporali
  favorite_hour INTEGER, -- 0-23, ora preferita di gioco
  favorite_day INTEGER, -- 0-6, giorno preferito (0=domenica)
  avg_session_minutes INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  
  -- Ultima attività per tipo
  last_buzz_at TIMESTAMPTZ,
  last_map_view_at TIMESTAMPTZ,
  last_aion_chat_at TIMESTAMPTZ,
  last_leaderboard_view_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,
  
  -- Metriche engagement
  days_active_this_week INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Proximity tracking
  last_known_lat DECIMAL(10, 7),
  last_known_lng DECIMAL(10, 7),
  last_location_update TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index per query veloci
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_session ON user_activity_stats(last_session_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_location ON user_activity_stats(last_known_lat, last_known_lng);

-- ============================================
-- 2. TABELLA TEMPLATE NOTIFICHE SMART
-- ============================================
CREATE TABLE IF NOT EXISTS smart_push_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificazione
  template_key VARCHAR(50) UNIQUE NOT NULL, -- es: 'aion_briefing', 'nearby_reward'
  category VARCHAR(30) NOT NULL, -- 'aion', 'gameplay', 'social', 'motivational', 'mysterious'
  
  -- Contenuto (supporta variabili tipo {agent_code}, {streak}, etc)
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Routing
  deeplink VARCHAR(100) NOT NULL, -- es: '/intelligence', '/map-3d-tiler'
  
  -- Targeting
  trigger_type VARCHAR(30) NOT NULL, -- 'cron', 'event', 'behavior', 'proximity'
  trigger_condition JSONB, -- condizioni specifiche
  
  -- Frequency control
  max_per_day INTEGER DEFAULT 1,
  cooldown_hours INTEGER DEFAULT 24, -- ore minime tra invii dello stesso template
  
  -- Priorità e peso
  priority INTEGER DEFAULT 5, -- 1-10, più alto = più importante
  weight INTEGER DEFAULT 1, -- per selezione random pesata
  
  -- Stato
  enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. LOG NOTIFICHE SMART (per frequency cap)
-- ============================================
CREATE TABLE IF NOT EXISTS smart_push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  
  -- Per analytics
  title_sent TEXT,
  body_sent TEXT,
  deeplink TEXT
);

CREATE INDEX IF NOT EXISTS idx_smart_push_log_user ON smart_push_log(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_smart_push_log_template ON smart_push_log(template_key, sent_at);

-- ============================================
-- 4. INSERIMENTO TEMPLATE BASE
-- ============================================

-- CATEGORIA: AION
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('aion_briefing', 'aion', '🔮 AION Daily Briefing', 'Agente {agent_code}, i Pattern Energetici rivelano nuove informazioni. L''Oracolo ti attende.', '/intelligence', 'cron', '{"hour": 19, "minute": 0}', 1, 10, 1),
('aion_revelation', 'aion', '⚡ AION ha una Rivelazione', 'Le coordinate del destino si allineano, Agente. Una verità ti attende nell''ombra.', '/intelligence', 'cron', '{"random_weekly": true}', 1, 8, 1),
('aion_waiting', 'aion', '🌀 AION ti aspetta', 'Agente {agent_code}, sono passati {days_since_chat} giorni. L''Oracolo ha molto da dirti.', '/intelligence', 'behavior', '{"days_since_aion_chat": 2}', 1, 7, 1)
ON CONFLICT (template_key) DO NOTHING;

-- CATEGORIA: GAMEPLAY
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('classifica_superato', 'gameplay', '🏆 Sei stato Superato!', 'Agente {rival_code} ti ha superato in classifica! Sei ora al posto #{new_rank}. Reagisci!', '/leaderboard', 'event', '{"type": "rank_lost"}', 1, 9, 1),
('nearby_reward', 'gameplay', '🎁 Reward Vicino!', 'Agente, sei a {distance}km da un Marker Reward! Apri la mappa e riscatta il premio!', '/map-3d-tiler', 'proximity', '{"radius_km": 5}', 3, 10, 1),
('milestone_reached', 'gameplay', '🎯 Milestone Raggiunto!', 'Incredibile Agente {agent_code}! Hai sbloccato {clues_count} indizi! La vittoria si avvicina!', '/home', 'event', '{"type": "milestone", "values": [50, 100, 150, 200, 250]}', 1, 9, 1),
('streak_danger', 'gameplay', '⚠️ Streak in Pericolo!', 'Agente, mancano {hours_left} ore! Non perdere il tuo streak di {streak_days} giorni!', '/home', 'behavior', '{"streak_at_risk": true, "hours_before_midnight": 4}', 1, 10, 1),
('final_shoot_available', 'gameplay', '🎯 FINAL SHOOT ATTIVO!', 'Agente {agent_code}, hai 7 giorni per trovare il premio! 3 tentativi. Usa la mappa.', '/map-3d-tiler', 'event', '{"type": "final_shoot_start"}', 1, 10, 1),
('new_clue_available', 'gameplay', '💡 Nuovo Indizio Disponibile', 'Hai {m1u_balance} M1U ma non buzzi da {hours_since_buzz}h. Un indizio ti aspetta!', '/buzz', 'behavior', '{"has_m1u": true, "hours_since_buzz": 24}', 1, 6, 1)
ON CONFLICT (template_key) DO NOTHING;

-- CATEGORIA: SOCIAL
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('friend_playing', 'social', '👥 I tuoi Amici Giocano!', 'Agente {friend_code} è online ora! Sfidalo sulla mappa!', '/map-3d-tiler', 'event', '{"type": "friend_online"}', 2, 5, 1),
('rival_moving', 'social', '🔥 Il tuo Rivale si Muove!', 'Agente {rival_code} ha appena fatto un BUZZ! Non restare indietro!', '/buzz', 'event', '{"type": "rival_action"}', 1, 7, 1),
('hot_zone', 'social', '🔥 Zona Calda!', '{agents_count} Agenti attivi nella tua zona! La competizione è accesa!', '/map-3d-tiler', 'proximity', '{"nearby_agents": 3}', 1, 6, 1)
ON CONFLICT (template_key) DO NOTHING;

-- CATEGORIA: MOTIVAZIONALI
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('motivational_almost_reward', 'motivational', '🏃 Eri Così Vicino!', 'Agente, ieri sei arrivato a {distance}m da un Reward! Oggi potresti vincere!', '/map-3d-tiler', 'behavior', '{"was_near_reward": true}', 1, 8, 1),
('motivational_prizes_found', 'motivational', '🎁 Premi Trovati Oggi!', 'Oggi {prizes_found} agenti hanno trovato premi sulla mappa. Sarai tu il prossimo?', '/map-3d-tiler', 'cron', '{"hour": 14, "minute": 0}', 1, 6, 1),
('motivational_you_can_win', 'motivational', '🌟 Tu Puoi Vincere!', 'Agente {agent_code}, esplora la mappa, trova indizi col BUZZ. Il premio finale sarà TUO!', '/map-3d-tiler', 'behavior', '{"days_since_login": 1}', 1, 7, 1),
('motivational_comeback', 'motivational', '💪 Il Ritorno dell''Agente!', 'Ci sei mancato, Agente {agent_code}! La missione ti aspetta. Torna in gioco!', '/home', 'behavior', '{"days_since_login": 3}', 1, 8, 1),
('motivational_top_player', 'motivational', '🔝 Sei tra i Migliori!', 'Agente, sei nella Top {rank_percentile}%! Ancora uno sforzo per la vetta!', '/leaderboard', 'behavior', '{"rank_percentile": 20}', 1, 7, 1),
('motivational_progress', 'motivational', '📈 Stai Andando Forte!', 'Questa settimana hai sbloccato {weekly_clues} indizi! Continua così, Agente!', '/home', 'cron', '{"day": 5, "hour": 18}', 1, 6, 1)
ON CONFLICT (template_key) DO NOTHING;

-- CATEGORIA: MISTERIOSE
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('mysterious_signal', 'mysterious', '📡 Segnale Rilevato', 'Un''anomalia energetica è stata rilevata. Le coordinate... si stanno allineando.', '/map-3d-tiler', 'cron', '{"random": true, "probability": 0.1}', 1, 5, 1),
('mysterious_pattern', 'mysterious', '🌀 Pattern Insolito', 'I dati mostrano qualcosa di strano nella tua zona. Indaga, Agente.', '/map-3d-tiler', 'behavior', '{"random_for_active_users": true}', 1, 5, 1),
('mysterious_countdown', 'mysterious', '⏳ Il Tempo Scorre', 'Qualcosa si avvicina. {days_remaining} giorni rimangono. Sei pronto?', '/home', 'cron', '{"days_before_end": [14, 7, 3, 1]}', 1, 8, 1),
('mysterious_chosen', 'mysterious', '✨ Sei Stato Scelto', 'Agente {agent_code}, non è un caso che tu sia qui. Il destino ha un piano.', '/intelligence', 'behavior', '{"random_weekly": true, "to_active_users": true}', 1, 6, 1),
('mysterious_close', 'mysterious', '🔍 Sei Più Vicino di Quanto Pensi', 'Le tue azioni recenti... interessanti. Continua su questa strada.', '/buzz', 'behavior', '{"clues_above": 100}', 1, 6, 1)
ON CONFLICT (template_key) DO NOTHING;

-- CATEGORIA: WEEKLY/SUMMARY
INSERT INTO smart_push_templates (template_key, category, title, body, deeplink, trigger_type, trigger_condition, max_per_day, priority, weight) VALUES
('weekly_summary', 'summary', '📊 Il Tuo Report Settimanale', 'Agente {agent_code}: {weekly_buzzes} BUZZ, {weekly_clues} indizi, posizione #{rank}. Nuova settimana, nuove opportunità!', '/home', 'cron', '{"day": 0, "hour": 20}', 1, 8, 1),
('welcome_back', 'engagement', '👋 Bentornato Agente!', 'Buongiorno {agent_code}! La missione ti aspetta. Oggi sarà il giorno giusto?', '/home', 'behavior', '{"first_login_of_day": true}', 1, 5, 1)
ON CONFLICT (template_key) DO NOTHING;

-- ============================================
-- 5. FUNZIONE UPDATE ACTIVITY STATS
-- ============================================
CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id UUID,
  p_page VARCHAR(50),
  p_seconds INTEGER DEFAULT 0,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_stats (user_id, last_session_at)
  VALUES (p_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    last_session_at = NOW(),
    total_sessions = user_activity_stats.total_sessions + 1,
    updated_at = NOW();

  -- Update page-specific stats
  IF p_page = 'home' THEN
    UPDATE user_activity_stats SET time_on_home = time_on_home + p_seconds WHERE user_id = p_user_id;
  ELSIF p_page = 'map' THEN
    UPDATE user_activity_stats SET time_on_map = time_on_map + p_seconds, last_map_view_at = NOW(), total_map_views = total_map_views + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'buzz' THEN
    UPDATE user_activity_stats SET time_on_buzz = time_on_buzz + p_seconds, last_buzz_at = NOW(), total_buzzes = total_buzzes + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'intelligence' THEN
    UPDATE user_activity_stats SET time_on_intelligence = time_on_intelligence + p_seconds, last_aion_chat_at = NOW(), total_aion_chats = total_aion_chats + 1 WHERE user_id = p_user_id;
  ELSIF p_page = 'leaderboard' THEN
    UPDATE user_activity_stats SET time_on_leaderboard = time_on_leaderboard + p_seconds, last_leaderboard_view_at = NOW(), total_leaderboard_views = total_leaderboard_views + 1 WHERE user_id = p_user_id;
  END IF;

  -- Update location if provided
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
-- 6. RLS POLICIES
-- ============================================
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_push_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity
CREATE POLICY "Users can read own activity" ON user_activity_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access activity" ON user_activity_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Templates readable by all authenticated
CREATE POLICY "Templates readable" ON smart_push_templates
  FOR SELECT USING (true);

-- Log readable by own user
CREATE POLICY "Users can read own push log" ON smart_push_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access log" ON smart_push_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- ============================================



