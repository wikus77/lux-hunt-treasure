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
      const { reward_type, payload, description } = reward;
      
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
            
            // ALWAYS create notification for buzz rewards
            const { error: buzzNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: 'BUZZ Gratuito Ricevuto!',
                message: `Hai ricevuto ${buzzCount} BUZZ gratuiti dal marker ${markerId}`,
                metadata: { source: `marker:${markerId}`, reward_type: 'buzz_free', count: buzzCount }
              }]);
            
            if (buzzNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for buzz:`, buzzNotificationError);
            } else {
              console.log(`M1QR-TRACE: buzz notification created successfully`);
            }
            
            summary.push({ type: 'buzz_free', info: { count: buzzCount } });
            if (!nextRoute) nextRoute = '/buzz';
            break;
          }

          case 'message': {
            const message = payload.text || description || "Ricompensa ottenuta!";
            
            // Validate message content - filter out corrupted text
            const cleanMessage = message.trim();
            if (!cleanMessage || cleanMessage.length < 2 || /^[^\w\s]*$/.test(cleanMessage)) {
              console.warn(`M1QR-TRACE: corrupted message detected: "${message}", using fallback`);
              const fallbackMessage = "Hai ottenuto un premio speciale dal marker!";
              
              // Still create notification with fallback message
              const { error: messageNotificationError } = await admin
                .from("user_notifications")
                .insert([{
                  user_id,
                  notification_type: 'reward',
                  title: 'Premio Messaggio',
                  message: fallbackMessage,
                  metadata: { source: `marker:${markerId}`, reward_type: 'message', original_message: message }
                }]);
              
              if (messageNotificationError) {
                console.error(`M1QR-TRACE: notification creation error for message:`, messageNotificationError);
              }
              
              summary.push({ type: 'message', info: { text: fallbackMessage } });
            } else {
              // Create notification with clean message
              const { error: notificationError } = await admin
                .from("user_notifications")
                .insert([{
                  user_id,
                  notification_type: 'reward',
                  title: 'Premio Messaggio',
                  message: cleanMessage,
                  metadata: { source: `marker:${markerId}`, reward_type: 'message' }
                }]);
              
              if (notificationError) {
                console.error(`M1QR-TRACE: notification creation error for message:`, notificationError);
              } else {
                console.log(`M1QR-TRACE: message notification created successfully`);
              }
              
              summary.push({ type: 'message', info: { text: cleanMessage } });
            }
            
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
            
            // Create notification for XP rewards
            const { error: xpNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: 'Punti Esperienza Ricevuti!',
                message: `Hai guadagnato ${xpPoints} punti esperienza dal marker ${markerId}`,
                metadata: { source: `marker:${markerId}`, reward_type: 'xp_points', xp: xpPoints }
              }]);
            
            if (xpNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for XP:`, xpNotificationError);
            } else {
              console.log(`M1QR-TRACE: XP notification created successfully`);
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
            
            // Create notification for event ticket
            const { error: ticketNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: 'Biglietto Evento Ricevuto!',
                message: `Hai ricevuto un biglietto ${ticketType} per l'evento ${eventId}`,
                metadata: { source: `marker:${markerId}`, reward_type: 'event_ticket', event_id: eventId, ticket_type: ticketType }
              }]);
            
            if (ticketNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for ticket:`, ticketNotificationError);
            }
            
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
            
            // Create notification for badge
            const { error: badgeNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: 'Distintivo Sbloccato!',
                message: `Hai sbloccato un nuovo distintivo dal marker ${markerId}`,
                metadata: { source: `marker:${markerId}`, reward_type: 'badge', badge_id: badgeId }
              }]);
            
            if (badgeNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for badge:`, badgeNotificationError);
            }
            
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(payload: Json, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { "content-type": "application/json", ...cors() }
  });
}