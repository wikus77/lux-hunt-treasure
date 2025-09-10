# M1SSION™ Feed Sources Documentation

## Overview
The M1SSION™ Interest Engine processes curated content from multilingual RSS feeds and search queries to generate personalized user recommendations.

## Source Categories

### 1. Luxury Cars (luxurycar_*)
- **Primary Sources**: TopGear, AutoCar, Motor1, Caradisiac, Motor.es, Auto Motor Sport, Autoblog.nl
- **Extended Sources**: AutoWeek.nl, AutoBild.es, AutoZeitung.de, Turbo.fr
- **Keywords**: supercar, hypercar, luxury, Ferrari, Porsche, McLaren, Lamborghini, Bentley

### 2. Luxury Watches (watch_*)
- **Sources**: Hodinkee, Montres de Luxe, GCWatches, WatchTime, Fratello Watches
- **Keywords**: watch, rolex, patek, montre, reloj, uhr, horloge

### 3. Luxury Lifestyle (luxury_*)
- **Sources**: Luxuo, Journal du Luxe, Vanity Fair, Robb Report, Quotenet
- **Keywords**: luxury, yacht, private jet, haute couture, premium lifestyle

### 4. Prizes & Contests (prize_*, premio_*)
- **Sources**: Google News RSS searches for contests and giveaways
- **Keywords**: contest, prize, giveaway, concours, premio, gewinnspiel, wedstrijd

### 5. Missions & Challenges (mission_*)
- **Sources**: Google News RSS searches for mission-related content
- **Keywords**: mission, challenge, quest, défi, quête, desafío, herausforderung

## Scoring Criteria

### Base Scoring (0.0 - 1.0)
- **Title Match**: 0.3 weight
- **Summary Match**: 0.5 weight  
- **Tags Match**: 0.2 weight
- **Language Boost**: +0.1 for locale-specific keywords
- **Minimum Threshold**: 0.6 (items below are filtered out)

### Source Weights
- **Weight 2**: Premium luxury car sources (TopGear, etc.)
- **Weight 1**: All other sources (default)

## Locales Supported
- **EN**: English (primary)
- **FR**: French
- **ES**: Spanish
- **DE**: German
- **NL**: Dutch

## Technical Implementation

### Feed Crawler
- Runs every 15 minutes via cron
- Processes all enabled sources from `external_feed_sources` table
- Deduplicates using content hash
- Maintains rolling window of latest 100 items per source

### Database Schema
```sql
external_feed_sources (id, locale, kind, url, tags, keywords, weight, enabled)
external_feed_items (id, title, summary, url, source, locale, tags, score, published_at)
```

### Diagnostics
Available at `/feed-crawler/diag` endpoint:
- Source count by locale
- Last 10 URLs visited
- Latest job timestamp

## DO NOT TOUCH
- Push notification chain (sw.js, WebPushToggle, webpush-* functions)
- VAPID configuration
- Push-related database tables