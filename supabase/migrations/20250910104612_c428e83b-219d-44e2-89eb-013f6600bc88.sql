-- M1SSION™ Premium Curated Sources Migration (Fixed Weights)
-- DO NOT TOUCH PUSH CHAIN - Add premium sources with valid weight constraints

begin;

-- 1) Helper function for safe upsert of premium sources
create or replace function public._upsert_premium_feed_source(
  p_id text, p_locale text, p_kind text, p_url text,
  p_tags text[], p_keywords text[], p_weight integer, p_enabled boolean
) returns void language plpgsql as $$
begin
  insert into public.external_feed_sources (id, locale, kind, url, tags, keywords, weight, enabled)
  values (p_id, p_locale, p_kind, p_url, p_tags, p_keywords, p_weight, p_enabled)
  on conflict (id) do update
  set locale = excluded.locale,
      kind   = excluded.kind,
      url    = excluded.url,
      tags   = excluded.tags,
      keywords = excluded.keywords,
      weight  = excluded.weight,
      enabled = excluded.enabled,
      updated_at = now();
end $$;

-- 2) Add useful indices for performance
create index if not exists idx_external_feed_items_locale_score on public.external_feed_items (locale, score desc);
create index if not exists idx_external_feed_items_published_at on public.external_feed_items (published_at desc);
create index if not exists idx_external_feed_sources_locale_weight on public.external_feed_sources (locale, weight desc);

-- 3) Add premium sources with valid weights (max 2 as per constraint)
-- EN Premium sources
select public._upsert_premium_feed_source('luxurycar_en_p1','en','rss','https://www.carmagazine.co.uk/feed/', array['auto','luxury','premium'], array['hypercar','supercar','ferrari','bugatti','mclaren','koenigsegg','pagani'], 2, true);
select public._upsert_premium_feed_source('luxurycar_en_p2','en','rss','https://www.dupontregistry.com/autos/rss', array['auto','luxury','premium'], array['luxury car','exotic car','lamborghini','aston martin','rolls royce'], 2, true);
select public._upsert_premium_feed_source('luxurycar_en_p3','en','search','https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+koenigsegg+limited+edition&hl=en', array['auto','luxury','limited'], array['limited edition','one-off','bespoke','hypercar'], 2, true);

select public._upsert_premium_feed_source('watch_en_p1','en','rss','https://www.worldwatchreport.com/feed/', array['watches','luxury','premium'], array['tourbillon','minute repeater','perpetual calendar','patek philippe','vacheron constantin'], 2, true);
select public._upsert_premium_feed_source('watch_en_p2','en','search','https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"audemars+piguet"&hl=en', array['watches','luxury','haute'], array['haute horlogerie','grand complication','swiss made'], 2, true);

select public._upsert_premium_feed_source('luxury_en_p1','en','rss','https://www.superyachttimes.com/rss', array['luxury','lifestyle','yacht'], array['superyacht','megayacht','private jet','gulfstream','bombardier'], 2, true);
select public._upsert_premium_feed_source('luxury_en_p2','en','search','https://news.google.com/rss/search?q=private+jet+OR+superyacht+OR+luxury+villa+OR+bespoke&hl=en', array['luxury','lifestyle','bespoke'], array['bespoke','custom made','luxury villa','private island'], 2, true);

select public._upsert_premium_feed_source('prize_en_p1','en','search','https://news.google.com/rss/search?q=luxury+contest+OR+premium+giveaway+OR+exclusive+prize&hl=en', array['prize','luxury','exclusive'], array['luxury contest','exclusive prize','premium giveaway','high value'], 1, true);
select public._upsert_premium_feed_source('mission_en_p1','en','search','https://news.google.com/rss/search?q=brand+mission+OR+luxury+challenge+OR+exclusive+quest&hl=en', array['mission','luxury','brand'], array['brand mission','luxury challenge','exclusive quest','vip access'], 1, true);

