import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedSource {
  name: string;
  url: string;
  selector?: string;
  tags: string[];
  brand?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('📰 [FEED-CRAWLER] Starting external feed crawling...')

    // Static feed sources (in production, these could come from env or database)
    const feedSources: FeedSource[] = [
      {
        name: 'gq',
        url: 'https://www.gq.com/luxury',
        tags: ['luxury', 'fashion', 'watches'],
        brand: 'GQ'
      },
      {
        name: 'hodinkee',
        url: 'https://hodinkee.com',
        tags: ['watches', 'luxury', 'timepieces'],
        brand: 'Hodinkee'
      },
      {
        name: 'press_porsche',
        url: 'https://newsroom.porsche.com',
        tags: ['auto', 'luxury', 'porsche', 'mission'],
        brand: 'Porsche'
      }
    ];

    let itemsProcessed = 0;
    let itemsAdded = 0;

    // For demo purposes, we'll generate synthetic content
    // In production, you'd implement actual RSS/webpage scraping
    const syntheticItems = [
      {
        source: 'gq',
        title: `Luxury Watch Innovation ${new Date().getFullYear()}`,
        url: `https://example.com/watches-${Date.now()}`,
        summary: 'Latest innovations in luxury timepieces and their connection to modern missions',
        tags: ['luxury', 'watches', 'innovation', 'mission'],
        brand: 'GQ',
        published_at: new Date().toISOString(),
        content_hash: `gq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      {
        source: 'hodinkee',
        title: `Swiss Precision Meets Modern Technology`,
        url: `https://example.com/swiss-tech-${Date.now()}`,
        summary: 'How traditional Swiss watchmaking adapts to modern technological challenges',
        tags: ['watches', 'swiss', 'technology', 'precision'],
        brand: 'Hodinkee',
        published_at: new Date().toISOString(),
        content_hash: `hodinkee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      {
        source: 'porsche',
        title: `Mission-E Technology Breakthrough`,
        url: `https://example.com/mission-e-${Date.now()}`,
        summary: 'Latest developments in Porsche Mission-E electric vehicle technology',
        tags: ['porsche', 'electric', 'mission', 'auto', 'luxury'],
        brand: 'Porsche',
        published_at: new Date().toISOString(),
        content_hash: `porsche-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      {
        source: 'tech_mission',
        title: `Advanced Mission Planning Systems`,
        url: `https://example.com/mission-tech-${Date.now()}`,
        summary: 'Revolutionary technology for mission planning and execution in luxury contexts',
        tags: ['mission', 'technology', 'planning', 'luxury'],
        brand: 'TechMission',
        published_at: new Date().toISOString(),
        content_hash: `tech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    ];

    // Process synthetic items (simulate crawling)
    for (const item of syntheticItems) {
      try {
        itemsProcessed++;

        // Try to insert the item
        const { data, error } = await supabase
          .from('external_feed_items')
          .insert([item])
          .select()

        if (error) {
          if (error.code === '23505') { // Unique constraint violation (duplicate content_hash)
            console.log(`📰 [FEED-CRAWLER] Skipping duplicate item: ${item.title}`)
          } else {
            console.error(`📰 [FEED-CRAWLER] Error inserting item: ${error.message}`)
          }
        } else {
          itemsAdded++;
          console.log(`📰 [FEED-CRAWLER] Added item: ${item.title}`)
        }

      } catch (itemError) {
        console.error(`📰 [FEED-CRAWLER] Error processing item ${item.title}:`, itemError)
      }
    }

    // Clean up old items (keep last 100 per source)
    for (const source of feedSources) {
      try {
        const { data: oldItems } = await supabase
          .from('external_feed_items')
          .select('id')
          .eq('source', source.name)
          .order('published_at', { ascending: false })
          .range(100, 1000) // Keep first 100, delete rest

        if (oldItems && oldItems.length > 0) {
          const idsToDelete = oldItems.map(item => item.id)
          
          const { error: deleteError } = await supabase
            .from('external_feed_items')
            .delete()
            .in('id', idsToDelete)

          if (!deleteError) {
            console.log(`📰 [FEED-CRAWLER] Cleaned up ${oldItems.length} old items from ${source.name}`)
          }
        }
      } catch (cleanupError) {
        console.error(`📰 [FEED-CRAWLER] Cleanup error for ${source.name}:`, cleanupError)
      }
    }

    console.log(`📰 [FEED-CRAWLER] Completed: ${itemsAdded} new items added out of ${itemsProcessed} processed`)

    return new Response(JSON.stringify({ 
      success: true, 
      itemsProcessed,
      itemsAdded,
      sources: feedSources.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('📰 [FEED-CRAWLER] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
