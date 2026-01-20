/**
 * M1SSION™ IAP Subscription Status Sync Edge Function
 * Syncs subscription status (expired, grace, etc.) - can be called by cron
 * 
 * ENTERPRISE HARDENING: Structured Logging + Robust Sync
 * 
 * © 2026 Joseph MULÉ – NIYVORA KFT™ – ALL RIGHTS RESERVED
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  checkRateLimit, 
  rateLimitResponse, 
  generateCorrelationId,
  structuredLog 
} from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';

serve(async (req) => {
  const correlationId = generateCorrelationId();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Auth: either cron secret or service role
    const cronSecret = req.headers.get('x-cron-secret');
    const authHeader = req.headers.get('Authorization');
    
    const isCron = cronSecret === CRON_SECRET && CRON_SECRET !== '';
    const isServiceRole = authHeader?.includes(SUPABASE_SERVICE_ROLE_KEY);
    
    if (!isCron && !isServiceRole) {
      structuredLog('warn', 'Unauthorized sync attempt', correlationId, {});
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', correlation_id: correlationId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit for non-cron calls
    if (!isCron) {
      const rateLimitResult = await checkRateLimit(
        supabaseAdmin,
        'service',
        'endpoint',
        'sync-subscription-status'
      );

      if (!rateLimitResult.allowed) {
        structuredLog('warn', 'Rate limit exceeded for sync', correlationId, {});
        return rateLimitResponse(rateLimitResult, correlationId);
      }
    }

    structuredLog('info', 'Starting subscription sync', correlationId, { isCron });

    const now = new Date();

    // =====================
    // 1. EXPIRE SUBSCRIPTIONS
    // =====================
    
    // Find active subscriptions that have expired
    const { data: expiredSubs, error: expireError } = await supabaseAdmin
      .from('user_entitlements')
      .select('user_id, sub_tier, sub_expires_at')
      .eq('sub_status', 'active')
      .lt('sub_expires_at', now.toISOString());

    if (expireError) {
      console.error('[IAP Sync] Error fetching expired subs:', expireError);
    }

    let expiredCount = 0;
    for (const sub of expiredSubs || []) {
      // Check for grace period (3 days)
      const expiresAt = new Date(sub.sub_expires_at);
      const gracePeriodEnd = new Date(expiresAt);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

      const newStatus = now > gracePeriodEnd ? 'expired' : 'grace';

      await supabaseAdmin
        .from('user_entitlements')
        .update({ 
          sub_status: newStatus,
          updated_at: now.toISOString()
        })
        .eq('user_id', sub.user_id);

      // Update profiles table
      if (newStatus === 'expired') {
        await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_tier: 'Base',
            updated_at: now.toISOString()
          })
          .eq('id', sub.user_id);
      }

      // Audit log
      await supabaseAdmin.rpc('log_iap_audit', {
        p_user_id: sub.user_id,
        p_action: newStatus === 'expired' ? 'SUBSCRIPTION_EXPIRED' : 'SUBSCRIPTION_GRACE',
        p_details: { 
          previous_tier: sub.sub_tier,
          expires_at: sub.sub_expires_at,
          grace_period_end: gracePeriodEnd.toISOString()
        }
      });

      expiredCount++;
    }

    // =====================
    // 2. FULLY EXPIRE GRACE PERIOD SUBS
    // =====================
    
    const gracePeriodThreshold = new Date(now);
    gracePeriodThreshold.setDate(gracePeriodThreshold.getDate() - 3);

    const { data: graceSubs } = await supabaseAdmin
      .from('user_entitlements')
      .select('user_id, sub_tier, sub_expires_at')
      .eq('sub_status', 'grace')
      .lt('sub_expires_at', gracePeriodThreshold.toISOString());

    for (const sub of graceSubs || []) {
      await supabaseAdmin
        .from('user_entitlements')
        .update({ 
          sub_status: 'expired',
          sub_tier: null,
          updated_at: now.toISOString()
        })
        .eq('user_id', sub.user_id);

      await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_tier: 'Base',
          updated_at: now.toISOString()
        })
        .eq('id', sub.user_id);

      await supabaseAdmin.rpc('log_iap_audit', {
        p_user_id: sub.user_id,
        p_action: 'SUBSCRIPTION_FULLY_EXPIRED',
        p_details: { previous_tier: sub.sub_tier }
      });
    }

    // =====================
    // 3. SYNC WITH SUBSCRIPTIONS TABLE
    // =====================
    
    // Ensure subscriptions table is in sync with user_entitlements
    const { data: activeEntitlements } = await supabaseAdmin
      .from('user_entitlements')
      .select('user_id, sub_tier, sub_status, sub_expires_at')
      .in('sub_status', ['active', 'grace']);

    for (const ent of activeEntitlements || []) {
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: ent.user_id,
          tier: ent.sub_tier,
          status: ent.sub_status === 'active' ? 'active' : 'grace_period',
          end_date: ent.sub_expires_at,
          updated_at: now.toISOString()
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });
    }

    // =====================
    // STATS
    // =====================
    
    const { count: activeCount } = await supabaseAdmin
      .from('user_entitlements')
      .select('*', { count: 'exact', head: true })
      .eq('sub_status', 'active');

    const { count: graceCount } = await supabaseAdmin
      .from('user_entitlements')
      .select('*', { count: 'exact', head: true })
      .eq('sub_status', 'grace');

    const { count: expiredTotal } = await supabaseAdmin
      .from('user_entitlements')
      .select('*', { count: 'exact', head: true })
      .eq('sub_status', 'expired');

    // =====================
    // CLEANUP OLD RECORDS
    // =====================
    
    // Cleanup expired rate limits
    await supabaseAdmin.rpc('cleanup_expired_rate_limits');
    
    // Cleanup expired replay tokens
    await supabaseAdmin.rpc('cleanup_expired_request_tokens');

    const stats = {
      processed: expiredCount + (graceSubs?.length || 0),
      expired_this_run: expiredCount,
      grace_expired_this_run: graceSubs?.length || 0,
      total_active: activeCount,
      total_grace: graceCount,
      total_expired: expiredTotal,
      timestamp: now.toISOString(),
      correlation_id: correlationId
    };

    structuredLog('info', 'Subscription sync completed', correlationId, stats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    structuredLog('error', 'Sync error', correlationId, { error: error.message });
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', correlation_id: correlationId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

