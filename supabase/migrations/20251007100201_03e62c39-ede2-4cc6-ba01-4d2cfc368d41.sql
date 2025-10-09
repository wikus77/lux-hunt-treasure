-- © 2025 Joseph MULÉ – M1SSION™ – Push Center Backend (Idempotent)
-- Garantisce tabelle auto_push_* con tipo ENUM e indici ottimizzati

-- 1. Crea ENUM per kind (idempotente)
DO $$ BEGIN
  CREATE TYPE push_kind AS ENUM ('morning','buzz','buzzmap','motivation','custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tabella auto_push_config (idempotente)
CREATE TABLE IF NOT EXISTS public.auto_push_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT false,
  daily_min INTEGER NOT NULL DEFAULT 3,
  daily_max INTEGER NOT NULL DEFAULT 5,
  quiet_start TIME NOT NULL DEFAULT '21:00',
  quiet_end TIME NOT NULL DEFAULT '08:59',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserisci row di default (solo se tabella vuota)
INSERT INTO public.auto_push_config (id, enabled)
SELECT gen_random_uuid(), false
WHERE NOT EXISTS (SELECT 1 FROM public.auto_push_config);

-- 3. Tabella auto_push_templates (idempotente con ENUM)
CREATE TABLE IF NOT EXISTS public.auto_push_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind push_kind NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/notifications',
  image_url TEXT,
  weight INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed template base (solo se vuota)
INSERT INTO public.auto_push_templates (kind, title, body, url, weight, active)
SELECT * FROM (VALUES
  ('morning'::push_kind, '☀️ Buongiorno da M1SSION!', 'Pronto a partire?', '/notifications', 1, true),
  ('buzz'::push_kind, '⚡ Ricorda il BUZZ', 'Hai già provato il BUZZ di oggi?', '/buzz', 1, true),
  ('buzzmap'::push_kind, '🗺️ Prova BUZZ MAP', 'Scopri le posizioni vicine.', '/buzz-map', 1, true),
  ('motivation'::push_kind, '🔥 Oggi si corre!', 'Completa una missione entro stasera.', '/missions', 1, true)
) AS s(kind, title, body, url, weight, active)
WHERE NOT EXISTS (SELECT 1 FROM public.auto_push_templates);

-- 4. Tabella auto_push_log (idempotente)
CREATE TABLE IF NOT EXISTS public.auto_push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_date DATE NOT NULL DEFAULT (now()::date),
  template_id UUID,
  delivery JSONB,
  CONSTRAINT fk_auto_push_log_template 
    FOREIGN KEY (template_id) REFERENCES public.auto_push_templates(id) ON DELETE SET NULL
);

-- Indice unico per idempotenza (user + date + id)
CREATE UNIQUE INDEX IF NOT EXISTS uq_auto_push_log_user_date_id
ON public.auto_push_log (user_id, sent_date, id);

-- Indice per conteggio veloce (cap enforcement)
CREATE INDEX IF NOT EXISTS idx_auto_push_log_user_date 
ON public.auto_push_log(user_id, sent_date);

-- Indice per cleanup vecchi log
CREATE INDEX IF NOT EXISTS idx_auto_push_log_sent_at 
ON public.auto_push_log(sent_at);

-- 5. RLS Policies (idempotenti)
ALTER TABLE public.auto_push_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_push_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "admin_manage_auto_push_config" ON public.auto_push_config FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admin_manage_auto_push_templates" ON public.auto_push_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "users_read_own_auto_push_log" ON public.auto_push_log FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "service_insert_auto_push_log" ON public.auto_push_log FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admin_view_auto_push_log" ON public.auto_push_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Function per updated_at (idempotente)
CREATE OR REPLACE FUNCTION public.update_auto_push_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers per updated_at (drop + create per idempotenza)
DROP TRIGGER IF EXISTS auto_push_config_updated_at ON public.auto_push_config;
CREATE TRIGGER auto_push_config_updated_at
BEFORE UPDATE ON public.auto_push_config
FOR EACH ROW EXECUTE FUNCTION public.update_auto_push_updated_at();

DROP TRIGGER IF EXISTS auto_push_templates_updated_at ON public.auto_push_templates;
CREATE TRIGGER auto_push_templates_updated_at
BEFORE UPDATE ON public.auto_push_templates
FOR EACH ROW EXECUTE FUNCTION public.update_auto_push_updated_at();