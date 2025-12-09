// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";
import { applyRateLimit } from "../_shared/rateLimit.ts";

type Json = Record<string, any>;

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(withCors(async (req) => {
  try {

    const body = await req.json().catch(() => ({}));
    const markerId = String((body?.markerId || "")).trim();
    if (!markerId) return jsonResponse({ status: "error", error: "missing_marker_id" }, 400);

    // Client with JWT for RLS compliance
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Admin client for system operations
    const admin = createClient(url, service);

    // Get current user
    const { data: auth } = await userClient.auth.getUser();
    const user_id = auth?.user?.id;
    if (!user_id) return jsonResponse({ ok: false, code: "UNAUTHORIZED" }, 401);

    // 🔐 Rate limiting check
    const rateLimited = await applyRateLimit(req, 'claim-marker-reward', user_id);
    if (rateLimited) return rateLimited;

    console.log(`M1QR-TRACE: claim-marker-reward start - user:...${user_id.slice(-8)} marker:${markerId}`);

    // Check if already claimed
    const { data: existingClaim } = await userClient
      .from("marker_claims")
      .select("id")
      .eq("user_id", user_id)
      .eq("marker_id", markerId)
      .maybeSingle();

    if (existingClaim) {
      console.log(`M1QR-TRACE: already claimed - user:...${user_id.slice(-8)} marker:${markerId}`);
      return jsonResponse({ ok: false, code: "ALREADY_CLAIMED" }, 200);
    }

    // Get all rewards for this marker
    const { data: rewards, error: rewardsError } = await userClient
      .from("marker_rewards")
      .select("reward_type, payload, description")
      .eq("marker_id", markerId);

    if (rewardsError) {
      console.error(`M1QR-TRACE: rewards fetch error:`, rewardsError);
      return jsonResponse({ status: "error", error: "db_error", detail: rewardsError.message }, 500);
    }

    // 🔍 DEBUG: Log raw rewards data to see exactly what's in DB
    console.log(`M1QR-TRACE: RAW REWARDS from DB:`, JSON.stringify(rewards));

    if (!rewards || rewards.length === 0) {
      console.log(`M1QR-TRACE: no rewards found - marker:${markerId}`);
      return jsonResponse({ ok: false, code: "NO_REWARD" }, 404);
    }

    // Start transaction - create claim first
    const { error: claimError } = await admin
      .from("marker_claims")
      .insert([{ user_id, marker_id: markerId }]);

    if (claimError) {
      console.error(`M1QR-TRACE: claim creation error:`, claimError);
      return jsonResponse({ status: "error", error: "claim_failed", detail: claimError.message }, 500);
    }

    // 🚀 PUSH NOTIFICATION IMMEDIATA (in parallelo, non blocca)
    const sendPushAsync = async () => {
      try {
        // WebPush diretto - più veloce
        const pushRes = await fetch(`${url}/functions/v1/webpush-targeted-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': Deno.env.get('PUSH_ADMIN_TOKEN') || service,
          },
          body: JSON.stringify({
            user_ids: [user_id],
            payload: {
              title: '🎁 Premio Trovato!',
              body: 'Hai trovato un marker reward su M1SSION™!',
              url: '/profile'
            }
          }),
        });
        console.log(`M1QR-TRACE: Push sent - status:${pushRes.status}`);
      } catch (e) {
        console.warn(`M1QR-TRACE: Push async error:`, e);
      }
    };
    
    // Avvia push in background (non aspettare)
    sendPushAsync();

    // Process each reward
    const summary: Array<{type: string, info: any}> = [];
    let nextRoute: string | null = null;

    for (const reward of rewards) {
      const { reward_type, payload, description } = reward;
      // 🔥 FIX: trim + lowercase per gestire spazi, newline, e case
      const rewardTypeLower = (reward_type || '').toString().trim().toLowerCase();
      
      console.log(`M1QR-TRACE: Processing reward type: "${reward_type}" -> "${rewardTypeLower}", payload:`, JSON.stringify(payload));
      
      try {
        switch (rewardTypeLower) {
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

          // 🔥 M1U Credits - USA RPC admin_credit_m1u (bypassa trigger sicurezza)
          case 'm1u': {
            // 🛡️ SAFE: Se payload è stringa (JSON non parsato), parsalo
            let safePayload = payload;
            if (typeof payload === 'string') {
              try {
                safePayload = JSON.parse(payload);
              } catch {
                safePayload = {};
              }
            }
            
            const m1uAmount = Math.max(1, Number(safePayload?.amount) || Number(safePayload?.m1u) || 50);
            console.log(`M1QR-TRACE: 💰 M1U START - amount:${m1uAmount}, user:...${user_id.slice(-8)}`);
            
            // 🔥 USA RPC admin_credit_m1u (bypassa trigger sicurezza)
            const { data: rpcResult, error: rpcError } = await admin.rpc('admin_credit_m1u', {
              p_user_id: user_id,
              p_amount: m1uAmount,
              p_reason: `marker_reward:${markerId}`
            });
            
            console.log(`M1QR-TRACE: 💰 RPC RESULT:`, JSON.stringify(rpcResult), `error:`, rpcError);
            
            if (rpcError) {
              console.error(`M1QR-TRACE: ❌ RPC ERROR:`, rpcError);
              summary.push({ type: 'm1u', info: { error: 'rpc_failed', detail: rpcError.message } });
              break;
            }
            
            if (!rpcResult?.success) {
              console.error(`M1QR-TRACE: ❌ RPC FAILED:`, rpcResult?.error);
              summary.push({ type: 'm1u', info: { error: rpcResult?.error || 'rpc_failed' } });
              break;
            }
            
            const oldBalance = rpcResult.old_balance;
            const newBalance = rpcResult.new_balance;
            
            console.log(`M1QR-TRACE: ✅ M1U SUCCESS - ${oldBalance} → ${newBalance} (+${m1uAmount})`);
            summary.push({ type: 'm1u', info: { amount: m1uAmount, old_balance: oldBalance, new_balance: newBalance } });
            
            // Notifica in-app
            await admin.from("user_notifications").insert([{
              user_id,
              notification_type: 'reward',
              title: '💰 M1U Ricevuti!',
              message: `+${m1uAmount} M1U accreditati! Nuovo saldo: ${newBalance}`,
              metadata: { reward_type: 'm1u', amount: m1uAmount, new_balance: newBalance }
            }]).catch(e => console.warn('M1QR-TRACE: notif error:', e));
            
            if (!nextRoute) nextRoute = '/profile';
            break;
          }

          // 🔥 NEW: Clue (Indizio) linked to active mission
          case 'clue': {
            const clueText = payload.text || description || "Indizio segreto trovato!";
            const clueType = payload.clue_type || 'location'; // 'location' or 'prize'
            
            // Get active mission
            const { data: activeMission } = await admin
              .from("missions")
              .select("id, title")
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            
            const missionId = activeMission?.id || null;
            
            // Insert clue into user_clues table
            const { error: clueError } = await admin
              .from("user_clues")
              .insert([{
                user_id,
                mission_id: missionId,
                clue_text: clueText,
                clue_type: clueType,
                source: `marker:${markerId}`,
                is_unlocked: true,
                unlocked_at: new Date().toISOString()
              }]);
            
            if (clueError) {
              console.error(`M1QR-TRACE: clue insertion error:`, clueError);
              // Don't throw - continue with notification
            }
            
            // Create notification for clue (saved in Notice)
            const { error: clueNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'clue',
                title: '🔍 Indizio Trovato!',
                message: clueText,
                metadata: { 
                  source: `marker:${markerId}`, 
                  reward_type: 'clue', 
                  clue_type: clueType,
                  mission_id: missionId,
                  mission_title: activeMission?.title || 'Missione Attiva'
                }
              }]);
            
            if (clueNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for clue:`, clueNotificationError);
            } else {
              console.log(`M1QR-TRACE: Clue notification created successfully`);
            }
            
            summary.push({ type: 'clue', info: { text: clueText, mission_id: missionId } });
            if (!nextRoute) nextRoute = '/notice';
            break;
          }

          // 🔥 NEW: Physical Prize (iPhone, AirPods, GoPro, etc.)
          case 'physical_prize': {
            const prizeName = payload.prize_name || 'Premio Fisico';
            const prizeDescription = payload.description || description || prizeName;
            
            // Generate unique claim code
            const claimCode = `M1-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            
            // Insert into prize_claims table
            const { error: prizeClaimError } = await admin
              .from("prize_claims")
              .insert([{
                user_id,
                marker_id: markerId,
                prize_name: prizeName,
                prize_description: prizeDescription,
                claim_code: claimCode,
                status: 'pending', // pending, verified, shipped, delivered
                claimed_at: new Date().toISOString()
              }]);
            
            if (prizeClaimError) {
              console.error(`M1QR-TRACE: prize claim insertion error:`, prizeClaimError);
              // Continue with notification even if claim table fails
            }
            
            // Create notification with claim code
            const { error: prizeNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'prize',
                title: `🎉 PREMIO VINTO: ${prizeName}!`,
                message: `Congratulazioni! Hai vinto ${prizeName}! Il tuo codice di riscatto è: ${claimCode}. Conserva questo codice per ritirare il premio.`,
                metadata: { 
                  source: `marker:${markerId}`, 
                  reward_type: 'physical_prize',
                  prize_name: prizeName,
                  claim_code: claimCode,
                  status: 'pending'
                }
              }]);
            
            if (prizeNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for physical prize:`, prizeNotificationError);
            } else {
              console.log(`M1QR-TRACE: Physical prize notification created - Code: ${claimCode}`);
            }
            
            // Log admin alert for physical prize
            await admin
              .from('admin_logs')
              .insert({
                event_type: 'physical_prize_claimed',
                user_id,
                note: `🎁 PHYSICAL PRIZE CLAIMED: ${prizeName} - Code: ${claimCode}`,
                context: `marker:${markerId},prize:${prizeName},code:${claimCode}`
              });
            
            summary.push({ type: 'physical_prize', info: { prize_name: prizeName, claim_code: claimCode } });
            if (!nextRoute) nextRoute = '/notifications';
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

    // Push già inviata all'inizio in parallelo - qui solo log finale
    console.log(`M1QR-TRACE: ✅ CLAIM COMPLETE - user:...${user_id.slice(-8)} marker:${markerId} rewards:${summary.length}`);

    return jsonResponse({
      ok: true,
      nextRoute: nextRoute || '/profile',
      summary
    }, 200);

  } catch (e) {
    console.error(`M1QR-TRACE: claim-marker-reward error:`, e);
    return jsonResponse({ status: "error", error: "internal_error", detail: String(e?.message ?? e) }, 500);
  }
}));

// Helper function for JSON responses (CORS handled by withCors wrapper)
function jsonResponse(payload: Json, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { "content-type": "application/json" }
  });
}