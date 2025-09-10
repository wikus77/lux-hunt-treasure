-- Fix per vista user_resolved_tags e completamento infrastruttura
-- NON TOCCARE PUSH CHAIN

-- 1) Tabella preferenze notifiche (idempotente)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

-- 2) RLS per notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3) Trigger updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- 4) Mapping categorie→tag (idempotente)
CREATE TABLE IF NOT EXISTS public.category_tag_map (
  category TEXT PRIMARY KEY,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.category_tag_map (category, tags) VALUES
  ('Luxury & moda', ARRAY['luxury','fashion','watch','luxurycar']),
  ('Viaggi & esperienze', ARRAY['travel','experience']),
  ('Sport & fitness', ARRAY['sport']),
  ('Tecnologia', ARRAY['tech']),
  ('Food & beverage', ARRAY['food','beverage']),
  ('Arte & cultura', ARRAY['art','culture','design'])
ON CONFLICT (category) DO UPDATE SET 
  tags = EXCLUDED.tags,
  updated_at = now();

-- 5) FIXED: Vista user_resolved_tags (corretto unnest)
DROP VIEW IF EXISTS public.v_user_resolved_tags CASCADE;
CREATE VIEW public.v_user_resolved_tags AS
WITH expanded_tags AS (
  SELECT 
    p.user_id,
    unnest(m.tags) as tag,
    p.enabled
  FROM public.notification_preferences p
  JOIN public.category_tag_map m ON m.category = p.category
)
SELECT
  user_id,
  COALESCE(array_agg(DISTINCT tag) FILTER (WHERE enabled = true), ARRAY[]::text[]) as resolved_tags,
  COUNT(*) FILTER (WHERE enabled = true) as active_categories
FROM expanded_tags
GROUP BY user_id;