-- FR Premium sources
select public._upsert_premium_feed_source('luxurycar_fr_p1','fr','rss','https://www.automobile-magazine.fr/rss', array['auto','luxe','premium'], array['hypercar','supercar','ferrari','bugatti','mclaren','voiture de luxe'], 2, true);
select public._upsert_premium_feed_source('luxurycar_fr_p2','fr','search','https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+ferrari+édition+limitée&hl=fr', array['auto','luxe','limité'], array['édition limitée','sur mesure','hypercar'], 2, true);
select public._upsert_premium_feed_source('watch_fr_p1','fr','search','https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"vacheron+constantin"&hl=fr', array['montres','luxe','haute'], array['haute horlogerie','grande complication','manufacture suisse'], 2, true);
select public._upsert_premium_feed_source('luxury_fr_p1','fr','search','https://news.google.com/rss/search?q=superyacht+OR+jet+privé+OR+villa+de+luxe+OR+sur+mesure&hl=fr', array['luxe','lifestyle','yacht'], array['superyacht','jet privé','villa de luxe','sur mesure'], 2, true);
select public._upsert_premium_feed_source('prize_fr_p1','fr','search','https://news.google.com/rss/search?q=concours+de+luxe+OR+prix+exclusif+OR+tirage+premium&hl=fr', array['prix','luxe','exclusif'], array['concours de luxe','prix exclusif','tirage premium'], 1, true);
select public._upsert_premium_feed_source('mission_fr_p1','fr','search','https://news.google.com/rss/search?q=mission+de+marque+OR+défi+de+luxe+OR+quête+exclusive&hl=fr', array['mission','luxe','marque'], array['mission de marque','défi de luxe','quête exclusive'], 1, true);

-- ES Premium sources
select public._upsert_premium_feed_source('luxurycar_es_p1','es','search','https://news.google.com/rss/search?q=hypercar+OR+superdeportivo+OR+bugatti+OR+ferrari+edición+limitada&hl=es', array['auto','lujo','premium'], array['hypercar','superdeportivo','edición limitada','coche de lujo'], 2, true);
select public._upsert_premium_feed_source('watch_es_p1','es','search','https://news.google.com/rss/search?q=alta+relojería+OR+tourbillon+OR+"patek+philippe"+OR+"audemars+piguet"&hl=es', array['relojes','lujo','alta'], array['alta relojería','gran complicación','manufactura suiza'], 2, true);
select public._upsert_premium_feed_source('luxury_es_p1','es','search','https://news.google.com/rss/search?q=superyate+OR+jet+privado+OR+villa+de+lujo+OR+a+medida&hl=es', array['lujo','estilo','yate'], array['superyate','jet privado','villa de lujo','a medida'], 2, true);
select public._upsert_premium_feed_source('prize_es_p1','es','search','https://news.google.com/rss/search?q=concurso+de+lujo+OR+premio+exclusivo+OR+sorteo+premium&hl=es', array['premio','lujo','exclusivo'], array['concurso de lujo','premio exclusivo','sorteo premium'], 1, true);
select public._upsert_premium_feed_source('mission_es_p1','es','search','https://news.google.com/rss/search?q=misión+de+marca+OR+desafío+de+lujo+OR+búsqueda+exclusiva&hl=es', array['misión','lujo','marca'], array['misión de marca','desafío de lujo','búsqueda exclusiva'], 1, true);

