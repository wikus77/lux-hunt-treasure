-- M1SSION™ Curated Sources Alignment - Add mission_* sources + rename prize_it_1 to prize_en_2

-- Safe rename: prize_it_1 -> prize_en_2 (only if exists and target doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.external_feed_sources WHERE id = 'prize_it_1')
     AND NOT EXISTS (SELECT 1 FROM public.external_feed_sources WHERE id = 'prize_en_2')
  THEN
    UPDATE public.external_feed_sources
       SET id = 'prize_en_2', locale = 'en'
     WHERE id = 'prize_it_1';
  END IF;
END $$;

-- UPSERT mission_* sources (insert only if missing)
INSERT INTO public.external_feed_sources (id, locale, kind, url, tags, keywords, weight, enabled) VALUES
('mission_en_1', 'en', 'search', 'https://news.google.com/rss/search?q=mission+OR+challenge+OR+quest', 
 ARRAY['mission'], ARRAY['mission','challenge','quest'], 1, true),

('mission_fr_1', 'fr', 'search', 'https://news.google.com/rss/search?q=mission+OR+défi+OR+quête', 
 ARRAY['mission'], ARRAY['mission','défi','quête'], 1, true),

('mission_es_1', 'es', 'search', 'https://news.google.com/rss/search?q=misión+OR+desafío+OR+búsqueda', 
 ARRAY['mission'], ARRAY['misión','desafío','búsqueda'], 1, true),

('mission_de_1', 'de', 'search', 'https://news.google.com/rss/search?q=mission+OR+herausforderung+OR+suche', 
 ARRAY['mission'], ARRAY['mission','herausforderung','suche'], 1, true),

('mission_nl_1', 'nl', 'search', 'https://news.google.com/rss/search?q=missie+OR+uitdaging+OR+zoektocht', 
 ARRAY['mission'], ARRAY['missie','uitdaging','zoektocht'], 1, true)

ON CONFLICT (id) DO NOTHING;