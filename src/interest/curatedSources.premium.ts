/**
 * © 2025 Joseph MULÉ – M1SSION™ Premium Curated Feed Sources
 * High-quality multilingua content catalog for premium Interest Engine
 * 
 * NOTE: DO NOT TOUCH PUSH CHAIN - This file is only for premium feed crawling
 */

import type { CuratedSource } from './curatedSources';

export const CURATED_SOURCES_PREMIUM: CuratedSource[] = [
  /* ===== EN - Premium Luxury Cars (Hypercars/Supercars) ===== */
  { id:'luxurycar_en_p1', locale:'en', kind:'rss', url:'https://www.carmagazine.co.uk/feed/', tags:['auto','luxury','premium'], keywords:['hypercar','supercar','ferrari','bugatti','mclaren','koenigsegg','pagani'], weight:2, enabled:true },
  { id:'luxurycar_en_p2', locale:'en', kind:'rss', url:'https://www.dupontregistry.com/autos/rss', tags:['auto','luxury','premium'], keywords:['luxury car','exotic car','lamborghini','aston martin','rolls royce'], weight:2.5, enabled:true },
  { id:'luxurycar_en_p3', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+koenigsegg+limited+edition&hl=en', tags:['auto','luxury','limited'], keywords:['limited edition','one-off','bespoke','hypercar'], weight:2.2, enabled:true },

  /* ===== EN - Premium Watches (Haute Horlogerie) ===== */
  { id:'watch_en_p1', locale:'en', kind:'rss', url:'https://www.worldwatchreport.com/feed/', tags:['watches','luxury','premium'], keywords:['tourbillon','minute repeater','perpetual calendar','patek philippe','vacheron constantin'], weight:2.0, enabled:true },
  { id:'watch_en_p2', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"audemars+piguet"&hl=en', tags:['watches','luxury','haute'], keywords:['haute horlogerie','grand complication','swiss made'], weight:2.0, enabled:true },

  /* ===== EN - Premium Luxury Lifestyle ===== */
  { id:'luxury_en_p1', locale:'en', kind:'rss', url:'https://www.superyachttimes.com/rss', tags:['luxury','lifestyle','yacht'], keywords:['superyacht','megayacht','private jet','gulfstream','bombardier'], weight:1.8, enabled:true },
  { id:'luxury_en_p2', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=private+jet+OR+superyacht+OR+luxury+villa+OR+bespoke&hl=en', tags:['luxury','lifestyle','bespoke'], keywords:['bespoke','custom made','luxury villa','private island'], weight:1.8, enabled:true },

  /* ===== EN - Premium Prizes/Contests ===== */
  { id:'prize_en_p1', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=luxury+contest+OR+premium+giveaway+OR+exclusive+prize&hl=en', tags:['prize','luxury','exclusive'], keywords:['luxury contest','exclusive prize','premium giveaway','high value'], weight:1.5, enabled:true },

  /* ===== EN - Premium Mission/Challenges ===== */
  { id:'mission_en_p1', locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=brand+mission+OR+luxury+challenge+OR+exclusive+quest&hl=en', tags:['mission','luxury','brand'], keywords:['brand mission','luxury challenge','exclusive quest','vip access'], weight:1.5, enabled:true },

  /* ===== FR - Premium Sources ===== */
  { id:'luxurycar_fr_p1', locale:'fr', kind:'rss', url:'https://www.automobile-magazine.fr/rss', tags:['auto','luxe','premium'], keywords:['hypercar','supercar','ferrari','bugatti','mclaren','voiture de luxe'], weight:2.5, enabled:true },
  { id:'luxurycar_fr_p2', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+ferrari+édition+limitée&hl=fr', tags:['auto','luxe','limité'], keywords:['édition limitée','sur mesure','hypercar'], weight:2.2, enabled:true },
  
  { id:'watch_fr_p1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"vacheron+constantin"&hl=fr', tags:['montres','luxe','haute'], keywords:['haute horlogerie','grande complication','manufacture suisse'], weight:2.0, enabled:true },
  
  { id:'luxury_fr_p1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=superyacht+OR+jet+privé+OR+villa+de+luxe+OR+sur+mesure&hl=fr', tags:['luxe','lifestyle','yacht'], keywords:['superyacht','jet privé','villa de luxe','sur mesure'], weight:1.8, enabled:true },
  
  { id:'prize_fr_p1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=concours+de+luxe+OR+prix+exclusif+OR+tirage+premium&hl=fr', tags:['prix','luxe','exclusif'], keywords:['concours de luxe','prix exclusif','tirage premium'], weight:1.5, enabled:true },
  
  { id:'mission_fr_p1', locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=mission+de+marque+OR+défi+de+luxe+OR+quête+exclusive&hl=fr', tags:['mission','luxe','marque'], keywords:['mission de marque','défi de luxe','quête exclusive'], weight:1.5, enabled:true },

  /* ===== ES - Premium Sources ===== */
  { id:'luxurycar_es_p1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=hypercar+OR+superdeportivo+OR+bugatti+OR+ferrari+edición+limitada&hl=es', tags:['auto','lujo','premium'], keywords:['hypercar','superdeportivo','edición limitada','coche de lujo'], weight:2.5, enabled:true },
  
  { id:'watch_es_p1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=alta+relojería+OR+tourbillon+OR+"patek+philippe"+OR+"audemars+piguet"&hl=es', tags:['relojes','lujo','alta'], keywords:['alta relojería','gran complicación','manufactura suiza'], weight:2.0, enabled:true },
  
  { id:'luxury_es_p1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=superyate+OR+jet+privado+OR+villa+de+lujo+OR+a+medida&hl=es', tags:['lujo','estilo','yate'], keywords:['superyate','jet privado','villa de lujo','a medida'], weight:1.8, enabled:true },
  
  { id:'prize_es_p1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=concurso+de+lujo+OR+premio+exclusivo+OR+sorteo+premium&hl=es', tags:['premio','lujo','exclusivo'], keywords:['concurso de lujo','premio exclusivo','sorteo premium'], weight:1.5, enabled:true },
  
  { id:'mission_es_p1', locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=misión+de+marca+OR+desafío+de+lujo+OR+búsqueda+exclusiva&hl=es', tags:['misión','lujo','marca'], keywords:['misión de marca','desafío de lujo','búsqueda exclusiva'], weight:1.5, enabled:true },

  /* ===== DE - Premium Sources ===== */
  { id:'luxurycar_de_p1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=hypercar+OR+supersportwagen+OR+bugatti+OR+ferrari+limitierte+auflage&hl=de', tags:['auto','luxus','premium'], keywords:['hypercar','supersportwagen','limitierte auflage','luxusauto'], weight:2.5, enabled:true },
  
  { id:'watch_de_p1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+"a+lange"&hl=de', tags:['uhren','luxus','haute'], keywords:['haute horlogerie','große komplikation','schweizer manufaktur'], weight:2.0, enabled:true },
  
  { id:'luxury_de_p1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=superyacht+OR+privatjet+OR+luxusvilla+OR+maßgeschneidert&hl=de', tags:['luxus','lifestyle','yacht'], keywords:['superyacht','privatjet','luxusvilla','maßgeschneidert'], weight:1.8, enabled:true },
  
  { id:'prize_de_p1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=luxus+gewinnspiel+OR+exklusiver+preis+OR+premium+verlosung&hl=de', tags:['preis','luxus','exklusiv'], keywords:['luxus gewinnspiel','exklusiver preis','premium verlosung'], weight:1.5, enabled:true },
  
  { id:'mission_de_p1', locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=marken+mission+OR+luxus+herausforderung+OR+exklusive+suche&hl=de', tags:['mission','luxus','marke'], keywords:['marken mission','luxus herausforderung','exklusive suche'], weight:1.5, enabled:true },

  /* ===== NL - Premium Sources ===== */
  { id:'luxurycar_nl_p1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=hypercar+OR+supercar+OR+bugatti+OR+ferrari+gelimiteerde+editie&hl=nl', tags:['auto','luxe','premium'], keywords:['hypercar','supercar','gelimiteerde editie','luxeauto'], weight:2.5, enabled:true },
  
  { id:'watch_nl_p1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=haute+horlogerie+OR+tourbillon+OR+"patek+philippe"+OR+zwitsers+uurwerk&hl=nl', tags:['horloges','luxe','haute'], keywords:['haute horlogerie','grote complicatie','zwitserse manufactuur'], weight:2.0, enabled:true },
  
  { id:'luxury_nl_p1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=superjacht+OR+privéjet+OR+luxevilla+OR+op+maat&hl=nl', tags:['luxe','lifestyle','jacht'], keywords:['superjacht','privéjet','luxevilla','op maat'], weight:1.8, enabled:true },
  
  { id:'prize_nl_p1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=luxe+wedstrijd+OR+exclusieve+prijs+OR+premium+winactie&hl=nl', tags:['prijs','luxe','exclusief'], keywords:['luxe wedstrijd','exclusieve prijs','premium winactie'], weight:1.5, enabled:true },
  
  { id:'mission_nl_p1', locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=merk+missie+OR+luxe+uitdaging+OR+exclusieve+zoektocht&hl=nl', tags:['missie','luxe','merk'], keywords:['merk missie','luxe uitdaging','exclusieve zoektocht'], weight:1.5, enabled:true },

] as const;

/**
 * Merge curated sources with deduplication by ID
 * Priority: DB sources > premium > extended > base
 */
export function mergeCuratedSources(
  base: CuratedSource[], 
  extended: CuratedSource[], 
  premium: CuratedSource[]
): CuratedSource[] {
  const sourceMap = new Map<string, CuratedSource>();
  
  // Add base sources first
  base.forEach(source => sourceMap.set(source.id, source));
  
  // Add extended sources (will overwrite base if same ID)
  extended.forEach(source => sourceMap.set(source.id, source));
  
  // Add premium sources (will overwrite extended/base if same ID)
  premium.forEach(source => sourceMap.set(source.id, source));
  
  return Array.from(sourceMap.values());
}

export default CURATED_SOURCES_PREMIUM;