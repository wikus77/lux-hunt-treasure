// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, any>;

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors() });
    }

    const body = await req.json().catch(() => ({}));
    const markerId = String((body?.markerId || "")).trim();
    if (!markerId) return json({ status: "error", error: "missing_marker_id" }, 400);

    // Client with JWT for RLS compliance
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Admin client for system operations
    const admin = createClient(url, service);

    // Get current user
    const { data: auth } = await userClient.auth.getUser();
    const user_id = auth?.user?.id;
    if (!user_id) return json({ ok: false, code: "UNAUTHORIZED" }, 401);

    console.log(`M1QR-TRACE: claim-marker-reward start - user:${user_id} marker:${markerId}`);

    // Check if already claimed
    const { data: existingClaim } = await userClient
      .from("marker_claims")
      .select("id")
      .eq("user_id", user_id)
      .eq("marker_id", markerId)
      .maybeSingle();

    if (existingClaim) {
      console.log(`M1QR-TRACE: already claimed - user:${user_id} marker:${markerId}`);
      return json({ ok: false, code: "ALREADY_CLAIMED" }, 200);
    }

    // Get all rewards for this marker
    const { data: rewards, error: rewardsError } = await userClient
      .from("marker_rewards")
      .select("reward_type, payload, description")
      .eq("marker_id", markerId);

    if (rewardsError) {
      console.error(`M1QR-TRACE: rewards fetch error:`, rewardsError);
      return json({ status: "error", error: "db_error", detail: rewardsError.message }, 500);
    }

    if (!rewards || rewards.length === 0) {
      console.log(`M1QR-TRACE: no rewards found - marker:${markerId}`);
      return json({ ok: false, code: "NO_REWARD" }, 404);
    }

    // Start transaction - create claim first
    const { error: claimError } = await admin
      .from("marker_claims")
      .insert([{ user_id, marker_id: markerId }]);

    if (claimError) {
      console.error(`M1QR-TRACE: claim creation error:`, claimError);
      return json({ status: "error", error: "claim_failed", detail: claimError.message }, 500);
    }

    // Process each reward
    const summary: Array<{type: string, info: any}> = [];
    let nextRoute: string | null = null;

    for (const reward of rewards) {
      const { reward_type, payload } = reward;
      
      try {
        switch (reward_type) {
          case 'buzz_free': {
            const buzzCount = payload.buzzCount || 1;
            const { error: buzzError } = await admin
              .from("buzz_grants")
              .upsert({
                user_id,
                source: `marker:${markerId}`,
                remaining: buzzCount
              }, {
                onConflict: 'user_id,source',
                ignoreDuplicates: false
              });
            
            if (buzzError) throw buzzError;
            summary.push({ type: 'buzz_free', info: { count: buzzCount } });
            if (!nextRoute) nextRoute = '/buzz';
            break;
          }

          case 'message': {
            const message = payload.text || "Ricompensa ottenuta!";
            const { error: notificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: 'Ricompensa Marker',
                message,
                metadata: { source: `marker:${markerId}` }
              }]);
            
            if (notificationError) throw notificationError;
            summary.push({ type: 'message', info: { text: message } });
            if (!nextRoute) nextRoute = '/notifications';
            break;
          }

          case 'xp_points': {
            const xpPoints = payload.xp || 10;
            const { error: xpError } = await admin
              .from("user_xp")
              .upsert({
                user_id,
                total_xp: 0 // Will be incremented by the upsert
              }, {
                onConflict: 'user_id'
              });
            
            if (!xpError) {
              // Increment XP
            const { error: incrementError } = await admin.rpc('increment_xp', {
              p_user: user_id,
              p_amount: xpPoints
            });
              if (incrementError) {
                // Fallback: direct update
                await admin
                  .from("user_xp")
                  .update({ total_xp: admin.from("user_xp").select("total_xp").eq("user_id", user_id) })
                  .eq("user_id", user_id);
              }
            }
            
            summary.push({ type: 'xp_points', info: { xp: xpPoints } });
            break;
          }

          case 'event_ticket': {
            const eventId = payload.event_id;
            const ticketType = payload.ticket_type || 'standard';
            const { error: ticketError } = await admin
              .from("event_tickets")
              .insert([{
                user_id,
                event_id: eventId,
                ticket_type: ticketType,
                source: `marker:${markerId}`
              }]);
            
            if (ticketError) throw ticketError;
            summary.push({ type: 'event_ticket', info: { event_id: eventId, ticket_type: ticketType } });
            if (!nextRoute) nextRoute = '/profile';
            break;
          }

          case 'badge': {
            const badgeId = payload.badge_id;
            const { error: badgeError } = await admin
              .from("user_badges")
              .insert([{
                user_id,
                badge_id: badgeId,
                source: `marker:${markerId}`
              }]);
            
            if (badgeError) throw badgeError;
            summary.push({ type: 'badge', info: { badge_id: badgeId } });
            if (!nextRoute) nextRoute = '/profile';
            break;
          }

          default:
            console.warn(`M1QR-TRACE: unknown reward type: ${reward_type}`);
        }
      } catch (rewardError) {
        console.error(`M1QR-TRACE: reward processing error (${reward_type}):`, rewardError);
        // Continue with other rewards, don't fail completely
        summary.push({ type: reward_type, info: { error: String(rewardError) } });
      }
    }

    console.log(`M1QR-TRACE: claim success - user:${user_id} marker:${markerId} rewards:${rewards.map(r => r.reward_type).join(',')}`);

    return json({
      ok: true,
      nextRoute,
      summary
    }, 200);

  } catch (e) {
    console.error(`M1QR-TRACE: claim-marker-reward error:`, e);
    return json({ status: "error", error: "internal_error", detail: String(e?.message ?? e) }, 500);
  }
}, { onError: (e) => console.error(e) });

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  };
}

function json(payload: Json, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { "content-type": "application/json", ...cors() }
  });
}