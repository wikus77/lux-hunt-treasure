/**
 * © 2025 Joseph MULÉ – M1SSION™ Curated Feed Sources
 * Multilingua content catalog for Interest Engine
 */

export type CuratedSource = {
  id: string;                         // slug univoco
  locale: 'en'|'fr'|'es'|'de'|'nl';   // lingua focus
  kind: 'rss'|'site'|'api'|'search';
  url: string;                        // endpoint pubblico (rss o sitemap o pagina indice)
  tags: string[];                     // tassonomia di base
  keywords: string[];                 // parole-chiave per scoring
  weight?: number;                    // priorità 0..2 (default 1)
  enabled: boolean;
};

export const CURATED_SOURCES: CuratedSource[] = [
  // Luxury cars
  { id:'luxurycar_en_1', locale:'en', kind:'rss', url:'https://www.topgear.com/rss', tags:['luxury','cars'], keywords:['luxury car','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','McLaren','Bentley','Rolls-Royce','Porsche','Bugatti'], weight:2, enabled:true },
  { id:'luxurycar_fr_1', locale:'fr', kind:'rss', url:'https://www.caradisiac.com/rss', tags:['luxe','voitures'], keywords:['voiture de luxe','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], weight:2, enabled:true },
  { id:'luxurycar_es_1', locale:'es', kind:'rss', url:'https://www.motor.es/rss', tags:['lujo','coches'], keywords:['coche de lujo','superdeportivo','hiperdeportivo','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], enabled:true },
  { id:'luxurycar_de_1', locale:'de', kind:'rss', url:'https://www.auto-motor-und-sport.de/feed/', tags:['luxus','autos'], keywords:['Luxusauto','Supersportwagen','Hypersportwagen','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], enabled:true },
  { id:'luxurycar_nl_1', locale:'nl', kind:'rss', url:'https://www.autoblog.nl/feed', tags:['luxe','auto'], keywords:['luxe auto','supercar','hypercar','Ferrari','Lamborghini','Aston Martin','Bentley','Rolls-Royce','Porsche','Bugatti'], enabled:true },

  // Luxury / premium lifestyle
  { id:'luxury_en_1', locale:'en', kind:'rss', url:'https://www.luxuo.com/feed', tags:['luxury','lifestyle'], keywords:['luxury','premium','yacht','private jet','haute couture','watch','timepiece','tourbillon','bespoke','limited edition'], enabled:true },
  { id:'luxury_fr_1', locale:'fr', kind:'rss', url:'https://www.madame.lefigaro.fr/rss.xml', tags:['luxe','lifestyle'], keywords:['luxe','premium','yacht','jet privé','haute couture','montre','tourbillon','édition limitée'], enabled:true },
  { id:'luxury_es_1', locale:'es', kind:'rss', url:'https://www.revistaad.es/rss', tags:['lujo','estilo'], keywords:['lujo','premium','yate','jet privado','alta costura','reloj','edición limitada'], enabled:true },
  { id:'luxury_de_1', locale:'de', kind:'rss', url:'https://www.vogue.de/rss', tags:['luxus','lifestyle'], keywords:['Luxus','Premium','Yacht','Privatjet','Haute Couture','Uhr','Limitierte Auflage'], enabled:true },
  { id:'luxury_nl_1', locale:'nl', kind:'rss', url:'https://www.quo.nl/feed/', tags:['luxe','lifestyle'], keywords:['luxe','premium','jacht','private jet','horloge','limited edition'], enabled:true },

  // "Missions", rewards, prize (concorsi/premi)
  { id:'prize_en_1', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=contest+OR+giveaway+OR+prize+OR+reward', tags:['prize','rewards'], keywords:['mission','challenge','contest','giveaway','prize','reward','earn','win'], enabled:true },
  { id:'prize_en_2', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=mission+challenge+reward+prize+luxury', tags:['mission','rewards'], keywords:['mission','premio','premi','ricompensa','sfida','lusso','auto di lusso'], enabled:true },
  { id:'premio_fr_1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=concours+recompense+prix+mission', tags:['prix','mission'], keywords:['mission','concours','récompense','prix','luxe'], enabled:true },
  { id:'premio_es_1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=concurso+premio+recompensa+mision+lujo', tags:['premio','mision'], keywords:['misión','concurso','premio','recompensa','lujo'], enabled:true },
  { id:'premio_de_1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=gewinnspiel+preis+belohnung+mission+luxus', tags:['preis','belohnung'], keywords:['Mission','Gewinnspiel','Preis','Belohnung','Luxus'], enabled:true },
  { id:'premio_nl_1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=wedstrijd+prijs+beloning+missie+luxe', tags:['prijs','missie'], keywords:['missie','wedstrijd','prijs','beloning','luxe'], enabled:true },

  // Mission sources
  { id:'mission_en_1', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=mission+OR+challenge+OR+quest', tags:['mission'], keywords:['mission','challenge','quest'], weight:1, enabled:true },
  { id:'mission_fr_1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=mission+OR+défi+OR+quête', tags:['mission'], keywords:['mission','défi','quête'], weight:1, enabled:true },
  { id:'mission_es_1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=misión+OR+desafío+OR+búsqueda', tags:['mission'], keywords:['misión','desafío','búsqueda'], weight:1, enabled:true },
  { id:'mission_de_1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=mission+OR+herausforderung+OR+suche', tags:['mission'], keywords:['mission','herausforderung','suche'], weight:1, enabled:true },
  { id:'mission_nl_1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=missie+OR+uitdaging+OR+zoektocht', tags:['mission'], keywords:['missie','uitdaging','zoektocht'], weight:1, enabled:true }
];

export default CURATED_SOURCES;