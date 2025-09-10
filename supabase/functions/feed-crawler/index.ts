import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const runId = crypto.randomUUID();
  const startTime = new Date();

  try {
    console.log(`🕷️ [FEED-CRAWLER] Run ${runId} starting...`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const FEED_SCORE_MIN = parseFloat(Deno.env.get('FEED_SCORE_MIN') || '0.6');
    
    // Create run log
    const { data: runLog } = await supabaseClient
      .from('feed_crawler_runs')
      .insert({ id: runId, started_at: startTime })
      .select()
      .single();

    console.log(`📊 [FEED-CRAWLER] Run logged with ID: ${runId}`);

    // Fetch enabled curated sources
    const { data: feedSources, error: sourcesError } = await supabaseClient
      .from('external_feed_sources')
      .select('*')
      .eq('enabled', true)
      .order('weight', { ascending: false });

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

        // Score and insert items
        for (const item of syntheticItems) {
          const score = calculateScore(item, source);
          
          if (score < FEED_SCORE_MIN) {
            console.log(`⚠️ [FEED-CRAWLER] Item "${item.title}" score ${score} below threshold ${FEED_SCORE_MIN}`);
            totalItemsSkipped++;
            continue;
          }

          // Create content hash for deduplication
          const contentHash = await createContentHash(item.url || item.title + item.published_at);
          
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

// Create SHA-256 content hash for deduplication
async function createContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
