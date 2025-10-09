-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Auto Push Automation Tables (ADDITIVE - NON TOCCA NULLA DI ESISTENTE)

-- Configurazione globale automazione push
CREATE TABLE IF NOT EXISTS public.auto_push_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT true,
  daily_min INTEGER NOT NULL DEFAULT 3,
  daily_max INTEGER NOT NULL DEFAULT 5,
  quiet_start TIME NOT NULL DEFAULT '21:00',
  quiet_end TIME NOT NULL DEFAULT '08:59',
  timezone TEXT NOT NULL DEFAULT 'Europe/Rome',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template messaggi automatici
CREATE TABLE IF NOT EXISTS public.auto_push_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('morning', 'buzz', 'buzzmap', 'motivation')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/notifications',
  image_url TEXT,
  weight INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Log invii automatici (con cap giornaliero per utente)
CREATE TABLE IF NOT EXISTS public.auto_push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  template_id UUID REFERENCES public.auto_push_templates(id),
  delivery JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice per conteggio giornaliero veloce (usando colonna denormalizzata)
CREATE INDEX IF NOT EXISTS idx_auto_push_log_user_date 
ON public.auto_push_log(user_id, sent_date);

-- Indice per cleanup vecchi log
CREATE INDEX IF NOT EXISTS idx_auto_push_log_sent_at 
ON public.auto_push_log(sent_at);

-- RLS: solo admin possono gestire config e template
ALTER TABLE public.auto_push_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_push_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage auto push config"
ON public.auto_push_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin can manage auto push templates"
ON public.auto_push_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin can view auto push logs"
ON public.auto_push_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can insert auto push logs"
ON public.auto_push_log FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Inserisci configurazione di default (DISABILITATA)
INSERT INTO public.auto_push_config (enabled, daily_min, daily_max, quiet_start, quiet_end)
VALUES (false, 3, 5, '21:00', '08:59')
ON CONFLICT DO NOTHING;

-- Template di default
INSERT INTO public.auto_push_templates (kind, title, body, url, weight, active) VALUES
('morning', '☀️ Buongiorno da M1SSION!', 'Inizia la giornata con energia! Scopri nuovi indizi oggi.', '/home', 2, true),
('buzz', '⚡ Non dimenticare il BUZZ', 'Hai già fatto il tuo BUZZ oggi? Scopri nuove aree sulla mappa!', '/buzz', 3, true),
('buzzmap', '🗺️ Esplora con BUZZ MAP', 'Sblocca indizi premium con BUZZ MAP. La verità è più vicina!', '/map', 3, true),
('motivation', '🔥 Agente, è il momento di agire!', 'Ogni minuto conta. Continua la tua missione!', '/notifications', 2, true)
ON CONFLICT DO NOTHING;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.update_auto_push_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_push_config_updated_at
BEFORE UPDATE ON public.auto_push_config
FOR EACH ROW EXECUTE FUNCTION public.update_auto_push_updated_at();

CREATE TRIGGER auto_push_templates_updated_at
BEFORE UPDATE ON public.auto_push_templates
FOR EACH ROW EXECUTE FUNCTION public.update_auto_push_updated_at();