-- DE Premium sources
select public._upsert_premium_feed_source('luxurycar_de_p1','de','search','https://news.google.com/rss/search?q=hypercar+OR+supersportwagen+OR+bugatti+OR+ferrari+limitierte+auflage&hl=de', array['auto','luxus','premium'], array['hypercar','supersportwagen','limitierte auflage','luxusauto'], 2, true);
select public._upsert_premium_feed_source('watch_de_p1','de','search','https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"a+lange"&hl=de', array['uhren','luxus','haute'], array['haute horlogerie','große komplikation','schweizer manufaktur'], 2, true);
select public._upsert_premium_feed_source('luxury_de_p1','de','search','https://news.google.com/rss/search?q=superyacht+OR+privatjet+OR+luxusvilla+OR+maßgeschneidert&hl=de', array['luxus','lifestyle','yacht'], array['superyacht','privatjet','luxusvilla','maßgeschneidert'], 2, true);
select public._upsert_premium_feed_source('prize_de_p1','de','search','https://news.google.com/rss/search?q=luxus+gewinnspiel+OR+exklusiver+preis+OR+premium+verlosung&hl=de', array['preis','luxus','exklusiv'], array['luxus gewinnspiel','exklusiver preis','premium verlosung'], 1, true);
select public._upsert_premium_feed_source('mission_de_p1','de','search','https://news.google.com/rss/search?q=marken+mission+OR+luxus+herausforderung+OR+exklusive+suche&hl=de', array['mission','luxus','marke'], array['marken mission','luxus herausforderung','exklusive suche'], 1, true);

-- NL Premium sources
select public._upsert_premium_feed_source('luxurycar_nl_p1','nl','search','https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+ferrari+gelimiteerde+editie&hl=nl', array['auto','luxe','premium'], array['hypercar','supercar','gelimiteerde editie','luxeauto'], 2, true);
select public._upsert_premium_feed_source('watch_nl_p1','nl','search','https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+zwitsers+uurwerk&hl=nl', array['horloges','luxe','haute'], array['haute horlogerie','grote complicatie','zwitserse manufactuur'], 2, true);
select public._upsert_premium_feed_source('luxury_nl_p1','nl','search','https://news.google.com/rss/search?q=superjacht+OR+privéjet+OR+luxevilla+OR+op+maat&hl=nl', array['luxe','lifestyle','jacht'], array['superjacht','privéjet','luxevilla','op maat'], 2, true);
select public._upsert_premium_feed_source('prize_nl_p1','nl','search','https://news.google.com/rss/search?q=luxe+wedstrijd+OR+exclusieve+prijs+OR+premium+winactie&hl=nl', array['prijs','luxe','exclusief'], array['luxe wedstrijd','exclusieve prijs','premium winactie'], 1, true);
select public._upsert_premium_feed_source('mission_nl_p1','nl','search','https://news.google.com/rss/search?q=merk+missie+OR+luxe+uitdaging+OR+exclusieve+zoektocht&hl=nl', array['missie','luxe','merk'], array['merk missie','luxe uitdaging','exclusieve zoektocht'], 1, true);

-- 4) Enhanced deduplication function
create or replace function public.normalize_feed_url(input_url text)
returns text
language plpgsql
as $$
begin
  -- Basic URL normalization for deduplication
  return lower(
    regexp_replace(
      regexp_replace(input_url, '[?&](utm_[^&]*|fbclid=[^&]*|gclid=[^&]*)', '', 'g'),
      '#.*$', ''
    )
  );
end $$;

-- 5) Add scoring metadata table for tracking
create table if not exists public.feed_scoring_stats (
  id uuid default gen_random_uuid() primary key,
  run_timestamp timestamptz default now(),
  total_processed integer default 0,
  average_score numeric default 0.0,
  scoring_mode text default 'basic',
  discard_reasons jsonb default '{}',
  created_at timestamptz default now()
);

-- 6) Grant appropriate permissions
grant select on public.feed_scoring_stats to authenticated;
grant insert on public.feed_scoring_stats to service_role;

-- 7) Add RLS policy for scoring stats
create policy "Users can view feed scoring stats" on public.feed_scoring_stats
  for select using (true);

commit;

-- Verification
select locale, count(*) as total_sources, 
       count(*) filter (where id like '%_p%') as premium_sources
from public.external_feed_sources 
where enabled = true
group by locale 
order by total_sources desc;