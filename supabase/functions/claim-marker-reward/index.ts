// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

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
      const rewardTypeLower = (reward_type || '').toLowerCase(); // 🔥 FIX: case-insensitive
      
      console.log(`M1QR-TRACE: Processing reward type: "${reward_type}" -> "${rewardTypeLower}", payload:`, payload);
      
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

          // 🔥 NEW: M1U Credits reward (10-1000 M1U)
          case 'm1u': {
            const m1uAmount = Math.min(1000, Math.max(10, payload.amount || 50));
            
            // Update user's M1U balance directly
            const { data: currentProfile, error: profileError } = await admin
              .from("profiles")
              .select("m1_units")
              .eq("id", user_id)
              .single();
            
            if (profileError) throw profileError;
            
            const currentM1U = currentProfile?.m1_units || 0;
            const newM1U = currentM1U + m1uAmount;
            
            const { error: m1uError } = await admin
              .from("profiles")
              .update({ m1_units: newM1U })
              .eq("id", user_id);
            
            if (m1uError) throw m1uError;
            
            // Create notification for M1U reward
            const { error: m1uNotificationError } = await admin
              .from("user_notifications")
              .insert([{
                user_id,
                notification_type: 'reward',
                title: '💰 M1U Ricevuti!',
                message: `Hai ricevuto ${m1uAmount} M1U! Il tuo saldo è ora ${newM1U} M1U`,
                metadata: { source: `marker:${markerId}`, reward_type: 'm1u', amount: m1uAmount, new_balance: newM1U }
              }]);
            
            if (m1uNotificationError) {
              console.error(`M1QR-TRACE: notification creation error for M1U:`, m1uNotificationError);
            } else {
              console.log(`M1QR-TRACE: M1U notification created successfully - ${m1uAmount} M1U`);
            }
            
            // Dispatch event for UI refresh
            summary.push({ type: 'm1u', info: { amount: m1uAmount, new_balance: newM1U } });
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

    // 🔔 CRITICAL: Send push notification via FCM/WebPush for marker discovery
    try {
      console.log(`M1QR-TRACE: rewardClaimStarted - user:${user_id} marker:${markerId}`);
      
      // Log the reward process start
      await admin
        .from('admin_logs')
        .insert({
          event_type: 'marker_reward_claim_started',
          user_id,
          note: `Marker ${markerId} reward claim started`,
          context: `rewards:${rewards.map(r => r.reward_type).join(',')}`
        });

      console.log(`M1QR-TRACE: rewardInsertOK - sending push notification via FCM...`);
      
      // Try FCM first
      let pushSent = false;
      let pushResult: any = null;
      
      // Get FCM tokens for user
      const { data: fcmTokens } = await admin
        .from('fcm_subscriptions')
        .select('token')
        .eq('user_id', user_id)
        .eq('is_active', true);

      if (fcmTokens && fcmTokens.length > 0) {
        const fcmResponse = await fetch(`${url}/functions/v1/fcm-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${service}`,
          },
          body: JSON.stringify({
            tokens: fcmTokens.map(t => t.token),
            title: '🛡️ Premio Trovato!',
            body: 'Hai conquistato un premio segreto su M1SSION™',
            data: {
              marker_id: markerId,
              reward_types: rewards.map(r => r.reward_type).join(','),
              source: 'marker_discovery',
              url: '/profile'
            }
          }),
        });

        pushResult = await fcmResponse.json();
        if (fcmResponse.ok && pushResult.sent > 0) {
          pushSent = true;
          console.log(`M1QR-TRACE: ✅ pushSent - FCM success:`, pushResult);
        }
      }

      // Fallback to WebPush if FCM didn't work
      if (!pushSent) {
        const webpushResponse = await fetch(`${url}/functions/v1/webpush-targeted-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': Deno.env.get('PUSH_ADMIN_TOKEN') || service,
          },
          body: JSON.stringify({
            user_ids: [user_id],
            payload: {
              title: '🛡️ Premio Trovato!',
              body: 'Hai conquistato un premio segreto su M1SSION™',
              url: '/profile',
              extra: {
                marker_id: markerId,
                reward_types: rewards.map(r => r.reward_type).join(','),
                source: 'marker_discovery'
              }
            }
          }),
        });

        pushResult = await webpushResponse.json();
        if (webpushResponse.ok && pushResult.sent > 0) {
          pushSent = true;
          console.log(`M1QR-TRACE: ✅ pushSent - WebPush success:`, pushResult);
        }
      }
      
      if (pushSent) {
        // Log successful push
        await admin
          .from('admin_logs')
          .insert({
            event_type: 'marker_reward_push_sent',
            user_id,
            note: `Push sent successfully for marker ${markerId}`,
            context: `sent:${pushResult?.sent || 0}`
          });
      } else {
        console.warn(`M1QR-TRACE: ⚠️ Push notification not sent (no tokens or failed)`);
        
        // Log push skip (not a failure, just no tokens)
        await admin
          .from('admin_logs')
          .insert({
            event_type: 'marker_reward_push_skipped',
            user_id,
            note: `No push tokens available for marker ${markerId}`,
            context: 'no_tokens_or_failed'
          });
      }
    } catch (pushError) {
      console.error(`M1QR-TRACE: ❌ Push notification error:`, pushError);
      
      // Log push error
      await admin
        .from('admin_logs')
        .insert({
          event_type: 'marker_reward_push_error',
          user_id,
          note: `Push error for marker ${markerId}: ${String(pushError)}`,
          context: 'push_notification_exception'
        });
      
      // Non blocchiamo il flusso principale se il push fallisce
    }

    console.log(`M1QR-TRACE: claim success - user:${user_id} marker:${markerId} rewards:${rewards.map(r => r.reward_type).join(',')}`);

    // Log successful completion with redirect
    await admin
      .from('admin_logs')
      .insert({
        event_type: 'marker_reward_redirectOK',
        user_id,
        note: `Marker ${markerId} reward chain completed successfully - redirecting to ${nextRoute || '/profile'}`,
        context: `summary:${JSON.stringify(summary)}`
      });

    console.log(`M1QR-TRACE: ✅ redirectOK - reward chain completed for marker ${markerId}`);

    return json({
      ok: true,
      nextRoute: nextRoute || '/profile',
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