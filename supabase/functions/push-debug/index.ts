/**
 * M1SSION™ Push Debug Endpoint
 * © 2025 Joseph MULÉ – ALL RIGHTS RESERVED
 * 
 * Diagnostic endpoint to test entire push pipeline
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import webpush from "npm:web-push@3.6.7";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    version: '2026-01-20-v2-USER-CHECK',
    checks: {}
  };

  try {
    // 1. CHECK SECRETS
    results.checks.secrets = {
      SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      VAPID_PUBLIC_KEY: !!Deno.env.get('VAPID_PUBLIC_KEY'),
      VAPID_PRIVATE_KEY: !!Deno.env.get('VAPID_PRIVATE_KEY'),
      VAPID_CONTACT: !!Deno.env.get('VAPID_CONTACT'),
      // Show first 20 chars of VAPID_PUBLIC for verification
      VAPID_PUBLIC_KEY_PREFIX: Deno.env.get('VAPID_PUBLIC_KEY')?.substring(0, 20) || 'MISSING'
    };

    // 2. CHECK DB CONNECTION
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. COUNT SUBSCRIPTIONS
    const { count: webpushCount, error: webpushError } = await supabase
      .from('webpush_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    results.checks.webpush_subscriptions = {
      active_count: webpushCount ?? 0,
      error: webpushError?.message || null
    };

    // 4. COUNT OTHER TABLES
    const { count: fcmCount } = await supabase
      .from('fcm_subscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: pushTokensCount } = await supabase
      .from('push_tokens')
      .select('*', { count: 'exact', head: true });

    results.checks.other_tables = {
      fcm_subscriptions: fcmCount ?? 0,
      push_tokens: pushTokensCount ?? 0
    };

    // 5. TEST VAPID CONFIG
    try {
      webpush.setVapidDetails(
        Deno.env.get('VAPID_CONTACT')!,
        Deno.env.get('VAPID_PUBLIC_KEY')!,
        Deno.env.get('VAPID_PRIVATE_KEY')!
      );
      results.checks.vapid_config = { valid: true };
    } catch (vapidError: any) {
      results.checks.vapid_config = { valid: false, error: vapidError.message };
    }

    // 5b. CHECK SPECIFIC USER SUBSCRIPTIONS (if user_id provided)
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.user_id || body.target_user;
    
    if (targetUserId) {
      const { data: userSubs, error: userSubsError } = await supabase
        .from('webpush_subscriptions')
        .select('id, endpoint, is_active, created_at')
        .eq('user_id', targetUserId);
      
      results.checks.target_user = {
        user_id: targetUserId,
        subscriptions_count: userSubs?.length || 0,
        active_count: userSubs?.filter((s: any) => s.is_active).length || 0,
        subscriptions: userSubs?.map((s: any) => ({
          id: s.id,
          endpoint_tail: s.endpoint?.substring(s.endpoint.length - 40),
          is_active: s.is_active,
          created_at: s.created_at
        })) || [],
        error: userSubsError?.message || null
      };
    }

    // 6. GET SAMPLE SUBSCRIPTION (if any)
    const { data: sampleSub } = await supabase
      .from('webpush_subscriptions')
      .select('id, endpoint, user_id, is_active, created_at')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (sampleSub) {
      results.checks.sample_subscription = {
        id: sampleSub.id,
        endpoint_tail: sampleSub.endpoint?.substring(sampleSub.endpoint.length - 30),
        user_id: sampleSub.user_id?.substring(0, 8) + '...',
        created_at: sampleSub.created_at
      };

      // 7. TRY SENDING TEST PUSH (if subscription exists and test=true in body)
      if (body.test_send === true) {
        try {
          // Use target user's subscription if specified, otherwise use sample
          const subQuery = targetUserId 
            ? supabase.from('webpush_subscriptions').select('id, endpoint, keys').eq('user_id', targetUserId).eq('is_active', true).limit(1).single()
            : supabase.from('webpush_subscriptions').select('endpoint, keys').eq('id', sampleSub.id).single();
          
          const { data: fullSub } = await subQuery;

          if (fullSub?.endpoint && fullSub?.keys) {
            const pushPayload = JSON.stringify({
              title: '🧪 M1SSION Test Push',
              body: 'Push pipeline debug - ' + new Date().toISOString(),
              url: '/home'
            });

            const pushResult = await webpush.sendNotification(
              {
                endpoint: fullSub.endpoint,
                keys: fullSub.keys as { p256dh: string; auth: string }
              },
              pushPayload
            );

            results.checks.test_push = {
              success: true,
              statusCode: pushResult.statusCode,
              body: pushResult.body?.substring(0, 100)
            };
          }
        } catch (pushError: any) {
          results.checks.test_push = {
            success: false,
            error: pushError.message,
            statusCode: pushError.statusCode
          };
        }
      }
    } else {
      results.checks.sample_subscription = null;
      results.checks.test_push = { skipped: 'No active subscriptions to test' };
    }

    // 8. CHECK USER OVERLAP (cron users vs subscription users)
    const { data: cronUsers } = await supabase
      .from('profiles')
      .select('id')
      .limit(100);
    
    const { data: subUsers } = await supabase
      .from('webpush_subscriptions')
      .select('user_id')
      .eq('is_active', true);
    
    const cronUserIds = new Set((cronUsers || []).map((u: any) => u.id));
    const subUserIds = new Set((subUsers || []).map((u: any) => u.user_id));
    
    let overlap = 0;
    subUserIds.forEach(uid => {
      if (cronUserIds.has(uid)) overlap++;
    });
    
    // Find users that HAVE both profile and subscription
    const usersWithBoth: string[] = [];
    subUserIds.forEach(uid => {
      if (cronUserIds.has(uid)) usersWithBoth.push(uid);
    });
    
    results.checks.user_overlap = {
      profiles_count: cronUserIds.size,
      subscription_users: subUserIds.size,
      overlap: overlap,
      users_with_both: usersWithBoth.slice(0, 5), // First 5 users that have both
      issue: overlap === 0 ? 'NO OVERLAP! Subscriptions belong to users not in cron batch!' : null
    };

    // FINAL STATUS
    results.status = 'OK';
    results.diagnosis = results.checks.webpush_subscriptions.active_count === 0
      ? 'NO_SUBSCRIPTIONS - Frontend is not saving subscriptions to DB'
      : overlap === 0 
        ? 'USER_MISMATCH - Subscriptions exist but for different users than cron processes'
        : 'SUBSCRIPTIONS_EXIST - Check push delivery';

  } catch (error: any) {
    results.status = 'ERROR';
    results.error = error.message;
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
});

