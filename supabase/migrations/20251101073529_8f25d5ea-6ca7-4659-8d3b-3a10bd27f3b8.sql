-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SMART PUSH TEMPLATES — Schema esteso + seed 12 templates

-- 1) Drop existing table if structure changed (idempotent)
DROP TABLE IF EXISTS public.auto_push_log CASCADE;
DROP TABLE IF EXISTS public.auto_push_templates CASCADE;

-- 2) Create smart templates table
CREATE TABLE public.auto_push_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  weight int NOT NULL DEFAULT 10,
  -- targeting
  segment text DEFAULT 'all',
  condition_sql text,
  -- frequency cap
  freq_cap_user_per_day int NOT NULL DEFAULT 1,
  quiet_hours_start time DEFAULT '21:00',
  quiet_hours_end time DEFAULT '08:59',
  -- A/B testing
  ab_key text,
  ab_variant text,
  -- deep link / payload
  deeplink text DEFAULT '/buzz',
  data_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3) Create push log table
CREATE TABLE public.auto_push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.auto_push_templates(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  sent_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'queued',
  details jsonb DEFAULT '{}'::jsonb
);

-- 4) Indexes
CREATE INDEX idx_auto_push_log_user_date ON public.auto_push_log(user_id, sent_date);
CREATE INDEX idx_auto_push_log_template ON public.auto_push_log(template_id);
CREATE INDEX idx_auto_push_templates_enabled ON public.auto_push_templates(enabled, type);

-- 5) RLS policies
ALTER TABLE public.auto_push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_push_log ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY admin_manage_templates ON public.auto_push_templates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role can write logs
CREATE POLICY service_write_logs ON public.auto_push_log
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Users can view their own logs
CREATE POLICY users_view_own_logs ON public.auto_push_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all logs
CREATE POLICY admin_view_logs ON public.auto_push_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 6) Seed 12 smart templates (ITA)
INSERT INTO public.auto_push_templates (title, body, type, segment, weight, ab_key, ab_variant, deeplink, data_json, freq_cap_user_per_day)
VALUES
-- 1) Daily check-in (PE)
('⚡️ Check-in giornaliero', 
 'Agente {agent_name}, esegui il check-in ora: PE gratuiti e streak attiva. Rank attuale {rank}.', 
 'daily','all',15,'daily-checkin-v1','A','/profile', '{"cta":"Apri Profilo → Check-in"}'::jsonb, 1),

-- 2) Re-engage 24h senza Buzz
('Torni in azione?', 
 'Mancano i tuoi segnali Buzz da {last_buzz_hours} ore. Un indizio ti aspetta vicino a te.', 
 'reengage','inactive_24h',20,'reengage-24h','A','/buzz', '{"cta":"Invia un BUZZ"}'::jsonb, 1),

-- 3) Challenge: sfida un agente
('Sfida tra agenti', 
 'Scegli un avversario e conquista il vantaggio: la tua {rank} merita il podio. Accetti la sfida?', 
 'challenge','active_24h',10,'challenge-v1','A','/intel', '{"cta":"Lancia una sfida"}'::jsonb, 1),

-- 4) Leaderboard push (hai perso posizione)
('Hai perso terreno in classifica', 
 'Un agente ti ha superato. Sei ora {leaderboard_rank}°: reagisci con un BUZZ mirato.', 
 'leaderboard','lost_rank',12,'lb-loss','A','/winners', '{"cta":"Guarda classifica"}'::jsonb, 1),

-- 5) Leaderboard push (stai salendo)
('Stai salendo! Continua così', 
 'Sei entrato nella Top 10. Mantieni il ritmo: altri {clues_count} indizi e punti al podio.', 
 'leaderboard','top10',8,'lb-top10','A','/winners', '{"cta":"Spingi ora"}'::jsonb, 1),

-- 6) Evento vicino (portale/geozona)
('Segnale vicino a te', 
 'C''è attività su una zona vicina. Apri la mappa: potresti trovare un portale attivo.', 
 'event','near_portal',12,'portal-nearby','A','/map', '{"cta":"Apri Mappa"}'::jsonb, 1),

-- 7) Buzz economico (pricing basso del giorno)
('Oggi conviene BUZZare', 
 'Il costo dinamico è favorevole: ottieni più indizi a parità di crediti.', 
 'buzz','all',7,'buzz-cheap','A','/buzz', '{"cta":"Fai un BUZZ ora"}'::jsonb, 1),

-- 8) Premio/missione personale
('Missione personale aggiornata', 
 'Stai a {missions_count} missioni e {clues_count} indizi. Nuovo hint disponibile.', 
 'intel','active_24h',9,'personal-mission','A','/intel', '{"cta":"Apri Intelligence"}'::jsonb, 1),

-- 9) Referral nudge
('Invita un alleato, guadagna PE', 
 'Condividi il tuo codice {agent_code}: ottieni PE extra quando si registrano.', 
 'system','all',6,'referral-nudge','A','/profile', '{"cta":"Copia codice referral"}'::jsonb, 1),

-- 10) Credits low
('Crediti bassi', 
 'Ti restano {credits} crediti: ricarica per non interrompere la corsa.', 
 'system','all',5,'credits-low','A','/subscriptions', '{"cta":"Ricarica crediti"}'::jsonb, 1),

-- 11) Free → Upgrade suggerito
('Sblocca più potenza', 
 'Il tuo piano {subscription_tier} limita i vantaggi. Passa ora e ottieni PE boost.', 
 'system','free_tier',5,'upsell-v1','A','/subscriptions', '{"cta":"Vedi piani"}'::jsonb, 1),

-- 12) Re-engage 7 giorni
('Ricomincia da qui', 
 'È da un po'' che non ti si vede. Il mondo M1SSION si è mosso senza di te: torna in partita.', 
 'reengage','inactive_7d',25,'reengage-7d','A','/home', '{"cta":"Rientra in M1SSION"}'::jsonb, 1);

-- 7) Comment for documentation
COMMENT ON TABLE public.auto_push_templates IS 
'Smart templates con segmenti, condizioni, freq-cap, A/B e deeplink. Variabili disponibili: {agent_name},{agent_code},{rank},{pe_total},{missions_count},{clues_count},{last_buzz_hours},{leaderboard_rank},{credits},{subscription_tier},{city},{nearby_portals}';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™