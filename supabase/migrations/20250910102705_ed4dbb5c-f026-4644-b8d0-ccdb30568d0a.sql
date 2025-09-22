-- M1SSION™ Extended Curated Sources - Add new multilingual feeds
-- DO NOT TOUCH PUSH CHAIN

-- Helper: function for safe upsert of feed sources
CREATE OR REPLACE FUNCTION public._upsert_feed_source(
  p_id text, p_locale text, p_kind text, p_url text,
  p_tags text[], p_keywords text[], p_weight int, p_enabled boolean
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.external_feed_sources (id, locale, kind, url, tags, keywords, weight, enabled)
  VALUES (p_id, p_locale, p_kind, p_url, p_tags, p_keywords, p_weight, p_enabled)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- EN Extended Sources
SELECT public._upsert_feed_source('luxurycar_en_2','en','rss','https://www.autocar.co.uk/rss', array['luxury','cars'], array['supercar','hypercar','luxury'], 1, true);
SELECT public._upsert_feed_source('luxurycar_en_3','en','rss','https://www.motor1.com/rss/news/', array['luxury','cars'], array['ferrari','porsche','mclaren'], 1, true);
SELECT public._upsert_feed_source('watch_en_1','en','rss','https://www.hodinkee.com/feed', array['luxury','watches'], array['watch','rolex','patek'], 1, true);
SELECT public._upsert_feed_source('luxury_en_2','en','rss','https://www.luxurylaunches.com/feed/', array['luxury','lifestyle'], array['luxury','yacht','jet'], 1, true);
SELECT public._upsert_feed_source('mission_en_2','en','search','https://news.google.com/rss/search?q=mission+challenge+quest', array['mission'], array['mission','challenge','quest'], 1, true);

-- FR Extended Sources
SELECT public._upsert_feed_source('luxurycar_fr_2','fr','rss','https://www.turbo.fr/rss.xml', array['luxury','cars'], array['voiture','supercar','luxe'], 1, true);
SELECT public._upsert_feed_source('luxury_fr_2','fr','rss','https://www.journalduluxe.fr/feed', array['luxury','lifestyle'], array['luxe','mode','montre'], 1, true);
SELECT public._upsert_feed_source('watch_fr_1','fr','rss','https://www.montres-de-luxe.com/xml/syndication.rss', array['luxury','watches'], array['montre','rolex','patek'], 1, true);
SELECT public._upsert_feed_source('premio_fr_2','fr','search','https://news.google.com/rss/search?q=concours+OR+tirage+au+sort+prix', array['prize'], array['concours','prix'], 1, true);
SELECT public._upsert_feed_source('mission_fr_2','fr','search','https://news.google.com/rss/search?q=mission+defi+quête', array['mission'], array['mission','défi','quête'], 1, true);

-- ES Extended Sources
SELECT public._upsert_feed_source('luxurycar_es_2','es','rss','https://www.autobild.es/rss', array['luxury','cars'], array['coche','supercoche','lujo'], 1, true);
SELECT public._upsert_feed_source('luxury_es_2','es','rss','https://www.revistavanityfair.es/rss', array['luxury','lifestyle'], array['lujo','moda','reloj'], 1, true);
SELECT public._upsert_feed_source('watch_es_1','es','rss','https://es.gcwatches.com/feed/', array['luxury','watches'], array['reloj','rolex','patek'], 1, true);
SELECT public._upsert_feed_source('premio_es_2','es','search','https://news.google.com/rss/search?q=concurso+premio+sorteo', array['prize'], array['concurso','premio'], 1, true);
SELECT public._upsert_feed_source('mission_es_2','es','search','https://news.google.com/rss/search?q=mision+desafio+busqueda', array['mission'], array['misión','desafío','búsqueda'], 1, true);

-- DE Extended Sources
SELECT public._upsert_feed_source('luxurycar_de_2','de','rss','https://www.autozeitung.de/rss', array['luxury','cars'], array['auto','supercar','luxus'], 1, true);
SELECT public._upsert_feed_source('luxury_de_2','de','rss','https://www.robbreport.de/feed/', array['luxury','lifestyle'], array['luxus','uhr','yacht'], 1, true);
SELECT public._upsert_feed_source('watch_de_1','de','rss','https://www.watchtime.net/feed/', array['luxury','watches'], array['uhr','rolex','patek'], 1, true);
SELECT public._upsert_feed_source('premio_de_2','de','search','https://news.google.com/rss/search?q=gewinnspiel+preis', array['prize'], array['gewinnspiel','preis'], 1, true);
SELECT public._upsert_feed_source('mission_de_2','de','search','https://news.google.com/rss/search?q=mission+herausforderung+suche', array['mission'], array['mission','herausforderung','suche'], 1, true);

-- NL Extended Sources
SELECT public._upsert_feed_source('luxurycar_nl_2','nl','rss','https://www.autoweek.nl/rss/nieuws.xml', array['luxury','cars'], array['auto','supercar','luxe'], 1, true);
SELECT public._upsert_feed_source('luxury_nl_2','nl','rss','https://www.quotenet.nl/feed/', array['luxury','lifestyle'], array['luxe','horloge','jacht'], 1, true);
SELECT public._upsert_feed_source('watch_nl_1','nl','rss','https://www.fratellowatches.com/feed/', array['luxury','watches'], array['horloge','rolex','patek'], 1, true);
SELECT public._upsert_feed_source('premio_nl_2','nl','search','https://news.google.com/rss/search?q=wedstrijd+prijs+winactie', array['prize'], array['wedstrijd','prijs','winactie'], 1, true);
SELECT public._upsert_feed_source('mission_nl_2','nl','search','https://news.google.com/rss/search?q=missie+uitdaging+zoektocht', array['mission'], array['missie','uitdaging','zoektocht'], 1, true);

-- Clean up helper function
DROP FUNCTION public._upsert_feed_source(text, text, text, text, text[], text[], int, boolean);