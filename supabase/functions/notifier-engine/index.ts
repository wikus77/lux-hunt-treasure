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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const functionsUrl = `${supabaseUrl}/functions/v1`
    
    // Configurable cooldown (default 12 hours)
    const cooldownHours = parseInt(Deno.env.get('NOTIFIER_PREFS_COOLDOWN_HOURS') || '12')
    
    // TASK 2: Service role key validation - REQUIRED IN PROD
    if (!supabaseServiceKey) {
      console.log(JSON.stringify({
        phase: "prefs-first",
        action: "boot",
        hasServiceKey: false
      }))
      return new Response(JSON.stringify({ 
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable',
        phase: "service_key_error"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a dry-run request
    const url = new URL(req.url)
    const isDryRun = url.pathname.includes('/dry-run')
    const testUserId = url.searchParams.get('user_id')
    const maxCandidates = parseInt(url.searchParams.get('max') || '5')
    const overrideCooldown = url.searchParams.get('cooldown') ? parseInt(url.searchParams.get('cooldown')!) : cooldownHours
    const isDiag = url.searchParams.get('diag') === '1'
    
    // TASK A: Fixed dry-run authentication - accept ANON_KEY OR diag bypass
    if (isDryRun) {
      const authHeader = req.headers.get('authorization')
      const isValidAuth = authHeader && (
        authHeader.includes(supabaseServiceKey) || 
        authHeader.includes(supabaseAnonKey)
      )
      const allowedOrigin = req.headers.get('origin')
      const isDiagAllowed = isDiag && (
        allowedOrigin?.includes('lovableproject.com') || 
        allowedOrigin?.includes('localhost') ||
        allowedOrigin?.includes('127.0.0.1')
      )
      
      // Allow if valid auth OR if diag mode from allowed origin
      if (!isValidAuth && !isDiagAllowed) {
        console.log(JSON.stringify({
          phase: "dry_run_auth_failed",
          auth_header_present: !!authHeader,
          origin: allowedOrigin,
          diag_mode: isDiag
        }))
        return new Response(JSON.stringify({ 
          error: 'Missing authorization header or invalid diag mode',
          phase: "auth_error",
          details: "Provide Authorization: Bearer <ANON_KEY> or use diag=1 from allowed origin"
        }), {
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        })
      }
    }

    if (isDryRun && testUserId) {
      // DRY-RUN MODE: Complete preferences-first pipeline without DB writes or push sends
      console.log(JSON.stringify({
        phase: "dry_run_start",
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
      
      // Get candidates using unified function (same as prod)
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
        throttleReason = "first_notification_allowed"
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

      // TASK B: Enhanced JSON logging with all required fields
      console.log(JSON.stringify({
        phase: "prefs-first",
        user_id: testUserId,
        resolved_tags: resolvedTags?.resolved_tags || [],
        qualified_items_count: qualifiedItemsCount || 0,
        candidates_count: candidates?.length || 0,
        throttle_applied: throttleApplied,
        throttle_reason: throttleReason,
        would_send: wouldSend,
        cooldown_hours: overrideCooldown,
        total_ever: totalEver || 0
      }))

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
        recent_suggestions: recentCount || 0,
        throttle_applied: throttleApplied,
        throttle_reason: throttleReason,
        would_send: wouldSend
      }
      
      console.log(JSON.stringify({
        phase: "dry_run_complete",
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

    // TASK 7: Boot logging with structured JSON format
    console.log(JSON.stringify({
      "phase": "prefs-first",
      "action": "boot",
      "mode": "prod",
      "hasServiceKey": true,
      "enum_hardened": true
    }))
    
    console.log('🔔 [NOTIFIER-ENGINE] Starting intelligent notifications processing...')

    // TASK C: Start with preferences-first approach - PRODUCTION READY enumeration
    // Get users with active notification preferences from clean SQL view
    const { data: prefUsers, error: prefError } = await supabase
      .from('v_pref_users')
      .select('user_id')
      .order('user_id')
      .limit(100)

    if (prefError) {
      console.log(JSON.stringify({ 
        phase: 'prefs-first', 
        action: 'enum_error', 
        code: prefError.code, 
        message: prefError.message 
      }))
      return new Response('enum_error', { status: 500, headers: corsHeaders })
    }

    // Extract user IDs from clean view (no client-side filtering needed)
    const validUserIds = (prefUsers ?? []).map(r => r.user_id)
    
    console.log(JSON.stringify({
      "phase": "prefs-first",
      "step": "enumeration",
      "users_with_prefs": validUserIds.length
    }))

    if (validUserIds.length === 0) {
      console.log(JSON.stringify({ 
        phase: 'prefs-first', 
        step: 'main_processing', 
        users_count: 0 
      }))
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    // Get active user profiles (updated in last 30 days) as fallback
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_interest_profile')
      .select('*')
      .gte('updated_at', thirtyDaysAgo)

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
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

    let notificationsSent = 0
    let notificationsQueued = 0

    // PREFERENCES-FIRST PRIMARY BRANCH
    console.log(JSON.stringify({
      phase: "prefs-first",
      step: "main_processing",
      users_count: validUserIds.length
    }))

    for (const userId of validUserIds) {
      try {
        // Skip if user already processed in signals branch
        if (profiles && profiles.some(p => p.user_id === userId)) {
          continue
        }

        // Get resolved tags for this user - wrapped for 22P02 protection
        let resolvedTagsData
        try {
          const result = await supabase
            .from('v_user_resolved_tags')
            .select('resolved_tags')
            .eq('user_id', userId)
            .single()
          resolvedTagsData = result.data
          if (result.error && result.error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: result.error.message,
              user_id: userId
            }))
            continue
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: error.message,
              user_id: userId
            }))
            continue
          }
          throw error
        }

        const resolvedTags = resolvedTagsData?.resolved_tags || []
        
        if (resolvedTags.length === 0) {
          console.log(JSON.stringify({
            phase: "prefs-first",
            user_id: userId,
            resolved_tags: [],
            step: "skipped_no_tags"
          }))
          continue
        }

        // Check daily quota for preferences users - wrapped for 22P02 protection
        const today = new Date().toISOString().split('T')[0]
        let quota
        try {
          const result = await supabase
            .from('notification_quota')
            .select('*')
            .eq('user_id', userId)
            .single()
          quota = result.data
          if (result.error && result.error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: result.error.message,
              operation: 'quota_check',
              user_id: userId
            }))
            continue
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: error.message,
              operation: 'quota_check',
              user_id: userId
            }))
            continue
          }
          // Non-22P02 errors can be ignored for quota (defaulting to no quota)
          quota = null
        }

        const isQuotaReset = !quota || quota.last_reset.split('T')[0] !== today
        const currentSent = isQuotaReset ? 0 : quota.sent_today

        if (currentSent >= 1) { // Max 1 notification per 12h for preferences fallback
          console.log(JSON.stringify({
            phase: "prefs-first",
            user_id: userId,
            resolved_tags: resolvedTags,
            step: "quota_reached",
            current_sent: currentSent
          }))
          continue
        }
        
        console.log(JSON.stringify({
          phase: "prefs-first",
          user_id: userId,
          resolved_tags: resolvedTags,
          step: "getting_candidates"
        }))

        // Get candidates using same function as dry-run (fresh feed items matching user preferences) - wrapped for 22P02 protection
        let candidates, candidatesError
        try {
          const result = await supabase
            .rpc('fn_candidates_for_user', {
              p_user_id: userId,
              p_limit: 5  // Match dry-run limit
            })
          candidates = result.data
          candidatesError = result.error
          if (result.error && result.error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: result.error.message,
              operation: 'candidates_fetch',
              user_id: userId
            }))
            continue
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: error.message,
              operation: 'candidates_fetch',
              user_id: userId
            }))
            continue
          }
          throw error
        }

        const candidatesCount = candidates?.length || 0

        // Get qualified items count for logging
        const { count: qualifiedItemsCount } = await supabase
          .from('external_feed_items')
          .select('id', { count: 'exact', head: true })
          .gte('score', 0.72)
          .gte('published_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())

        if (candidatesError || candidatesCount === 0) {
          // If no candidates, log sample of qualified items for debugging
          const { data: sampleItems } = await supabase
            .from('external_feed_items')
            .select('id, title, score, tags, locale')
            .gte('score', 0.72)
            .gte('published_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
            .limit(5)
          
          console.log(JSON.stringify({
            phase: "prefs-first",
            user_id: userId,
            resolved_tags: resolvedTags,
            qualified_items_count: qualifiedItemsCount || 0,
            candidates_count: 0,
            throttle_applied: false,
            throttle_reason: "no_candidates",
            would_send: false,
            cooldown_hours: cooldownHours,
            sample_qualified_items: sampleItems || [],
            error: candidatesError?.message || 'no_candidates_found'
          }))
          continue
        }

        // Select best candidate (highest score)
        const bestCandidate = candidates[0]
        
        // TASK 7: Candidate pick logging 
        console.log(JSON.stringify({
          "phase": "prefs-first",
          "action": "candidate_pick",
          "candidate_id": bestCandidate.feed_item_id,
          "title": bestCandidate.title,
          "score": bestCandidate.score
        }))
        
        // Enhanced throttling with first notification logic
        const cooldownTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString()
        
        // Check total ever (for first notification logic) - wrapped for 22P02 protection
        let totalEver = 0
        try {
          const result = await supabase
            .from('suggested_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
          totalEver = result.count || 0
          if (result.error && result.error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: result.error.message,
              operation: 'total_ever_check',
              user_id: userId
            }))
            continue
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: error.message,
              operation: 'total_ever_check',
              user_id: userId
            }))
            continue
          }
          throw error
        }
        
        // Check recent suggestions - wrapped for 22P02 protection
        let recentCount = 0
        try {
          const result = await supabase
            .from('suggested_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', cooldownTime)
          recentCount = result.count || 0
          if (result.error && result.error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: result.error.message,
              operation: 'recent_suggestions_check',
              user_id: userId
            }))
            continue
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            console.log(JSON.stringify({ 
              phase: 'prefs-first', 
              action: 'uuid_syntax_error', 
              code: '22P02', 
              details: error.message,
              operation: 'recent_suggestions_check',
              user_id: userId
            }))
            continue
          }
          throw error
        }
        
        let throttleApplied = false
        let throttleReason = "none"
        
        // NEW LOGIC: Allow first notification (totalEver = 0)
        if (totalEver === 0) {
          throttleApplied = false
          throttleReason = "first_notification_allowed"
        } else if (recentCount > 0) {
          throttleApplied = true
          throttleReason = "recent_suggestion"
        }

        const wouldSend = !throttleApplied && candidatesCount > 0

        // TASK 7: Enhanced throttle check logging
        console.log(JSON.stringify({
          "phase": "prefs-first",
          "action": "throttle_check",
          "user_id": userId,
          "totalEver": totalEver,
          "recent_12h": recentCount,
          "throttle_applied": throttleApplied,
          "throttle_reason": throttleReason,
          "would_send": wouldSend,
          "cooldown_hours": cooldownHours,
          "resolved_tags": resolvedTags,
          "qualified_items_count": qualifiedItemsCount || 0,
          "candidates_count": candidatesCount
        }))
        
        if (!throttleApplied && bestCandidate) {
          // TASK 3: Simple dedupe key with user + candidate id
          const dedupeKey = `${userId}-${bestCandidate.feed_item_id}`
          
          const { data: suggestion, error: suggestionError } = await supabase
            .from('suggested_notifications')
            .insert({
              user_id: userId,
              item_id: bestCandidate.feed_item_id,
              reason: "preferences_match",
              score: bestCandidate.score,
              dedupe_key: dedupeKey
            })
            .select()
            .single()

          if (suggestionError) {
            console.log(JSON.stringify({
              phase: "prefs-first",
              action: "insert_failed",
              user_id: userId,
              error: suggestionError.message
            }))
            console.error(`🔔 [NOTIFIER-ENGINE] Error creating preference suggestion for user ${userId}:`, suggestionError)
            continue
          }

          // TASK 7: Structured logging after successful insert
          console.log(JSON.stringify({
            "phase": "prefs-first",
            "action": "suggestion_inserted",
            "user_id": userId,
            "item_id": bestCandidate.feed_item_id,
            "reason": "preferences_match",
            "score": bestCandidate.score,
            "row_id": suggestion.id,
            "sent_at": null
          }))

          notificationsQueued++

          // Try to send the push notification via existing webpush-send function
          try {
            // TASK 7: Pre-send logging
            console.log(JSON.stringify({
              "phase": "prefs-first",
              "action": "send_start", 
              "user_id": userId,
              "suggestion_id": suggestion.id,
              "item_id": bestCandidate.feed_item_id
            }))

          // TASK 1: Lookup subscription PRIMA del push usando v_latest_webpush_subscription
            let sub, subErr
            try {
              // Try with the view first (preferred)
              const viewResult = await supabase
                .from('v_latest_webpush_subscription')
                .select('sub_id, created_at, endpoint')
                .eq('user_id', userId)
                .maybeSingle()
              
              if (viewResult.data) {
                sub = viewResult.data
                subErr = viewResult.error
              } else {
                // Fallback to table if view doesn't exist
                const tableResult = await supabase
                  .from('webpush_subscriptions')
                  .select('id as sub_id, created_at, endpoint')
                  .eq('user_id', userId)
                  .eq('is_active', true)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle()
                sub = tableResult.data
                subErr = tableResult.error
              }
            } catch (error: any) {
              if (error.code === '22P02') {
                console.log(JSON.stringify({ 
                  phase: 'prefs-first', 
                  action: 'uuid_syntax_error', 
                  code: '22P02', 
                  operation: 'subscription_lookup',
                  user_id: userId
                }))
                continue
              }
              subErr = error
            }

            if (sub) {
              // TASK 1: Log subscription found
              console.log(JSON.stringify({
                "phase": "prefs-first",
                "action": "subscription_found",
                "user_id": userId,
                "sub_id": sub.sub_id,
                "created_at": sub.created_at
              }))

              // Get full subscription details for push
              const { data: subscription } = await supabase
                .from('webpush_subscriptions')
                .select('*')
                .eq('id', sub.sub_id)
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
                title: `🎯 ${bestCandidate.title.substring(0, 50)}...`,
                body: bestCandidate.summary?.substring(0, 120) + '...' || 'New content available',
                data: {
                  type: 'preferences_notification',
                  item_id: bestCandidate.feed_item_id,
                  url: bestCandidate.url,
                  score: bestCandidate.score,
                  reason: "preferences_match"
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
                    user_id: userId,
                    last_reset: new Date().toISOString(),
                    sent_today: currentSent + 1
                  })

                notificationsSent++
                
                // TASK 7: Post-send success logging
                console.log(JSON.stringify({
                  "phase": "prefs-first",
                  "action": "send_done",
                  "status": "success",
                  "sent_at": new Date().toISOString()
                }))
                
                console.log(`🔔 [NOTIFIER-ENGINE] Sent preferences notification to user ${userId}: ${bestCandidate.title}`)
              } else {
                const errorText = await pushResponse.text()
                
                // TASK 7: Post-send failure logging
                console.log(JSON.stringify({
                  "phase": "prefs-first",
                  "action": "send_done",
                  "status": "failed",
                  "error": errorText
                }))
                
                console.error(`🔔 [NOTIFIER-ENGINE] Failed to send push to user ${userId}:`, errorText)
              }
              }
            } else {
              // TASK 1: Log no active subscription found e SKIP push (ma l'INSERT resta)
              console.log(JSON.stringify({
                "phase": "prefs-first",
                "action": "no_active_subscription",
                "user_id": userId
              }))
            }
          } catch (pushError) {
            console.error(`🔔 [NOTIFIER-ENGINE] Push error for user ${userId}:`, pushError)
          }
        }

      } catch (userError) {
        console.error(`🔔 [NOTIFIER-ENGINE] Error processing preferences user ${userId}:`, userError)
      }
    }

    // SIGNALS-BASED FALLBACK BRANCH (existing logic for users with profiles)
    if (profiles && profiles.length > 0 && feedItems && feedItems.length > 0) {
      console.log(`🔔 [NOTIFIER-ENGINE] Processing ${profiles.length} users with signals fallback...`)
      
      for (const profile of profiles as UserProfile[]) {
        try {
          // Skip if user already processed in preferences branch
          if (validUserIds.includes(profile.user_id)) {
            continue
          }

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
              console.log(JSON.stringify({
                phase: "signals-based",
                action: "insert_failed",
                user_id: profile.user_id,
                error: suggestionError.message
              }))
              console.error(`🔔 [NOTIFIER-ENGINE] Error creating suggestion for user ${profile.user_id}:`, suggestionError)
              continue
            }

            // Structured logging after successful insert
            console.log(JSON.stringify({
              phase: 'signals-based',
              action: 'suggestion_inserted',
              user_id: profile.user_id,
              item_id: bestMatch.item.id,
              reason: bestMatch.reason,
              score: bestMatch.score,
              row_id: suggestion.id,
              sent_at: null
            }))

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
    }

    console.log(`🔔 [NOTIFIER-ENGINE] Completed: ${notificationsSent} sent, ${notificationsQueued} queued`)
    console.log(`🔔 [NOTIFIER-ENGINE] Preferences users: ${validUserIds.length}, Signals users: ${profiles?.length || 0}`)

    return new Response(JSON.stringify({ 
      success: true, 
      notificationsSent,
      notificationsQueued,
      preferencesUsersProcessed: validUserIds.length,
      profilesProcessed: profiles?.length || 0,
      feedItemsAvailable: feedItems?.length || 0
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