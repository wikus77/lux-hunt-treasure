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
    
    // Configurable cooldown (default 12 hours)
    const cooldownHours = parseInt(Deno.env.get('NOTIFIER_PREFS_COOLDOWN_HOURS') || '12')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a dry-run request
    const url = new URL(req.url)
    const isDryRun = url.pathname.includes('/dry-run')
    const testUserId = url.searchParams.get('user_id')
    const maxCandidates = parseInt(url.searchParams.get('max') || '5')
    const overrideCooldown = url.searchParams.get('cooldown') ? parseInt(url.searchParams.get('cooldown')!) : cooldownHours
    
    if (isDryRun && testUserId) {
      // DRY-RUN MODE: Complete preferences-first pipeline without DB writes or push sends
      console.log(JSON.stringify({
        event: "dry_run_start",
        user_id: testUserId,
        max_candidates: maxCandidates,
        cooldown_hours: overrideCooldown
      }))
      
      // Get resolved tags
      const { data: resolvedTags } = await supabase
        .from('v_user_resolved_tags')
        .select('resolved_tags')
        .eq('user_id', testUserId)
        .single()
      
      // Get candidates using function
      const { data: candidates } = await supabase
        .rpc('fn_candidates_for_user', {
          p_user_id: testUserId,
          p_limit: maxCandidates
        })
      
      // Check throttling with configurable cooldown
      const cooldownTime = new Date(Date.now() - overrideCooldown * 60 * 60 * 1000).toISOString()
      
      // Check total ever (for first notification logic)
      const { count: totalEver } = await supabase
        .from('suggested_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', testUserId)
      
      // Check recent suggestions  
      const { count: recentCount } = await supabase
        .from('suggested_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', testUserId)
        .gte('created_at', cooldownTime)
      
      // Throttle logic: if totalEver = 0, allow first notification
      let throttleApplied = false
      let throttleReason = "none"
      
      if (totalEver === 0) {
        throttleApplied = false
        throttleReason = "first_notification"
      } else if (recentCount && recentCount > 0) {
        throttleApplied = true
        throttleReason = "recent_suggestion"
      }
      
      const wouldSend = !throttleApplied && candidates && candidates.length > 0
      
      // Get qualified items count for debugging
      const { count: qualifiedItemsCount } = await supabase
        .from('external_feed_items')
        .select('id', { count: 'exact', head: true })
        .gte('score', 0.72)
        .gte('published_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())

      const response = {
        user_id: testUserId,
        resolved_tags: resolvedTags?.resolved_tags || [],
        qualified_items_count: qualifiedItemsCount || 0,
        candidates_count: candidates?.length || 0,
        candidates_sample: candidates?.slice(0, 3).map(c => ({
          id: c.feed_item_id,
          title: c.title,
          score: c.score,
          tags: c.tags,
          url: c.url,
          published_at: c.published_at
        })) || [],
        cooldown_hours: overrideCooldown,
        total_ever: totalEver || 0,
        recent_suggestions_12h: recentCount || 0,
        throttle_applied: throttleApplied,
        throttle_reason: throttleReason,
        would_send: wouldSend
      }
      
      console.log(JSON.stringify({
        event: "dry_run_complete",
        ...response
      }))
      
      return new Response(JSON.stringify(response, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
        status: 200
      })
    }

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

    // Process each user profile (SIGNALS-BASED BRANCH)
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

    // PREFERENCES-FIRST FALLBACK BRANCH
    // Get users with notification preferences but no user_interest_profile
    const { data: prefUsers, error: prefError } = await supabase
      .from('v_user_resolved_tags')
      .select('user_id, resolved_tags')
      .not('resolved_tags', 'eq', '{}') // Has active preferences

    if (!prefError && prefUsers && prefUsers.length > 0) {
      console.log(`🔔 [NOTIFIER-ENGINE] Processing ${prefUsers.length} users with preferences fallback...`)
      
      for (const prefUser of prefUsers) {
        try {
          // Skip if user already processed in signals branch
          if (profiles.some(p => p.user_id === prefUser.user_id)) {
            continue
          }

          // Check daily quota for preferences users
          const today = new Date().toISOString().split('T')[0]
          const { data: quota } = await supabase
            .from('notification_quota')
            .select('*')
            .eq('user_id', prefUser.user_id)
            .single()

          const isQuotaReset = !quota || quota.last_reset.split('T')[0] !== today
          const currentSent = isQuotaReset ? 0 : quota.sent_today

          if (currentSent >= 1) { // Max 1 notification per 12h for preferences fallback
            console.log(`🔔 [NOTIFIER-ENGINE] Preferences user ${prefUser.user_id} reached daily quota (sent: ${currentSent})`)
            continue
          }
          
          const resolvedTags = prefUser.resolved_tags || []
          
          console.log(JSON.stringify({
            phase: "prefs-fallback",
            user_id: prefUser.user_id,
            resolved_tags: resolvedTags,
            step: "getting_candidates"
          }))

          // Get candidates using new function (fresh feed items matching user preferences)
          const { data: candidates, error: candidatesError } = await supabase
            .rpc('fn_candidates_for_user', {
              p_user_id: prefUser.user_id,
              p_limit: 3
            })

          const candidatesCount = candidates?.length || 0

          if (candidatesError || candidatesCount === 0) {
            // If no candidates, log sample of qualified items for debugging
            if (candidatesCount === 0) {
              const { data: sampleItems } = await supabase
                .from('external_feed_items')
                .select('id, title, score, tags, locale')
                .gte('score', 0.72)
                .gte('published_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
                .limit(5)
              
              console.log(JSON.stringify({
                phase: "prefs-fallback",
                user_id: prefUser.user_id,
                resolved_tags: resolvedTags,
                candidates_count: 0,
                sample_qualified_items: sampleItems || [],
                error: candidatesError?.message || 'no_candidates_found'
              }))
            }
            continue
          }

          // Select best candidate (highest score)
          const bestCandidate = candidates[0]
          
          // Enhanced throttling with first notification logic
          const cooldownTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString()
          
          // Check total ever (for first notification logic)
          const { count: totalEver } = await supabase
            .from('suggested_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', prefUser.user_id)
          
          // Check recent suggestions
          const { count: recentCount } = await supabase
            .from('suggested_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', prefUser.user_id)
            .gte('created_at', cooldownTime)
          
          let throttleApplied = false
          let throttleReason = "none"
          
          // NEW LOGIC: Allow first notification (totalEver = 0)
          if (totalEver === 0) {
            throttleApplied = false
            throttleReason = "first_notification_allowed"
          } else if (recentCount && recentCount > 0) {
            throttleApplied = true
            throttleReason = "recent_suggestion"
          }

          console.log(JSON.stringify({
            phase: "prefs-fallback",
            user_id: prefUser.user_id,
            resolved_tags: resolvedTags,
            candidates_count: candidatesCount,
            cooldown_hours: cooldownHours,
            throttle: { 
              totalEver: totalEver || 0, 
              recentCount: recentCount || 0, 
              applied: throttleApplied, 
              reason: throttleReason 
            },
            selection: bestCandidate ? { 
              id: bestCandidate.feed_item_id, 
              score: bestCandidate.score, 
              locale: bestCandidate.locale 
            } : null
          }))

          if (throttleApplied) {
            console.log(`🔔 [NOTIFIER-ENGINE] User ${prefUser.user_id} throttled: ${throttleReason}`)
            continue
          }
          
          console.log(`🔔 [NOTIFIER-ENGINE] Selected item for user ${prefUser.user_id}: ${bestCandidate.title} (score: ${bestCandidate.score}, id: ${bestCandidate.feed_item_id})`)

          // Create suggestion (idempotency via unique index)
          const dedupeKey = `${prefUser.user_id}-${bestCandidate.feed_item_id}`
          
          const { data: suggestion, error: suggestionError } = await supabase
            .from('suggested_notifications')
            .insert({
              user_id: prefUser.user_id,
              item_id: bestCandidate.feed_item_id,
              reason: 'preferences_fallback',
              score: bestCandidate.score,
              dedupe_key: dedupeKey
            })
            .select()
            .single()

          if (suggestionError) {
            if (suggestionError.code === '23505') { // Unique violation = already exists
              console.log(`🔔 [NOTIFIER-ENGINE] Suggestion already exists for user ${prefUser.user_id}`)
              continue
            }
            console.error(`🔔 [NOTIFIER-ENGINE] Error creating preferences suggestion for user ${prefUser.user_id}:`, suggestionError)
            continue
          }

          notificationsQueued++

          // Try to send push notification (same as signals branch)
          try {
            const { data: subscription } = await supabase
              .from('webpush_subscriptions')
              .select('*')
              .eq('user_id', prefUser.user_id)
              .eq('is_active', true)
              .single()

            if (subscription) {
              const notificationPayload = {
                subscription: {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                  }
                },
                title: `🎯 M1SSION™: ${bestCandidate.title.substring(0, 40)}...`,
                body: `Based on your interests: ${bestCandidate.tags.slice(0, 3).join(', ')}`,
                data: {
                  type: 'preferences_notification',
                  item_id: bestCandidate.feed_item_id,
                  url: bestCandidate.url,
                  score: bestCandidate.score,
                  reason: 'preferences_fallback'
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
                    user_id: prefUser.user_id,
                    last_reset: new Date().toISOString(),
                    sent_today: currentSent + 1
                  })

                notificationsSent++
                console.log(`🔔 [NOTIFIER-ENGINE] Sent preferences notification to user ${prefUser.user_id}: ${bestCandidate.title}`)
              } else {
                console.error(`🔔 [NOTIFIER-ENGINE] Failed to send preferences push to user ${prefUser.user_id}:`, await pushResponse.text())
              }
            } else {
              console.log(`🔔 [NOTIFIER-ENGINE] No active subscription for preferences user ${prefUser.user_id}`)
            }
          } catch (pushError) {
            console.error(`🔔 [NOTIFIER-ENGINE] Preferences push error for user ${prefUser.user_id}:`, pushError)
          }

        } catch (prefUserError) {
          console.error(`🔔 [NOTIFIER-ENGINE] Error processing preferences user ${prefUser.user_id}:`, prefUserError)
        }
      }
    }

    console.log(`🔔 [NOTIFIER-ENGINE] Completed: ${notificationsSent} sent, ${notificationsQueued} queued`)
    console.log(`🔔 [NOTIFIER-ENGINE] Signals users: ${profiles.length}, Preferences users: ${prefUsers?.length || 0}`)

    return new Response(JSON.stringify({ 
      success: true, 
      notificationsSent,
      notificationsQueued,
      profilesProcessed: profiles.length,
      preferencesUsersProcessed: prefUsers?.length || 0,
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