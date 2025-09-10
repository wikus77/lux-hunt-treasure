-- Fix security: Enable RLS per category_tag_map
ALTER TABLE public.category_tag_map ENABLE ROW LEVEL SECURITY;

-- Policy lettura pubblica per mapping categorie (è configurazione app)
CREATE POLICY "Anyone can read category tag mappings"
  ON public.category_tag_map
  FOR SELECT
  USING (true);

-- Policy write solo admin (se esiste ruolo admin)
CREATE POLICY "Only service role can modify category mappings" 
  ON public.category_tag_map
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Funzione candidati (rimanente implementazione)
CREATE OR REPLACE FUNCTION public.fn_candidates_for_user(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(
  feed_item_id UUID, 
  score NUMERIC, 
  title TEXT, 
  url TEXT, 
  tags TEXT[], 
  locale TEXT, 
  published_at TIMESTAMPTZ
) 
LANGUAGE SQL STABLE 
SET search_path = public
AS $$
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
      efi.locale, 
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

-- Idempotency index per suggested_notifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_suggested_notifications_user_item_unique
  ON public.suggested_notifications (user_id, COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- Vista throttling
CREATE OR REPLACE VIEW public.v_user_suggest_throttle AS
SELECT 
  user_id, 
  MAX(created_at) as last_sent_at,
  COUNT(*) as total_sent
FROM public.suggested_notifications
GROUP BY user_id;