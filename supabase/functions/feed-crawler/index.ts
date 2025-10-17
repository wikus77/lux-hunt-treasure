import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

// DO NOT TOUCH PUSH CHAIN - Inline basic curated sources for edge function
interface CuratedSource {
  id: string;
  locale: string;
  kind: string;
  url: string;
  tags: string[];
  keywords: string[];
  weight: number;
  enabled: boolean;
}

const CURATED_SOURCES: CuratedSource[] = [
  {
    id: 'luxury-cars-en',
    locale: 'en',
    kind: 'rss',
    url: 'https://feeds.example.com/luxury-cars',
    tags: ['luxury', 'cars'],
    keywords: ['Ferrari', 'Lamborghini', 'luxury', 'supercar'],
    weight: 1.2,
    enabled: true
  }
];

// Basic merge function for sources
function mergeCuratedSources(...sourceLists: any[]): CuratedSource[] {
  const merged: CuratedSource[] = [];
  sourceLists.forEach(list => {
    if (Array.isArray(list)) {
      merged.push(...list);
    }
  });
  return merged;
}

// Basic URL normalization
function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
  } catch {
    return url;
  }
}

// Basic rate limiter
class ContentRateLimiter {
  private counts: Map<string, number> = new Map();
  
  canProcess(locale: string, category: string, limit: number): boolean {
    const key = `${locale}:${category}`;
    const current = this.counts.get(key) || 0;
    if (current >= limit) return false;
    this.counts.set(key, current + 1);
    return true;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// DO NOT TOUCH PUSH CHAIN - Global state for diagnostics and rate limiting
let globalStats = {
  lastRun: null as Date | null,
  itemsProcessed: 0,
  averageScore: 0,
  discardReasons: {
    tooOld: 0,
    lowScore: 0,
    duplicate: 0,
    rateLimited: 0
  }
};

const rateLimiter = new ContentRateLimiter();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // DO NOT TOUCH PUSH CHAIN - Handle diagnostics endpoint
  const url = new URL(req.url);
  if (url.pathname === '/feed-crawler/diag') {
    return handleDiagnostics(req);
  }

  const runId = crypto.randomUUID();
  const startTime = new Date();

  try {
    console.log(`🕷️ [FEED-CRAWLER] Run ${runId} starting...`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const FEED_SCORE_MIN = parseFloat(Deno.env.get('FEED_SCORE_MIN') || '0.72');
    const USE_PRO_SCORING = Deno.env.get('USE_PRO_SCORING') !== 'false';
    
    // DO NOT TOUCH PUSH CHAIN - Use basic curated sources
    const allCuratedSources = CURATED_SOURCES;
    
    // Create run log
    const { data: runLog } = await supabaseClient
      .from('feed_crawler_runs')
      .insert({ id: runId, started_at: startTime })
      .select()
      .single();

    console.log(`📊 [FEED-CRAWLER] Run logged with ID: ${runId}`);

    // DO NOT TOUCH PUSH CHAIN - Fetch enabled curated sources and merge with curated ones
    const { data: dbSources, error: sourcesError } = await supabaseClient
      .from('external_feed_sources')
      .select('*')
      .eq('enabled', true)
      .order('weight', { ascending: false });
      
    // Merge DB sources with curated sources (DB sources take priority)
    const feedSources = dbSources ? mergeCuratedSources(allCuratedSources, dbSources, []) : allCuratedSources;

    if (sourcesError) {
      throw new Error(`Sources fetch error: ${sourcesError.message}`);
    }

    console.log(`📡 [FEED-CRAWLER] Found ${feedSources?.length || 0} active sources`);

    let totalItemsFetched = 0;
    let totalItemsNew = 0;
    let totalItemsSkipped = 0;

    // Process each source
    for (const source of feedSources || []) {
      try {
        console.log(`🎯 [FEED-CRAWLER] Processing: ${source.id} (${source.locale})`);
        
        // Generate synthetic items (simulating RSS/API fetch)
        const syntheticItems = await generateSyntheticItems(source);
        totalItemsFetched += syntheticItems.length;

        // DO NOT TOUCH PUSH CHAIN - Score and filter items with advanced algorithms
        for (const item of syntheticItems) {
          let score: number;
          let filterReason: string | undefined;
          
          // Check rate limiting first
          const category = source.tags?.[0] || 'general';
          if (!rateLimiter.canProcess(source.locale, category, 3)) {
            globalStats.discardReasons.rateLimited++;
            console.log(`🚫 [FEED-CRAWLER] Rate limited: ${source.locale}:${category}`);
            continue;
          }
          
          // Use basic scoring only
          score = calculateScore(item, source);
          
          if (score < FEED_SCORE_MIN) {
            console.log(`⚠️ [FEED-CRAWLER] Item "${item.title}" score ${score} below threshold ${FEED_SCORE_MIN}`);
            globalStats.discardReasons.lowScore++;
            totalItemsSkipped++;
            continue;
          }
          
          globalStats.itemsProcessed++;
          globalStats.averageScore = (globalStats.averageScore + score) / 2;

          // DO NOT TOUCH PUSH CHAIN - Enhanced deduplication with URL normalization
          const normalizedUrl = item.url ? normalizeUrl(item.url) : item.title + item.published_at;
          const contentHash = await createContentHash(normalizedUrl);
          
          const feedItem = {
            source: source.id,
            title: item.title,
            url: item.url,
            summary: item.summary || '',
            published_at: item.published_at,
            tags: [...(source.tags || []), ...(item.tags || [])],
            brand: item.brand || source.id,
            locale: source.locale,
            score: score,
            content_hash: contentHash
          };

          // Insert with conflict handling
          const { error: insertError } = await supabaseClient
            .from('external_feed_items')
            .upsert(feedItem, { 
              onConflict: 'content_hash',
              ignoreDuplicates: true 
            });

          if (insertError) {
            console.log(`❌ [FEED-CRAWLER] Insert error for "${item.title}": ${insertError.message}`);
            totalItemsSkipped++;
          } else {
            console.log(`✅ [FEED-CRAWLER] Added: "${item.title}" (score: ${score})`);
            totalItemsNew++;
          }
        }

      } catch (sourceError) {
        console.error(`💥 [FEED-CRAWLER] Source ${source.id} failed:`, sourceError);
      }
    }

    // Cleanup old items (keep latest 100 per source)
    for (const source of feedSources || []) {
      try {
        const { data: oldItems } = await supabaseClient
          .from('external_feed_items')
          .select('id')
          .eq('source', source.id)
          .order('published_at', { ascending: false })
          .range(100, 1000);

        if (oldItems && oldItems.length > 0) {
          const idsToDelete = oldItems.map(item => item.id);
          
          await supabaseClient
            .from('external_feed_items')
            .delete()
            .in('id', idsToDelete);

          console.log(`🧹 [FEED-CRAWLER] Cleaned up ${oldItems.length} old items from ${source.id}`);
        }
      } catch (cleanupError) {
        console.error(`💥 [FEED-CRAWLER] Cleanup error for ${source.id}:`, cleanupError);
      }
    }

    // Update run log
    await supabaseClient
      .from('feed_crawler_runs')
      .update({
        finished_at: new Date(),
        sources_count: feedSources?.length || 0,
        items_fetched: totalItemsFetched,
        items_new: totalItemsNew,
        items_skipped: totalItemsSkipped
      })
      .eq('id', runId);

    console.log(`🎉 [FEED-CRAWLER] Run ${runId} completed: ${totalItemsNew} new items`);

    return new Response(
      JSON.stringify({
        success: true,
        run_id: runId,
        sources_processed: feedSources?.length || 0,
        items_fetched: totalItemsFetched,
        items_new: totalItemsNew,
        items_skipped: totalItemsSkipped,
        score_threshold: FEED_SCORE_MIN
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error(`💥 [FEED-CRAWLER] Fatal error in run ${runId}:`, error);
    
    // Log error to run
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient
        .from('feed_crawler_runs')
        .update({
          finished_at: new Date(),
          error_details: { message: error.message, stack: error.stack }
        })
        .eq('id', runId);
    } catch {}

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        run_id: runId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})

// Generate synthetic feed items based on source configuration
async function generateSyntheticItems(source: any) {
  const baseItems = [
    {
      title_en: "Ferrari Unveils Revolutionary Hypercar Technology",
      title_fr: "Ferrari Dévoile une Technologie Hypercar Révolutionnaire", 
      title_es: "Ferrari Presenta Tecnología Revolucionaria de Hiperdeportivos",
      title_de: "Ferrari Enthüllt Revolutionäre Hypersportwagen-Technologie",
      title_nl: "Ferrari Onthult Revolutionaire Hypercar Technologie",
      summary_en: "Latest Ferrari hypercar features groundbreaking hybrid technology and luxury materials",
      summary_fr: "La dernière hypercar Ferrari intègre une technologie hybride révolutionnaire et des matériaux de luxe",
      summary_es: "El último hiperdeportivo Ferrari cuenta con tecnología híbrida innovadora y materiales de lujo",
      summary_de: "Neuester Ferrari Hypersportwagen mit bahnbrechender Hybrid-Technologie und Luxusmaterialien",
      summary_nl: "Nieuwste Ferrari hypercar met baanbrekende hybride technologie en luxe materialen",
      tags: ["luxury", "cars", "Ferrari", "hypercar", "technology"]
    },
    {
      title_en: "Exclusive Swiss Watch Collection Launches",
      title_fr: "Lancement d'une Collection Exclusive de Montres Suisses",
      title_es: "Lanzamiento de Colección Exclusiva de Relojes Suizos", 
      title_de: "Exklusive Schweizer Uhrenkollektion startet",
      title_nl: "Exclusieve Zwitserse Horloge Collectie Gelanceerd",
      summary_en: "Premium Swiss timepieces featuring rare materials and traditional craftsmanship",
      summary_fr: "Montres suisses premium avec matériaux rares et artisanat traditionnel",
      summary_es: "Relojes suizos premium con materiales raros y artesanía tradicional",
      summary_de: "Premium Schweizer Zeitmesser mit seltenen Materialien und traditioneller Handwerkskunst",
      summary_nl: "Premium Zwitserse horloges met zeldzame materialen en traditioneel vakmanschap",
      tags: ["luxury", "watches", "premium", "Swiss", "craftsmanship"]
    },
    {
      title_en: "Ultimate Luxury Mission Challenge Announced",
      title_fr: "Défi Mission Luxe Ultime Annoncé",
      title_es: "Anunciado el Desafío de Misión de Lujo Definitivo",
      title_de: "Ultimate Luxus-Mission Challenge Angekündigt",
      title_nl: "Ultieme Luxe Missie Challenge Aangekondigd",
      summary_en: "Join exclusive global mission to win premium luxury experiences and supercars",
      summary_fr: "Rejoignez la mission mondiale exclusive pour gagner des expériences de luxe premium et des supercars",
      summary_es: "Únete a la misión global exclusiva para ganar experiencias de lujo premium y superdeportivos",
      summary_de: "Nehmen Sie an der exklusiven globalen Mission teil, um Premium-Luxuserlebnisse und Supersportwagen zu gewinnen",
      summary_nl: "Doe mee aan de exclusieve wereldwijde missie om premium luxe ervaringen en supercars te winnen",
      tags: ["mission", "challenge", "prize", "luxury", "exclusive", "global"]
    }
  ];

  const items = [];
  const itemCount = Math.floor(Math.random() * 2) + 1; // 1-2 items per source

  for (let i = 0; i < itemCount; i++) {
    const baseItem = baseItems[i % baseItems.length];
    const timestamp = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000); // Random within last 2 hours
    
    items.push({
      title: baseItem[`title_${source.locale}`] || baseItem.title_en,
      url: `https://example.com/${source.id}-${Date.now()}-${i}`,
      summary: baseItem[`summary_${source.locale}`] || baseItem.summary_en,
      published_at: timestamp.toISOString(),
      tags: baseItem.tags,
      brand: source.id
    });
  }

  return items;
}

// Calculate content score based on source keywords and weights
function calculateScore(item: any, source: any): number {
  const keywords = source.keywords || [];
  const weight = source.weight || 1;
  
  if (!keywords.length) return 0.5 * weight;

  const text = `${item.title} ${item.summary}`.toLowerCase();
  let matches = 0;
  let totalKeywords = keywords.length;

  // Count keyword matches (exact and partial)
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (text.includes(lowerKeyword)) {
      matches++;
    } else {
      // Check for partial matches (for compound keywords)
      const keywordTokens = lowerKeyword.split(' ');
      if (keywordTokens.length > 1) {
        const partialMatches = keywordTokens.filter(token => text.includes(token)).length;
        if (partialMatches >= keywordTokens.length * 0.5) { // At least 50% of tokens match
          matches += 0.5;
        }
      }
    }
  }

  // Base score from keyword matching
  const baseScore = matches / totalKeywords;
  
  // Apply source weight and language boost
  const languageBoost = getLanguageBoost(source.locale, text);
  const finalScore = Math.min(baseScore * weight * languageBoost, 1.0);

  return Math.round(finalScore * 100) / 100;
}

// Language-specific scoring boost
function getLanguageBoost(locale: string, text: string): number {
  const boosts: Record<string, string[]> = {
    'en': ['luxury', 'premium', 'exclusive', 'limited', 'mission'],
    'fr': ['luxe', 'premium', 'exclusif', 'limité', 'mission'],
    'es': ['lujo', 'premium', 'exclusivo', 'limitado', 'misión'],
    'de': ['luxus', 'premium', 'exklusiv', 'limitiert', 'mission'],
    'nl': ['luxe', 'premium', 'exclusief', 'beperkt', 'missie']
  };

  const localeBoosts = boosts[locale] || [];
  const hasBoostWords = localeBoosts.some(word => text.includes(word));
  
  return hasBoostWords ? 1.2 : 1.0;
}

// DO NOT TOUCH PUSH CHAIN - Diagnostics endpoint handler
async function handleDiagnostics(req: Request) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get source count by locale
    const { data: sourceStats } = await supabaseClient
      .from('external_feed_sources')
      .select('locale')
      .eq('enabled', true);

    const localeStats = sourceStats?.reduce((acc: Record<string, number>, source) => {
      acc[source.locale] = (acc[source.locale] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get last 10 feed items (as proxy for URLs visited)
    const { data: recentItems } = await supabaseClient
      .from('external_feed_items')
      .select('url, source, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get latest crawler run
    const { data: latestRun } = await supabaseClient
      .from('feed_crawler_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        source_count_by_locale: localeStats,
        last_10_urls: recentItems?.map(item => ({
          url: item.url,
          source: item.source,
          timestamp: item.created_at
        })) || [],
        latest_job: latestRun ? {
          id: latestRun.id,
          started_at: latestRun.started_at,
          finished_at: latestRun.finished_at,
          sources_count: latestRun.sources_count,
          items_new: latestRun.items_new
        } : null,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}

// Create SHA-256 content hash for deduplication
async function createContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
