// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: lottery-draw-cron
 * 
 * Eseguita dal cron job per:
 * 1. Verificare cicli terminati (ends_at < now() e status = 'active')
 * 2. Eseguire l'estrazione automatica
 * 3. Creare record vincitori con deadline 15 giorni
 * 4. Inviare notifiche push a TUTTI i partecipanti
 * 5. Inviare notifiche push separate ai VINCITORI
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const CLAIM_DEADLINE_DAYS = 15;

interface Winner {
  user_id: string;
  rank: number;
  prize_m1u: number;
  prize_label: string;
  ticket_id: string;
}

interface Participant {
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  // Verify cron secret
  const providedSecret = req.headers.get('x-cron-secret');
  if (cronSecret && providedSecret !== cronSecret) {
    console.warn('[LOTTERY-CRON] ⚠️ Invalid cron secret');
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('[LOTTERY-CRON] 🎰 Starting lottery draw cron job...');

  try {
    // 1. Find cycles that need to be drawn (ended but still active)
    const { data: endedCycles, error: cyclesError } = await supabase
      .from('mission_cycles')
      .select('id, ends_at, total_tickets, total_participants, ticket_price_m1u, min_tickets_required, prizes_json')
      .eq('status', 'active')
      .lt('ends_at', new Date().toISOString());

    if (cyclesError) {
      console.error('[LOTTERY-CRON] ❌ Error fetching cycles:', cyclesError);
      return jsonResponse({ error: 'Failed to fetch cycles' }, 500);
    }

    if (!endedCycles || endedCycles.length === 0) {
      console.log('[LOTTERY-CRON] ✅ No cycles to draw');
      return jsonResponse({ ok: true, message: 'No cycles to draw', processed: 0 });
    }

    console.log(`[LOTTERY-CRON] 📋 Found ${endedCycles.length} cycle(s) to process`);

    const results = [];

    for (const cycle of endedCycles) {
      console.log(`[LOTTERY-CRON] 🎯 Processing cycle ${cycle.id}...`);
      
      try {
        // Lock cycle
        await supabase
          .from('mission_cycles')
          .update({ status: 'drawing', updated_at: new Date().toISOString() })
          .eq('id', cycle.id);

        // Get all participants
        const { data: participants, error: partError } = await supabase
          .from('lottery_tickets')
          .select('user_id')
          .eq('cycle_id', cycle.id)
          .eq('status', 'active');

        if (partError) throw partError;

        const uniqueParticipants = [...new Set(participants?.map(p => p.user_id) || [])];
        console.log(`[LOTTERY-CRON] 👥 ${uniqueParticipants.length} unique participants`);

        // Get all tickets for draw
        const { data: tickets, error: ticketsError } = await supabase
          .from('lottery_tickets')
          .select('id, user_id')
          .eq('cycle_id', cycle.id)
          .eq('status', 'active');

        if (ticketsError) throw ticketsError;

        if (!tickets || tickets.length === 0) {
          console.log(`[LOTTERY-CRON] ⚠️ No tickets for cycle ${cycle.id}, marking as completed`);
          await supabase
            .from('mission_cycles')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', cycle.id);
          continue;
        }

        // Generate random seed
        const publicSeed = crypto.randomUUID() + '-' + Date.now();
        
        // Calculate prize multiplier
        const minRequired = cycle.min_tickets_required || 4000;
        const totalTickets = cycle.total_tickets || tickets.length;
        const prizeMultiplier = totalTickets >= minRequired 
          ? 1.0 
          : Math.max(0.25, totalTickets / minRequired);

        // Calculate prize pool
        const prizePool = totalTickets * (cycle.ticket_price_m1u || 10);
        
        // Parse prizes config
        const prizesConfig = cycle.prizes_json || [
          { rank: 1, percent: 50, label: '1° Premio' },
          { rank: 2, percent: 30, label: '2° Premio' },
          { rank: 3, percent: 20, label: '3° Premio' }
        ];

        // Shuffle tickets using Fisher-Yates with seed
        const shuffled = [...tickets];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Select winners (ensuring unique users)
        const winners: Winner[] = [];
        const usedUsers = new Set<string>();
        
        for (const prize of prizesConfig) {
          for (const ticket of shuffled) {
            if (!usedUsers.has(ticket.user_id)) {
              const prizeAmount = Math.floor((prizePool * prize.percent / 100) * prizeMultiplier);
              winners.push({
                user_id: ticket.user_id,
                rank: prize.rank,
                prize_m1u: prizeAmount,
                prize_label: prize.label,
                ticket_id: ticket.id
              });
              usedUsers.add(ticket.user_id);
              break;
            }
          }
        }

        console.log(`[LOTTERY-CRON] 🏆 Selected ${winners.length} winners`);

        // Create draw record
        const drawProofHash = await generateHash(publicSeed + JSON.stringify(winners));
        const claimDeadline = new Date();
        claimDeadline.setDate(claimDeadline.getDate() + CLAIM_DEADLINE_DAYS);

        const { data: drawData, error: drawError } = await supabase
          .from('lottery_draws')
          .insert({
            cycle_id: cycle.id,
            draw_started_at: new Date().toISOString(),
            draw_completed_at: new Date().toISOString(),
            public_seed: publicSeed,
            draw_proof_hash: drawProofHash,
            total_tickets_at_draw: totalTickets,
            total_participants_at_draw: uniqueParticipants.length,
            threshold_reached: totalTickets >= minRequired,
            prize_multiplier: prizeMultiplier,
            prize_pool_at_draw: prizePool,
            winners: winners.map(w => ({ 
              user_id: w.user_id, 
              rank: w.rank, 
              prize_m1u: w.prize_m1u,
              prize_label: w.prize_label
            }))
          })
          .select()
          .single();

        if (drawError) throw drawError;

        // Create winner records
        for (const winner of winners) {
          await supabase
            .from('lottery_winners')
            .insert({
              draw_id: drawData.id,
              cycle_id: cycle.id,
              user_id: winner.user_id,
              rank: winner.rank,
              prize_m1u: winner.prize_m1u,
              prize_label: winner.prize_label,
              claim_status: 'pending',
              claim_deadline: claimDeadline.toISOString()
            });
        }

        // Update cycle status
        await supabase
          .from('mission_cycles')
          .update({ 
            status: 'completed',
            prize_multiplier: prizeMultiplier,
            prizes_effective_json: winners.map(w => ({
              rank: w.rank,
              prize_m1u: w.prize_m1u,
              label: w.prize_label
            })),
            updated_at: new Date().toISOString()
          })
          .eq('id', cycle.id);

        // Mark winning tickets
        for (const winner of winners) {
          await supabase
            .from('lottery_tickets')
            .update({ status: 'winner' })
            .eq('id', winner.ticket_id);
        }

        // ══════════════════════════════════════════════════════════════════════
        // SEND PUSH NOTIFICATIONS
        // ══════════════════════════════════════════════════════════════════════

        // 1. Send to ALL participants
        console.log(`[LOTTERY-CRON] 📤 Sending notifications to ${uniqueParticipants.length} participants...`);
        
        let participantNotifSent = 0;
        for (const participantId of uniqueParticipants) {
          try {
            await sendPushToUser(supabase, participantId, {
              title: '🎰 Estrazione Completata!',
              body: 'La Missione Lotteria è terminata. Scopri se hai vinto!',
              data: {
                type: 'lottery_draw_complete',
                cycle_id: cycle.id,
                deepLink: '/test/lottery'
              }
            });
            
            await supabase.from('lottery_notifications').insert({
              cycle_id: cycle.id,
              user_id: participantId,
              notification_type: 'draw_complete_participant',
              fcm_success: true
            });
            
            participantNotifSent++;
          } catch (e) {
            console.error(`[LOTTERY-CRON] ❌ Failed to notify participant ${participantId}:`, e);
          }
        }
        console.log(`[LOTTERY-CRON] ✅ Sent ${participantNotifSent}/${uniqueParticipants.length} participant notifications`);

        // 2. Send to WINNERS (separate notification)
        console.log(`[LOTTERY-CRON] 📤 Sending winner notifications to ${winners.length} winners...`);
        
        let winnerNotifSent = 0;
        for (const winner of winners) {
          try {
            await sendPushToUser(supabase, winner.user_id, {
              title: '🏆 HAI VINTO!',
              body: `Congratulazioni! Hai vinto ${winner.prize_m1u} M1U! Riscuoti il premio entro ${CLAIM_DEADLINE_DAYS} giorni.`,
              data: {
                type: 'lottery_winner',
                cycle_id: cycle.id,
                prize_m1u: winner.prize_m1u.toString(),
                rank: winner.rank.toString(),
                deepLink: '/test/lottery?claim=true'
              }
            });
            
            // Update winner notification sent
            await supabase
              .from('lottery_winners')
              .update({ notification_sent_at: new Date().toISOString() })
              .eq('cycle_id', cycle.id)
              .eq('user_id', winner.user_id);
            
            await supabase.from('lottery_notifications').insert({
              cycle_id: cycle.id,
              user_id: winner.user_id,
              notification_type: 'winner_announcement',
              fcm_success: true
            });
            
            winnerNotifSent++;
          } catch (e) {
            console.error(`[LOTTERY-CRON] ❌ Failed to notify winner ${winner.user_id}:`, e);
          }
        }
        console.log(`[LOTTERY-CRON] ✅ Sent ${winnerNotifSent}/${winners.length} winner notifications`);

        // Log audit
        await supabase.from('lottery_audit_logs').insert({
          cycle_id: cycle.id,
          event_type: 'draw_completed',
          event_details: {
            total_tickets: totalTickets,
            total_participants: uniqueParticipants.length,
            winners_count: winners.length,
            prize_multiplier: prizeMultiplier,
            threshold_reached: totalTickets >= minRequired,
            notifications_sent: {
              participants: participantNotifSent,
              winners: winnerNotifSent
            }
          }
        });

        results.push({
          cycle_id: cycle.id,
          status: 'completed',
          winners: winners.length,
          participants_notified: participantNotifSent,
          winners_notified: winnerNotifSent
        });

      } catch (cycleError) {
        console.error(`[LOTTERY-CRON] ❌ Error processing cycle ${cycle.id}:`, cycleError);
        
        // Revert to active on error
        await supabase
          .from('mission_cycles')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', cycle.id);
        
        results.push({
          cycle_id: cycle.id,
          status: 'error',
          error: String(cycleError)
        });
      }
    }

    // Also expire any unclaimed prizes
    const { data: expireResult } = await supabase.rpc('expire_unclaimed_prizes');
    console.log('[LOTTERY-CRON] 🕐 Expired prizes:', expireResult);

    console.log('[LOTTERY-CRON] ✅ Cron job completed');
    return jsonResponse({ 
      ok: true, 
      processed: results.length,
      results,
      expired_prizes: expireResult
    });

  } catch (error) {
    console.error('[LOTTERY-CRON] 💥 Fatal error:', error);
    return jsonResponse({ error: String(error) }, 500);
  }
});

// Helper: Send push notification to a user
async function sendPushToUser(
  supabase: any, 
  userId: string, 
  notification: { title: string; body: string; data?: Record<string, string> }
) {
  // Get user's FCM tokens
  const { data: tokens } = await supabase
    .from('fcm_subscriptions')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!tokens || tokens.length === 0) {
    console.log(`[LOTTERY-CRON] ⚠️ No FCM tokens for user ${userId}`);
    return;
  }

  // Call FCM send function
  const fcmUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/fcm-send';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      title: notification.title,
      body: notification.body,
      data: notification.data
    })
  });

  if (!response.ok) {
    throw new Error(`FCM send failed: ${response.status}`);
  }
}

// Helper: Generate SHA-256 hash
async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: JSON response
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

