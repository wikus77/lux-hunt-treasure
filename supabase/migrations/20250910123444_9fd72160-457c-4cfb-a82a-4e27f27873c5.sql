-- Fase B - Implementazione collegamento categorie interesse → notifiche
-- NON TOCCARE PUSH CHAIN - Solo database per preferenze e mapping

-- 1) Tabella preferenze notifiche per categorie (se non esiste)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

-- 2) Trigger per updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- 3) RLS policies per notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Tabella mapping categorie UI → tag feed
CREATE TABLE IF NOT EXISTS public.category_tag_map (
  category TEXT PRIMARY KEY,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Popolamento mapping categorie standard
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

-- 6) Vista per risolvere user → tag attivi
CREATE OR REPLACE VIEW public.v_user_resolved_tags AS
SELECT
  p.user_id,
  COALESCE(array_agg(DISTINCT unnest(m.tags)) FILTER (WHERE p.enabled = true), ARRAY[]::text[]) as resolved_tags,
  MAX(p.updated_at) as last_update
FROM public.notification_preferences p
JOIN public.category_tag_map m ON m.category = p.category
GROUP BY p.user_id;

-- 7) Funzione per candidati feed basati su preferenze utente
CREATE OR REPLACE FUNCTION public.fn_candidates_for_user(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(
  feed_item_id UUID, 
  score NUMERIC, 
  title TEXT, 
  url TEXT, 
  tags TEXT[], 
  locale TEXT, 
  published_at TIMESTAMPTZ
) LANGUAGE SQL STABLE AS $$
  WITH prefs AS (
    SELECT COALESCE(resolved_tags, ARRAY[]::text[]) as tags
    FROM public.v_user_resolved_tags
    WHERE user_id = p_user_id
  ), items AS (
    SELECT 
      efi.id, 
      efi.score, 
      efi.title, 
      efi.url, 
      efi.tags, 
      efi.locale as locale, 
      efi.published_at
    FROM public.external_feed_items efi
    CROSS JOIN prefs
    WHERE (efi.tags && prefs.tags)  -- overlap con tag preferenze
      AND efi.published_at > now() - INTERVAL '72 hours'
      AND COALESCE(efi.score, 0) >= 0.72
    ORDER BY efi.published_at DESC, efi.score DESC
    LIMIT GREATEST(p_limit, 1)
  )
  SELECT id, score, title, url, tags, locale, published_at FROM items;
$$;

-- 8) Indice unique per idempotency suggested_notifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_suggested_notifications_user_item_unique
  ON public.suggested_notifications (user_id, COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- 9) Vista throttling suggerimenti (max 1/12h per utente)
CREATE OR REPLACE VIEW public.v_user_suggest_throttle AS
SELECT 
  user_id, 
  MAX(created_at) as last_sent_at,
  COUNT(*) as total_sent
FROM public.suggested_notifications
GROUP BY user_id;