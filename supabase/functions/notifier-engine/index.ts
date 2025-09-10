import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
  user_id: string;
  topics: Record<string, number>;
  updated_at: string;
}

interface FeedItem {
  id: string;
  source: string;
  title: string;
  url: string;
  summary: string;
  tags: string[];
  brand?: string;
  published_at: string;
  content_hash: string;
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
    const functionsUrl = `${supabaseUrl}/functions/v1`
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔔 [NOTIFIER-ENGINE] Starting intelligent notifications processing...')

    // Get active user profiles (updated in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_interest_profile')
      .select('*')
      .gte('updated_at', thirtyDaysAgo)

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      console.log('🔔 [NOTIFIER-ENGINE] No active user profiles found')
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No active user profiles' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get recent feed items (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: feedItems, error: feedError } = await supabase
      .from('external_feed_items')
      .select('*')
      .gte('published_at', oneDayAgo)
      .order('published_at', { ascending: false })

    if (feedError) {
      throw new Error(`Failed to fetch feed items: ${feedError.message}`)
    }

    if (!feedItems || feedItems.length === 0) {
      console.log('🔔 [NOTIFIER-ENGINE] No recent feed items found')
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No recent feed items' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let notificationsSent = 0
    let notificationsQueued = 0

    // Process each user profile
    for (const profile of profiles as UserProfile[]) {
      try {
        // Check daily quota
        const today = new Date().toISOString().split('T')[0]
        
        const { data: quota } = await supabase
          .from('notification_quota')
          .select('*')
          .eq('user_id', profile.user_id)
          .single()

        const isQuotaReset = !quota || quota.last_reset.split('T')[0] !== today
        const currentSent = isQuotaReset ? 0 : quota.sent_today

        if (currentSent >= 3) { // Max 3 notifications per day
          console.log(`🔔 [NOTIFIER-ENGINE] User ${profile.user_id} reached daily quota`)
          continue
        }

        // Calculate scores for each feed item
        const scoredItems: { item: FeedItem; score: number; reason: string }[] = []

        for (const item of feedItems as FeedItem[]) {
          // Check for duplicates (same content_hash sent to this user)
          const dedupeKey = `${profile.user_id}-${item.content_hash}`
          
          const { data: existing } = await supabase
            .from('suggested_notifications')
            .select('id')
            .eq('dedupe_key', dedupeKey)
            .single()

          if (existing) {
            continue // Skip if already sent to this user
          }

          let score = 0
          let reason = 'general_interest'

          // Calculate interest score based on user topics and item tags
          const userTopics = profile.topics
          const itemTags = item.tags

          for (const tag of itemTags) {
            const userInterest = userTopics[tag.toLowerCase()] || 0
            score += userInterest * 0.5 // Base tag match
          }

          // Boost for brand affinity
          if (item.brand) {
            const brandInterest = userTopics[item.brand.toLowerCase()] || 0
            score += brandInterest * 0.3
          }

          // Recency boost (newer content gets higher score)
          const hoursAgo = (Date.now() - new Date(item.published_at).getTime()) / (1000 * 60 * 60)
          const recencyBoost = Math.max(0, 1 - hoursAgo / 24) * 0.2
          score += recencyBoost

          // Mission-related content gets special boost
          if (itemTags.some(tag => tag.toLowerCase().includes('mission'))) {
            score += 0.3
            reason = 'mission_context'
          }

          // Luxury content boost for interested users
          if (userTopics.luxury > 0.5 && itemTags.some(tag => 
            ['luxury', 'premium', 'exclusive'].includes(tag.toLowerCase())
          )) {
            score += 0.2
            reason = 'luxury_match'
          }

          if (score > 0.4) { // Minimum threshold
            scoredItems.push({ item, score, reason })
          }
        }

        // Sort by score and take the best match
        scoredItems.sort((a, b) => b.score - a.score)
        
        if (scoredItems.length > 0 && currentSent < 3) {
          const bestMatch = scoredItems[0]
          
          // Queue the notification suggestion
          const dedupeKey = `${profile.user_id}-${bestMatch.item.content_hash}`
          
          const { data: suggestion, error: suggestionError } = await supabase
            .from('suggested_notifications')
            .insert({
              user_id: profile.user_id,
              item_id: bestMatch.item.id,
              reason: bestMatch.reason,
              score: bestMatch.score,
              dedupe_key: dedupeKey
            })
            .select()
            .single()

          if (suggestionError) {
            console.error(`🔔 [NOTIFIER-ENGINE] Error creating suggestion for user ${profile.user_id}:`, suggestionError)
            continue
          }

          notificationsQueued++

          // Try to send the push notification via existing webpush-send function
          try {
            // Get user's webpush subscription
            const { data: subscription } = await supabase
              .from('webpush_subscriptions')
              .select('*')
              .eq('user_id', profile.user_id)
              .eq('is_active', true)
              .single()

            if (subscription) {
              // Call webpush-send function (existing push chain)
              const notificationPayload = {
                subscription: {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                  }
                },
                title: `🎯 ${bestMatch.item.brand || 'M1SSION'}: ${bestMatch.item.title.substring(0, 50)}...`,
                body: bestMatch.item.summary.substring(0, 120) + '...',
                data: {
                  type: 'interest_notification',
                  item_id: bestMatch.item.id,
                  url: bestMatch.item.url,
                  score: bestMatch.score,
                  reason: bestMatch.reason
                }
              }

              const pushResponse = await fetch(`${functionsUrl}/webpush-send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify(notificationPayload)
              })

              if (pushResponse.ok) {
                // Mark as sent and update quota
                await supabase
                  .from('suggested_notifications')
                  .update({ sent_at: new Date().toISOString() })
                  .eq('id', suggestion.id)

                await supabase
                  .from('notification_quota')
                  .upsert({
                    user_id: profile.user_id,
                    last_reset: new Date().toISOString(),
                    sent_today: currentSent + 1
                  })

                notificationsSent++
                console.log(`🔔 [NOTIFIER-ENGINE] Sent notification to user ${profile.user_id}: ${bestMatch.item.title}`)
              } else {
                console.error(`🔔 [NOTIFIER-ENGINE] Failed to send push to user ${profile.user_id}:`, await pushResponse.text())
              }
            } else {
              console.log(`🔔 [NOTIFIER-ENGINE] No active subscription for user ${profile.user_id}`)
            }
          } catch (pushError) {
            console.error(`🔔 [NOTIFIER-ENGINE] Push error for user ${profile.user_id}:`, pushError)
          }
        }

      } catch (userError) {
        console.error(`🔔 [NOTIFIER-ENGINE] Error processing user ${profile.user_id}:`, userError)
      }
    }

    console.log(`🔔 [NOTIFIER-ENGINE] Completed: ${notificationsSent} sent, ${notificationsQueued} queued`)

    return new Response(JSON.stringify({ 
      success: true, 
      notificationsSent,
      notificationsQueued,
      profilesProcessed: profiles.length,
      feedItemsAvailable: feedItems.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('🔔 [NOTIFIER-ENGINE] Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})