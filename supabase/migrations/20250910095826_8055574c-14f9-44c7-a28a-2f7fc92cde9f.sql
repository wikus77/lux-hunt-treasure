-- M1SSION™ Curated Feed Sources Infrastructure

-- Create external_feed_sources table if not exists
CREATE TABLE IF NOT EXISTS public.external_feed_sources (
  id text PRIMARY KEY,
  locale text NOT NULL CHECK (locale IN ('en','fr','es','de','nl')),
  kind text NOT NULL CHECK (kind IN ('rss','site','api','search')),
  url text NOT NULL,
  tags text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  weight integer DEFAULT 1 CHECK (weight >= 0 AND weight <= 2),
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_feed_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admin can manage feed sources" ON public.external_feed_sources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public can read enabled feed sources" ON public.external_feed_sources
  FOR SELECT USING (enabled = true);

-- Create feed_crawler_runs table for diagnostics
CREATE TABLE IF NOT EXISTS public.feed_crawler_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  sources_count integer DEFAULT 0,
  items_fetched integer DEFAULT 0,
  items_new integer DEFAULT 0,
  items_skipped integer DEFAULT 0,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for crawler runs
ALTER TABLE public.feed_crawler_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view crawler runs" ON public.feed_crawler_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add missing columns to external_feed_items if they don't exist
DO $$ 
BEGIN
  -- Add locale column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_feed_items' AND column_name = 'locale') THEN
    ALTER TABLE public.external_feed_items ADD COLUMN locale text DEFAULT 'en';
  END IF;

  -- Add score column if not exists  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_feed_items' AND column_name = 'score') THEN
    ALTER TABLE public.external_feed_items ADD COLUMN score numeric DEFAULT 0.0;
  END IF;
END $$;

-- Insert curated sources
INSERT INTO public.external_feed_sources (id, locale, kind, url, tags, keywords, weight, enabled) VALUES
-- Luxury cars
('luxurycar_en_1', 'en', 'rss', 'https://www.topgear.com/rss', 
 ARRAY['luxury','cars'], 
 ARRAY['luxury car','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','McLaren','Bentley','Rolls-Royce','Porsche','Bugatti'], 
 2, true),

('luxurycar_fr_1', 'fr', 'rss', 'https://www.caradisiac.com/rss', 
 ARRAY['luxe','voitures'], 
 ARRAY['voiture de luxe','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], 
 2, true),

('luxurycar_es_1', 'es', 'rss', 'https://www.motor.es/rss', 
 ARRAY['lujo','coches'], 
 ARRAY['coche de lujo','superdeportivo','hiperdeportivo','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], 
 1, true),

('luxurycar_de_1', 'de', 'rss', 'https://www.auto-motor-und-sport.de/feed/', 
 ARRAY['luxus','autos'], 
 ARRAY['Luxusauto','Supersportwagen','Hypersportwagen','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], 
 1, true),

('luxurycar_nl_1', 'nl', 'rss', 'https://www.autoblog.nl/feed', 
 ARRAY['luxe','auto'], 
 ARRAY['luxe auto','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], 
 1, true),

-- Luxury lifestyle
('luxury_en_1', 'en', 'rss', 'https://www.luxuo.com/feed', 
 ARRAY['luxury','lifestyle'], 
 ARRAY['luxury','premium','yacht','private jet','haute couture','watch','timepiece','tourbillon','bespoke','limited edition'], 
 1, true),

('luxury_fr_1', 'fr', 'rss', 'https://www.madame.lefigaro.fr/rss.xml', 
 ARRAY['luxe','lifestyle'], 
 ARRAY['luxe','premium','yacht','jet privé','haute couture','montre','tourbillon','édition limitée'], 
 1, true),

('luxury_es_1', 'es', 'rss', 'https://www.revistaad.es/rss', 
 ARRAY['lujo','estilo'], 
 ARRAY['lujo','premium','yate','jet privado','alta costura','reloj','edición limitada'], 
 1, true),

('luxury_de_1', 'de', 'rss', 'https://www.vogue.de/rss', 
 ARRAY['luxus','lifestyle'], 
 ARRAY['Luxus','Premium','Yacht','Privatjet','Haute Couture','Uhr','Limitierte Auflage'], 
 1, true),

('luxury_nl_1', 'nl', 'rss', 'https://www.quo.nl/feed/', 
 ARRAY['luxe','lifestyle'], 
 ARRAY['luxe','premium','jacht','private jet','horloge','limited edition'], 
 1, true),

-- Missions, rewards, prizes
('prize_en_1', 'en', 'search', 'https://news.google.com/rss/search?q=contest+OR+giveaway+OR+prize+OR+reward', 
 ARRAY['prize','rewards'], 
 ARRAY['mission','challenge','contest','giveaway','prize','reward','earn','win'], 
 1, true),

('prize_it_1', 'en', 'search', 'https://news.google.com/rss/search?q=mission+challenge+reward+prize+luxury', 
 ARRAY['mission','rewards'], 
 ARRAY['mission','premio','premi','ricompensa','sfida','lusso','auto di lusso'], 
 1, true),

('premio_fr_1', 'fr', 'search', 'https://news.google.com/rss/search?q=concours+recompense+prix+mission', 
 ARRAY['prix','mission'], 
 ARRAY['mission','concours','récompense','prix','luxe'], 
 1, true),

('premio_es_1', 'es', 'search', 'https://news.google.com/rss/search?q=concurso+premio+recompensa+mision+lujo', 
 ARRAY['premio','mision'], 
 ARRAY['misión','concurso','premio','recompensa','lujo'], 
 1, true),

('premio_de_1', 'de', 'search', 'https://news.google.com/rss/search?q=gewinnspiel+preis+belohnung+mission+luxus', 
 ARRAY['preis','belohnung'], 
 ARRAY['Mission','Gewinnspiel','Preis','Belohnung','Luxus'], 
 1, true),

('premio_nl_1', 'nl', 'search', 'https://news.google.com/rss/search?q=wedstrijd+prijs+beloning+missie+luxe', 
 ARRAY['prijs','missie'], 
 ARRAY['missie','wedstrijd','prijs','beloning','luxe'], 
 1, true)

ON CONFLICT (id) DO UPDATE SET
  locale = EXCLUDED.locale,
  kind = EXCLUDED.kind,
  url = EXCLUDED.url,
  tags = EXCLUDED.tags,
  keywords = EXCLUDED.keywords,
  weight = EXCLUDED.weight,
  enabled = EXCLUDED.enabled,
  updated_at = now();

-- Insert seed data for immediate testing
INSERT INTO public.external_feed_items (
  source, title, url, summary, published_at, tags, brand, locale, score, content_hash
) VALUES
-- English luxury cars
('luxurycar_en_1', 'Ferrari Unveils New Hypercar With 1000HP', 
 'https://example.com/ferrari-hypercar-1', 
 'Ferrari announces their latest hypercar featuring cutting-edge technology and luxury design',
 now() - interval '1 hour',
 ARRAY['luxury','cars','Ferrari','hypercar'],
 'TopGear', 'en', 0.85,
 encode(sha256('ferrari-hypercar-latest'::bytea), 'hex')),

-- French luxury  
('luxury_fr_1', 'Nouvelle Collection de Montres de Luxe Suisses',
 'https://example.com/montres-luxe-suisses',
 'Les plus prestigieuses maisons horlogères suisses dévoilent leurs créations exclusives',
 now() - interval '30 minutes',
 ARRAY['luxe','montres','Swiss','horlogerie'],
 'Figaro Madame', 'fr', 0.78,
 encode(sha256('montres-luxe-suisses'::bytea), 'hex')),

-- Spanish prizes
('premio_es_1', 'Gran Concurso Internacional de Coches de Lujo',
 'https://example.com/concurso-coches-lujo',
 'Participa en el concurso más exclusivo del año y gana un superdeportivo de lujo',
 now() - interval '45 minutes', 
 ARRAY['concurso','premio','lujo','coches'],
 'Motor España', 'es', 0.82,
 encode(sha256('concurso-coches-lujo'::bytea), 'hex')),

-- German luxury cars
('luxurycar_de_1', 'Porsche Präsentiert Limitierte Supersportwagen Edition',
 'https://example.com/porsche-limited-edition',
 'Porsche stellt eine streng limitierte Auflage ihres neuesten Supersportwagens vor',
 now() - interval '20 minutes',
 ARRAY['Porsche','Supersportwagen','limitiert','luxus'],
 'Auto Motor Sport', 'de', 0.79,
 encode(sha256('porsche-limited-edition'::bytea), 'hex')),

-- Dutch luxury lifestyle
('luxury_nl_1', 'Exclusieve Jachten en Private Jets op Luxe Beurs',
 'https://example.com/luxe-beurs-nederland', 
 'De meest luxueuze jachten en private jets worden tentoongesteld op de prestigieuze beurs',
 now() - interval '15 minutes',
 ARRAY['luxe','jachten','private jets','exclusief'],
 'Quo Magazine', 'nl', 0.76,
 encode(sha256('luxe-beurs-nederland'::bytea), 'hex')),

-- English mission/challenge
('prize_en_1', 'Ultimate Luxury Challenge: Win a McLaren Supercar',
 'https://example.com/mclaren-challenge',
 'Join the ultimate mission to win a limited edition McLaren supercar worth $500,000',
 now() - interval '10 minutes',
 ARRAY['mission','challenge','McLaren','supercar','luxury'],
 'Luxury News', 'en', 0.88,
 encode(sha256('mclaren-challenge-ultimate'::bytea), 'hex'))

ON CONFLICT (content_hash) DO NOTHING;