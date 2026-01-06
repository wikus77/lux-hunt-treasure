// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Edge Function: get-spectator-summary - Public aggregated telemetry for Spectator Mode

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "public, max-age=10", // Cache for 10 seconds
};

// Base participant count (marketing baseline)
const BASE_PARTICIPANTS = 3172;

// Mission configuration
const MISSION_START = new Date('2025-12-19T19:00:00Z');
const MISSION_END = new Date('2026-01-19T19:00:00Z');
const NEXT_MISSION = new Date('2026-01-01T19:00:00Z');
const TOTAL_DAYS = 31;

// Activity templates for anonymous feed
const ACTIVITY_TEMPLATES = [
  { type: 'buzz', text: 'Un agente ha speso Buzz', icon: '⚡' },
  { type: 'area', text: 'Nuova area generata', icon: '🗺️' },
  { type: 'clue', text: 'Indizio sbloccato', icon: '🔍' },
  { type: 'join', text: 'Nuovo agente registrato', icon: '👤' },
  { type: 'mission', text: 'Accesso alla missione', icon: '🎯' },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only GET allowed
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // 1. Calculate mission progress (days passed / total days)
    const daysPassed = Math.floor((now.getTime() - MISSION_START.getTime()) / (1000 * 60 * 60 * 24));
    const missionProgress = Math.min(100, Math.max(0, Math.round((daysPassed / TOTAL_DAYS) * 100)));

    // 2. Get active participants (unique users with activity in last 24h)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    // Count users with recent buzz activity
    const { count: activeBuzzUsers } = await supabase
      .from('user_buzz_counter')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', last24h);
    
    // Count users with recent map activity
    const { count: activeMapUsers } = await supabase
      .from('user_map_areas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h);
    
    const activePlayersReal = (activeBuzzUsers || 0) + (activeMapUsers || 0);
    const participantsCount = BASE_PARTICIPANTS + activePlayersReal;

    // 3. Get areas consumed count
    const { count: areasConsumed } = await supabase
      .from('user_map_areas')
      .select('*', { count: 'exact', head: true });

    // 4. Get last buzz timestamp
    const { data: lastBuzz } = await supabase
      .from('buzz_activations')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let lastBuzzAgoSec = 0;
    if (lastBuzz?.created_at) {
      lastBuzzAgoSec = Math.floor((now.getTime() - new Date(lastBuzz.created_at).getTime()) / 1000);
    }

    // 5. Get clues released count
    const { count: cluesReleased } = await supabase
      .from('prize_clues')
      .select('*', { count: 'exact', head: true })
      .eq('is_released', true);

    // 6. Generate activity feed from real events (anonymized)
    const activityFeed: Array<{ type: string; ts: string; text: string; icon: string }> = [];
    
    // Get recent buzz activations
    const { data: recentBuzz } = await supabase
      .from('buzz_activations')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentBuzz) {
      recentBuzz.forEach(b => {
        activityFeed.push({
          type: 'buzz',
          ts: b.created_at,
          text: 'Un agente ha speso Buzz',
          icon: '⚡'
        });
      });
    }

    // Get recent area generations
    const { data: recentAreas } = await supabase
      .from('user_map_areas')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentAreas) {
      recentAreas.forEach(a => {
        activityFeed.push({
          type: 'area',
          ts: a.created_at,
          text: 'Nuova area generata',
          icon: '🗺️'
        });
      });
    }

    // Get recent user registrations (anonymized)
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentUsers) {
      recentUsers.forEach(u => {
        activityFeed.push({
          type: 'join',
          ts: u.created_at,
          text: 'Nuovo agente registrato',
          icon: '👤'
        });
      });
    }

    // Sort by timestamp descending and limit
    activityFeed.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    const limitedFeed = activityFeed.slice(0, 15);

    // 7. Get winners history (anonymized)
    // For now, return empty array since we don't have actual winners yet
    const winners: Array<{ ts: string; prize: string; winner: string }> = [];
    
    // If there's a winners table, query it here
    // const { data: winnersData } = await supabase.from('winners').select('*').limit(10);

    // 8. Build response
    const response = {
      missionCountdown: {
        targetDate: NEXT_MISSION.toISOString(),
        state: now < MISSION_END ? 'active' : 'ended'
      },
      missionProgress,
      participantsCount,
      activePlayersReal,
      areasConsumed: areasConsumed || 0,
      cluesReleased: cluesReleased || 0,
      lastBuzzAgoSec,
      activityFeed: limitedFeed,
      winners,
      timestamp: now.toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Spectator summary error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

