/**
 * © 2025 Joseph MULÉ – M1SSION™ Extended Curated Feed Sources
 * Expanded multilingua content catalog for Interest Engine
 * 
 * NOTE: DO NOT TOUCH PUSH CHAIN - This file is only for feed crawling
 */

import type { CuratedSource } from './curatedSources';

export const CURATED_SOURCES_EXTENDED: CuratedSource[] = [
  /* ===== EN (Luxury Cars / Watches / Lifestyle / Prizes / Missions) ===== */
  { id:'luxurycar_en_2', locale:'en', kind:'rss', url:'https://www.autocar.co.uk/rss', tags:['luxury','cars'], keywords:['supercar','hypercar','luxury'], weight:1, enabled:true },
  { id:'luxurycar_en_3', locale:'en', kind:'rss', url:'https://www.motor1.com/rss/news/', tags:['luxury','cars'], keywords:['ferrari','porsche','mclaren'], weight:1, enabled:true },
  { id:'watch_en_1',     locale:'en', kind:'rss', url:'https://www.hodinkee.com/feed', tags:['luxury','watches'], keywords:['watch','rolex','patek'], weight:1, enabled:true },
  { id:'luxury_en_2',    locale:'en', kind:'rss', url:'https://www.luxurylaunches.com/feed/', tags:['luxury','lifestyle'], keywords:['luxury','yacht','jet'], weight:1, enabled:true },
  { id:'prize_en_2',     locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=contest+OR+giveaway+OR+prize', tags:['prize'], keywords:['contest','prize','giveaway'], weight:1, enabled:true },
  { id:'mission_en_2',   locale:'en', kind:'search', url:'https://news.google.com/rss/search?q=mission+challenge+quest', tags:['mission'], keywords:['mission','challenge','quest'], weight:1, enabled:true },

  /* ===== FR ===== */
  { id:'luxurycar_fr_2', locale:'fr', kind:'rss', url:'https://www.turbo.fr/rss.xml', tags:['luxury','cars'], keywords:['voiture','supercar','luxe'], weight:1, enabled:true },
  { id:'luxury_fr_2',    locale:'fr', kind:'rss', url:'https://www.journalduluxe.fr/feed', tags:['luxury','lifestyle'], keywords:['luxe','mode','montre'], weight:1, enabled:true },
  { id:'watch_fr_1',     locale:'fr', kind:'rss', url:'https://www.montres-de-luxe.com/xml/syndication.rss', tags:['luxury','watches'], keywords:['montre','rolex','patek'], weight:1, enabled:true },
  { id:'premio_fr_2',    locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=concours+OR+tirage+au+sort+prix', tags:['prize'], keywords:['concours','prix'], weight:1, enabled:true },
  { id:'mission_fr_2',   locale:'fr', kind:'search', url:'https://news.google.com/rss/search?q=mission+defi+quête', tags:['mission'], keywords:['mission','défi','quête'], weight:1, enabled:true },

  /* ===== ES ===== */
  { id:'luxurycar_es_2', locale:'es', kind:'rss', url:'https://www.autobild.es/rss', tags:['luxury','cars'], keywords:['coche','supercoche','lujo'], weight:1, enabled:true },
  { id:'luxury_es_2',    locale:'es', kind:'rss', url:'https://www.revistavanityfair.es/rss', tags:['luxury','lifestyle'], keywords:['lujo','moda','reloj'], weight:1, enabled:true },
  { id:'watch_es_1',     locale:'es', kind:'rss', url:'https://es.gcwatches.com/feed/', tags:['luxury','watches'], keywords:['reloj','rolex','patek'], weight:1, enabled:true },
  { id:'premio_es_2',    locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=concurso+premio+sorteo', tags:['prize'], keywords:['concurso','premio'], weight:1, enabled:true },
  { id:'mission_es_2',   locale:'es', kind:'search', url:'https://news.google.com/rss/search?q=mision+desafio+busqueda', tags:['mission'], keywords:['misión','desafío','búsqueda'], weight:1, enabled:true },

  /* ===== DE ===== */
  { id:'luxurycar_de_2', locale:'de', kind:'rss', url:'https://www.autozeitung.de/rss', tags:['luxury','cars'], keywords:['auto','supercar','luxus'], weight:1, enabled:true },
  { id:'luxury_de_2',    locale:'de', kind:'rss', url:'https://www.robbreport.de/feed/', tags:['luxury','lifestyle'], keywords:['luxus','uhr','yacht'], weight:1, enabled:true },
  { id:'watch_de_1',     locale:'de', kind:'rss', url:'https://www.watchtime.net/feed/', tags:['luxury','watches'], keywords:['uhr','rolex','patek'], weight:1, enabled:true },
  { id:'premio_de_2',    locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=gewinnspiel+preis', tags:['prize'], keywords:['gewinnspiel','preis'], weight:1, enabled:true },
  { id:'mission_de_2',   locale:'de', kind:'search', url:'https://news.google.com/rss/search?q=mission+herausforderung+suche', tags:['mission'], keywords:['mission','herausforderung','suche'], weight:1, enabled:true },

  /* ===== NL ===== */
  { id:'luxurycar_nl_2', locale:'nl', kind:'rss', url:'https://www.autoweek.nl/rss/nieuws.xml', tags:['luxury','cars'], keywords:['auto','supercar','luxe'], weight:1, enabled:true },
  { id:'luxury_nl_2',    locale:'nl', kind:'rss', url:'https://www.quotenet.nl/feed/', tags:['luxury','lifestyle'], keywords:['luxe','horloge','jacht'], weight:1, enabled:true },
  { id:'watch_nl_1',     locale:'nl', kind:'rss', url:'https://www.fratellowatches.com/feed/', tags:['luxury','watches'], keywords:['horloge','rolex','patek'], weight:1, enabled:true },
  { id:'premio_nl_2',    locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=wedstrijd+prijs+winactie', tags:['prize'], keywords:['wedstrijd','prijs','winactie'], weight:1, enabled:true },
  { id:'mission_nl_2',   locale:'nl', kind:'search', url:'https://news.google.com/rss/search?q=missie+uitdaging+zoektocht', tags:['mission'], keywords:['missie','uitdaging','zoektocht'], weight:1, enabled:true },
] as const;

export default CURATED_SOURCES_EXTENDED;