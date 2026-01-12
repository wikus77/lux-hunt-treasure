/**
 * Risiko Domination — Decay Job
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * SCOPO: Decay passivo dei paesi non difesi
 * - Se owner non combatte nel paese per 6 ore → -1 win_progress
 * - Quando progress scende sotto soglia → paese torna contested/neutral
 * 
 * SCHEDULAZIONE: Ogni 6 ore via Supabase cron o external scheduler
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const DECAY_AMOUNT = 1;
const DECAY_HOURS = 6;

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate admin token (optional security)
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('DECAY_ADMIN_TOKEN');
    
    if (expectedToken && adminToken !== expectedToken) {
      console.warn('[Decay] Invalid admin token');
      // Continue anyway for scheduled jobs without token
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Decay] Starting decay job...');

    // Find countries with owners that haven't been defended in 6+ hours
    const cutoffTime = new Date(Date.now() - DECAY_HOURS * 60 * 60 * 1000).toISOString();

    const { data: decayableCountries, error: fetchError } = await supabase
      .from('country_domination')
      .select('country_code, owner_id, win_progress, status, last_activity_at')
      .not('owner_id', 'is', null)
      .gt('win_progress', 0)
      .lt('last_activity_at', cutoffTime);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`[Decay] Found ${decayableCountries?.length || 0} countries eligible for decay`);

    let decayedCount = 0;
    let statusChanges: Array<{ country: string, oldStatus: string, newStatus: string }> = [];

    for (const country of decayableCountries || []) {
      // Check if owner has any wins in this country in last 6 hours
      const { data: recentWins, error: winsError } = await supabase
        .from('country_battle_wins')
        .select('id')
        .eq('winner_id', country.owner_id)
        .eq('country_code', country.country_code)
        .gt('won_at', cutoffTime)
        .limit(1);

      if (winsError) {
        console.error(`[Decay] Error checking wins for ${country.country_code}:`, winsError);
        continue;
      }

      // If owner has recent wins, skip decay
      if (recentWins && recentWins.length > 0) {
        console.log(`[Decay] ${country.country_code}: Owner has recent activity, skipping`);
        continue;
      }

      // Apply decay
      const newProgress = Math.max(0, country.win_progress - DECAY_AMOUNT);
      
      // Calculate new status
      const { data: thresholdData } = await supabase
        .from('country_domination')
        .select('conquest_threshold')
        .eq('country_code', country.country_code)
        .single();
      
      const threshold = thresholdData?.conquest_threshold || 21;
      let newStatus = country.status;
      
      if (newProgress < threshold) {
        if (newProgress >= Math.ceil(threshold * 0.8)) {
          newStatus = 'contested';
        } else {
          newStatus = 'neutral';
        }
      }

      // Update country
      const { error: updateError } = await supabase
        .from('country_domination')
        .update({
          win_progress: newProgress,
          status: newStatus,
          // Clear owner if back to neutral
          owner_id: newStatus === 'neutral' ? null : country.owner_id,
          conquered_at: newStatus === 'neutral' ? null : undefined
        })
        .eq('country_code', country.country_code);

      if (updateError) {
        console.error(`[Decay] Error updating ${country.country_code}:`, updateError);
        continue;
      }

      decayedCount++;
      
      if (newStatus !== country.status) {
        statusChanges.push({
          country: country.country_code,
          oldStatus: country.status,
          newStatus
        });
        console.log(`[Decay] ${country.country_code}: ${country.status} → ${newStatus}`);
      }
    }

    const result = {
      success: true,
      processed: decayableCountries?.length || 0,
      decayed: decayedCount,
      statusChanges,
      timestamp: new Date().toISOString()
    };

    console.log('[Decay] Job completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error('[Decay] Job error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

