import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InterestSignal {
  user_id: string;
  section?: string;
  category?: string;
  type: string;
  ts: string;
  meta?: Record<string, any>;
  device: string;
  keywords: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧠 [PROFILE-REDUCER] Starting user interest profile calculation...')

    // Get recent interest signals (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: signals, error: signalsError } = await supabase
      .from('interest_signals')
      .select('user_id, type, section, category, meta, keywords, ts, device')
      .gte('ts', sevenDaysAgo)

    if (signalsError) {
      throw new Error(`Failed to fetch signals: ${signalsError.message}`)
    }

    if (!signals || signals.length === 0) {
      console.log('🧠 [PROFILE-REDUCER] No recent signals found')
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No recent signals to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Group signals by user
    const userSignals = new Map<string, InterestSignal[]>()
    
    for (const signal of signals) {
      if (!userSignals.has(signal.user_id)) {
        userSignals.set(signal.user_id, [])
      }
      userSignals.get(signal.user_id)!.push(signal)
    }

    let profilesUpdated = 0

    // Process each user's signals
    for (const [userId, userSigs] of userSignals) {
      try {
        // Calculate interest scores
        const topics: Record<string, number> = {}

        // Weight factors
        const weights = {
          favorite: 1.0,
          dwell: 0.7,
          click: 0.5,
          view: 0.2
        }

        // Time decay factor (newer = more weight)
        const now = Date.now()

        for (const signal of userSigs) {
          const signalTime = new Date(signal.ts).getTime()
          const daysDiff = (now - signalTime) / (1000 * 60 * 60 * 24)
          const timeDecay = Math.exp(-daysDiff / 3) // 3-day half-life

          const baseWeight = weights[signal.type as keyof typeof weights] || 0.1
          const finalWeight = baseWeight * timeDecay

          // Extract topics from section, category, keywords
          const topicSources = [
            signal.section?.toLowerCase(),
            signal.category?.toLowerCase(),
            ...(signal.keywords || [])
          ].filter(Boolean) as string[]

          // Add special handling for high-value activities
          if (signal.type === 'dwell' && signal.meta?.duration_ms) {
            const dwellMinutes = signal.meta.duration_ms / (1000 * 60)
            const dwellBonus = Math.min(dwellMinutes / 5, 2) // Max 2x bonus for 5+ minutes
            topicSources.forEach(topic => {
              topics[topic] = (topics[topic] || 0) + (finalWeight * dwellBonus)
            })
          } else {
            topicSources.forEach(topic => {
              topics[topic] = (topics[topic] || 0) + finalWeight
            })
          }

          // Device-specific adjustments
          if (signal.device === 'ios_pwa') {
            topicSources.forEach(topic => {
              topics[topic] = (topics[topic] || 0) + (finalWeight * 0.1) // Small PWA bonus
            })
          }
        }

        // Normalize scores to 0-1 range
        const maxScore = Math.max(...Object.values(topics))
        if (maxScore > 0) {
          for (const topic in topics) {
            topics[topic] = Math.min(topics[topic] / maxScore, 1)
          }
        }

        // Only keep topics with significant scores (>0.1)
        const filteredTopics = Object.fromEntries(
          Object.entries(topics).filter(([_, score]) => score > 0.1)
        )

        // Upsert user interest profile
        const { error: upsertError } = await supabase
          .from('user_interest_profile')
          .upsert({
            user_id: userId,
            topics: filteredTopics,
            updated_at: new Date().toISOString()
          })

        if (upsertError) {
          console.error(`🧠 [PROFILE-REDUCER] Failed to update profile for user ${userId}:`, upsertError)
        } else {
          profilesUpdated++
          console.log(`🧠 [PROFILE-REDUCER] Updated profile for user ${userId} with ${Object.keys(filteredTopics).length} topics`)
        }

      } catch (userError) {
        console.error(`🧠 [PROFILE-REDUCER] Error processing user ${userId}:`, userError)
      }
    }

    console.log(`🧠 [PROFILE-REDUCER] Completed: ${profilesUpdated} profiles updated`)

    return new Response(JSON.stringify({ 
      success: true, 
      processed: profilesUpdated,
      totalSignals: signals.length,
      uniqueUsers: userSignals.size
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('🧠 [PROFILE-REDUCER] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
