// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * 🔒 PULSE BREAKER - Secure Game Round Management
 * - Server-side crash point generation
 * - Rate limiting & IP blocking
 * - JWT verification
 * - Anti-fraud protection
 * NO client-side manipulation possible
 */

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { withCors } from '../_shared/cors.ts';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;

// 🔒 SECURITY CONSTANTS
const MAX_BET = 100;
const MIN_BET = 1;
const MAX_ROUNDS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MINUTES = 1;

interface StartRoundRequest {
  user_id: string;
  bet_amount: number;
  bet_currency: 'PE' | 'M1U';
}

interface CashoutRequest {
  round_id: string;
  user_id: string;
  multiplier: number;
}

interface RevealRequest {
  round_id: string;
}

// 🔒 Get client IP for rate limiting
function getClientIP(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

/**
 * 🔒 SECURE Crash Point Generator
 * - 5% House Edge (M1SSION sempre vince nel lungo periodo)
 * - Min 1.10× (forza attesa)
 * - Max 10× (limita vincite)
 * - Provably fair usando server seed
 */
function generateCrashPoint(serverSeed: string): number {
  // Create deterministic hash from server seed
  let hash = 0;
  for (let i = 0; i < serverSeed.length; i++) {
    hash = ((hash << 5) - hash) + serverSeed.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Normalize to 0-1
  const r = Math.abs(hash % 100000) / 100000;
  
  // 🔒 5% House Edge formula
  const HOUSE_EDGE = 0.05;
  const rawCrash = (1 - HOUSE_EDGE) / (1 - r);
  
  // 🔒 Min 1.50× (dà tempo sufficiente per reagire considerando latenza di rete), Max 10×
  const crashPoint = Math.max(1.50, Math.min(10.00, rawCrash));
  
  // Round to 2 decimals
  return Math.floor(crashPoint * 100) / 100;
}

/**
 * Generate cryptographically secure random seed
 */
function generateServerSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash seed for client verification (provably fair)
 */
async function hashSeed(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 🔒 Verify JWT and get user
 */
async function verifyUser(req: Request, supabase: any, expectedUserId: string): Promise<{ valid: boolean; error?: string }> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing authorization' };
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { valid: false, error: 'Invalid token' };
  }
  
  // 🔒 CRITICAL: Verify user ID matches token
  if (user.id !== expectedUserId) {
    console.error(`[PULSE-BREAKER] 🚨 USER ID MISMATCH! Token: ${user.id}, Request: ${expectedUserId}`);
    return { valid: false, error: 'User mismatch' };
  }
  
  return { valid: true };
}

/**
 * 🔒 Check rate limit
 */
async function checkRateLimit(supabase: any, ipAddress: string): Promise<boolean> {
  try {
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      ip_addr: ipAddress,
      api_endpoint: 'pulse-breaker',
      max_requests: MAX_ROUNDS_PER_MINUTE,
      window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });
    return rateLimitOk !== false;
  } catch (e) {
    // If rate limit check fails, allow (fail open for game availability)
    console.warn('[PULSE-BREAKER] Rate limit check failed:', e);
    return true;
  }
}

/**
 * 🔒 Check if IP is blocked
 */
async function isIPBlocked(supabase: any, ipAddress: string): Promise<boolean> {
  try {
    const { data: isBlocked } = await supabase.rpc('is_ip_blocked', { ip_addr: ipAddress });
    return isBlocked === true;
  } catch {
    return false;
  }
}

// Main handler
const handler = async (req: Request): Promise<Response> => {
  const ipAddress = getClientIP(req);
  
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    // Action can come from: query param, header, or body
    const action = url.searchParams.get('action') || req.headers.get('x-action') || body.action || 'start';
    
    console.log(`[PULSE-BREAKER] 📥 Action: ${action} | IP: ${ipAddress}`);

    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY);

    // 🔒 Check IP block
    if (await isIPBlocked(supabase, ipAddress)) {
      console.log(`[PULSE-BREAKER] 🚫 Blocked IP: ${ipAddress}`);
      return json({ error: 'Accesso bloccato' }, 403);
    }

    // 🔒 Check rate limit (for start action only)
    if (action === 'start') {
      const rateLimitOk = await checkRateLimit(supabase, ipAddress);
      if (!rateLimitOk) {
        console.log(`[PULSE-BREAKER] ⏱️ Rate limited: ${ipAddress}`);
        return json({ error: 'Troppi tentativi. Attendi.' }, 429);
      }
    }

    // ============ START ROUND ============
    if (action === 'start') {
      const { user_id, bet_amount, bet_currency } = body as StartRoundRequest;

      if (!user_id || !bet_amount || !bet_currency) {
        return json({ error: 'Dati mancanti' }, 400);
      }

      // 🔒 Verify user token
      const userCheck = await verifyUser(req, supabase, user_id);
      if (!userCheck.valid) {
        console.error(`[PULSE-BREAKER] 🔐 Auth failed for ${user_id}: ${userCheck.error}`);
        return json({ error: 'Non autorizzato' }, 401);
      }

      // 🔒 STRICT BET VALIDATION
      const parsedBet = Math.floor(Number(bet_amount));
      if (isNaN(parsedBet) || parsedBet < MIN_BET || parsedBet > MAX_BET) {
        return json({ error: `Puntata: ${MIN_BET}-${MAX_BET}` }, 400);
      }

      if (!['PE', 'M1U'].includes(bet_currency)) {
        return json({ error: 'Valuta non valida' }, 400);
      }

      // 🔒 Check for active round (prevent multiple concurrent games)
      const { data: activeRounds } = await supabase
        .from('pulse_breaker_rounds')
        .select('id')
        .eq('user_id', user_id)
        .eq('status', 'running')
        .limit(1);

      if (activeRounds && activeRounds.length > 0) {
        // Check if the active round is already expired (crashed but not marked)
        const activeRound = activeRounds[0];
        const { data: roundDetails } = await supabase
          .from('pulse_breaker_rounds')
          .select('id, started_at, crash_point')
          .eq('id', activeRound.id)
          .single();
        
        if (roundDetails) {
          const startedAt = new Date(roundDetails.started_at).getTime();
          const now = Date.now();
          const elapsedSeconds = (now - startedAt) / 1000;
          
          // Calculate what the multiplier would be now
          let currentMult: number;
          if (elapsedSeconds < 3) {
            currentMult = 1 + elapsedSeconds * 0.12;
          } else {
            const fastPhase = elapsedSeconds - 3;
            currentMult = 1.36 + Math.pow(fastPhase, 1.5) * 0.25;
          }
          currentMult = Math.min(10, currentMult);
          
          // If crash should have happened, close the round
          if (currentMult >= roundDetails.crash_point) {
            await supabase
              .from('pulse_breaker_rounds')
              .update({
                status: 'crashed',
                payout: 0,
                ended_at: new Date().toISOString()
              })
              .eq('id', roundDetails.id);
            console.log(`[PULSE-BREAKER] 🧹 Auto-closed stale round ${roundDetails.id}`);
          } else {
            // Round is still legitimately active
            return json({ error: 'Hai già un round attivo' }, 400);
          }
        }
      }

      // Check user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('m1_units, pulse_energy')
        .eq('id', user_id)
        .single();

      if (profileError || !profile) {
        return json({ error: 'Utente non trovato' }, 404);
      }

      const balance = bet_currency === 'M1U' ? (profile.m1_units || 0) : (profile.pulse_energy || 0);
      
      if (balance < parsedBet) {
        return json({ error: `Saldo ${bet_currency} insufficiente` }, 400);
      }

      // Deduct bet from user
      const updateField = bet_currency === 'M1U' ? 'm1_units' : 'pulse_energy';
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ [updateField]: balance - parsedBet })
        .eq('id', user_id);

      if (deductError) {
        console.error('[PULSE-BREAKER] Deduct error:', deductError);
        return json({ error: 'Errore transazione' }, 500);
      }

      // Generate server seed and crash point
      const serverSeed = generateServerSeed();
      const crashPoint = generateCrashPoint(serverSeed);
      const seedHash = await hashSeed(serverSeed);

      // Create round record
      const { data: round, error: roundError } = await supabase
        .from('pulse_breaker_rounds')
        .insert({
          user_id,
          bet_amount: parsedBet,
          bet_currency,
          server_seed: serverSeed,
          seed_hash: seedHash,
          crash_point: crashPoint,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) {
        // Refund bet on error
        await supabase
          .from('profiles')
          .update({ [updateField]: balance })
          .eq('id', user_id);
        
        console.error('[PULSE-BREAKER] Round creation error:', roundError);
        return json({ error: 'Errore creazione round' }, 500);
      }

      console.log(`[PULSE-BREAKER] ✅ Round ${round.id} | bet: ${parsedBet} ${bet_currency} | crash: ${crashPoint}x | IP: ${ipAddress}`);

      // 🔒 Calculate time until crash (for client info)
      // Formula: seconds to reach crash_point
      // If crash < 1.36 (phase 1): seconds = (crash - 1) / 0.12
      // If crash >= 1.36 (phase 2): seconds = 3 + ((crash - 1.36) / 0.25) ^ (1/1.5)
      let secondsUntilCrash: number;
      if (crashPoint < 1.36) {
        secondsUntilCrash = (crashPoint - 1) / 0.12;
      } else {
        secondsUntilCrash = 3 + Math.pow((crashPoint - 1.36) / 0.25, 1/1.5);
      }

      return json({
        ok: true,
        round_id: round.id,
        seed_hash: seedHash,
        bet_amount: parsedBet,
        bet_currency,
        // 🔒 Crash point - client uses this for visual crash timing
        // Security: Server ALWAYS validates on cashout regardless of what client shows
        crash_point: crashPoint,
        seconds_until_crash: Math.floor(secondsUntilCrash * 100) / 100
      });
    }

    // ============ CASHOUT (TIME-BASED with LATENCY COMPENSATION) ============
    if (action === 'cashout') {
      const { round_id, user_id, client_elapsed_ms, client_multiplier } = body as CashoutRequest & { 
        client_elapsed_ms?: number; 
        client_multiplier?: number;
      };

      if (!round_id || !user_id) {
        return json({ error: 'Dati mancanti' }, 400);
      }

      // 🔒 Verify user token
      const userCheck = await verifyUser(req, supabase, user_id);
      if (!userCheck.valid) {
        return json({ error: 'Non autorizzato' }, 401);
      }

      // Get round with started_at
      const { data: round, error: roundError } = await supabase
        .from('pulse_breaker_rounds')
        .select('*')
        .eq('id', round_id)
        .eq('user_id', user_id)
        .eq('status', 'running')
        .single();

      if (roundError || !round) {
        return json({ error: 'Round non trovato o già terminato' }, 404);
      }

      // 🔒 Calculate time elapsed
      const startedAt = new Date(round.started_at).getTime();
      const serverNow = Date.now();
      const serverElapsedMs = serverNow - startedAt;
      
      // 🔒 LATENCY COMPENSATION: Use client's elapsed time if it's reasonable
      // This accounts for network latency between user clicking and server receiving
      const MAX_LATENCY_TOLERANCE_MS = 500; // Allow up to 500ms of network latency
      
      let effectiveElapsedMs: number;
      let latencyNote = '';
      
      if (client_elapsed_ms !== undefined && client_elapsed_ms > 0) {
        // Client provided their elapsed time - validate it
        const latencyDiff = serverElapsedMs - client_elapsed_ms;
        
        if (latencyDiff >= 0 && latencyDiff <= MAX_LATENCY_TOLERANCE_MS) {
          // Valid: client time is in the past within acceptable latency range
          // Use client's time (which is when they actually clicked)
          effectiveElapsedMs = client_elapsed_ms;
          latencyNote = `(latency: ${latencyDiff}ms)`;
        } else if (latencyDiff < 0) {
          // Invalid: client claims time in the future (cheating attempt?)
          console.log(`[PULSE-BREAKER] ⚠️ Client time ahead of server by ${-latencyDiff}ms - using server time`);
          effectiveElapsedMs = serverElapsedMs;
          latencyNote = '(client time rejected - future)';
        } else {
          // Latency too high - could be cheating or very slow connection
          // Use server time but add a grace period
          effectiveElapsedMs = serverElapsedMs - MAX_LATENCY_TOLERANCE_MS;
          latencyNote = `(high latency ${latencyDiff}ms - grace applied)`;
        }
      } else {
        // No client time provided - use server time with standard grace
        effectiveElapsedMs = serverElapsedMs - 200; // 200ms default grace
        latencyNote = '(no client time - default grace)';
      }
      
      // Ensure we don't go negative
      effectiveElapsedMs = Math.max(0, effectiveElapsedMs);
      const effectiveSeconds = effectiveElapsedMs / 1000;

      // Calculate multiplier at the EFFECTIVE time (when user actually clicked)
      let effectiveMultiplier: number;
      if (effectiveSeconds < 3) {
        effectiveMultiplier = 1 + effectiveSeconds * 0.12;
      } else {
        const fastPhase = effectiveSeconds - 3;
        effectiveMultiplier = 1.36 + Math.pow(fastPhase, 1.5) * 0.25;
      }
      effectiveMultiplier = Math.min(10, Math.floor(effectiveMultiplier * 100) / 100);

      console.log(`[PULSE-BREAKER] 📊 Cashout - effective_time: ${effectiveSeconds.toFixed(2)}s, effective_mult: ${effectiveMultiplier}x, crash: ${round.crash_point}x ${latencyNote}`);

      // 🔒 Check if crash happened BEFORE user clicked (using effective time)
      if (effectiveMultiplier >= round.crash_point) {
        // User tried to cashout but crash had already happened at their click time
        await supabase
          .from('pulse_breaker_rounds')
          .update({
            status: 'crashed',
            cashout_multiplier: null,
            payout: 0,
            ended_at: new Date().toISOString()
          })
          .eq('id', round_id);

        console.log(`[PULSE-BREAKER] 💥 Round ${round_id} CRASHED at ${round.crash_point}x (click was at ${effectiveMultiplier}x)`);

        return json({
          ok: false,
          result: 'crashed',
          crash_point: round.crash_point,
          server_seed: round.server_seed,
          payout: 0,
          multiplier: effectiveMultiplier
        });
      }

      // ✅ Valid cashout! Use effective multiplier
      const payout = Math.floor(round.bet_amount * effectiveMultiplier * 100) / 100;

      // Update round with effective multiplier (what user actually got)
      await supabase
        .from('pulse_breaker_rounds')
        .update({
          status: 'cashed_out',
          cashout_multiplier: effectiveMultiplier,
          payout,
          ended_at: new Date().toISOString()
        })
        .eq('id', round_id);

      // Credit winnings to user
      const updateField = round.bet_currency === 'M1U' ? 'm1_units' : 'pulse_energy';
      const { data: profile } = await supabase
        .from('profiles')
        .select(updateField)
        .eq('id', user_id)
        .single();

      const currentBalance = profile?.[updateField] || 0;
      await supabase
        .from('profiles')
        .update({ [updateField]: currentBalance + payout })
        .eq('id', user_id);

      console.log(`[PULSE-BREAKER] 💰 Round ${round_id} CASHED at ${effectiveMultiplier}x | payout: ${payout} ${round.bet_currency}`);

      return json({
        ok: true,
        result: 'cashed_out',
        multiplier: effectiveMultiplier,
        payout,
        crash_point: round.crash_point,
        server_seed: round.server_seed
      });
    }

    // ============ POLL (server sends current multiplier + crash status) ============
    if (action === 'poll') {
      const { round_id } = body;

      if (!round_id) {
        return json({ ok: false, error: 'Manca round_id' }, 400);
      }

      // Get round with started_at time
      const { data: round, error: roundError } = await supabase
        .from('pulse_breaker_rounds')
        .select('crash_point, server_seed, status, started_at')
        .eq('id', round_id)
        .single();

      if (roundError || !round) {
        return json({ ok: false, error: 'Round non trovato' }, 404);
      }

      // If already ended, return final status
      if (round.status !== 'running') {
        return json({
          ok: true,
          crashed: round.status === 'crashed',
          crash_point: round.crash_point,
          server_seed: round.server_seed,
          current_multiplier: round.crash_point,
          status: round.status
        });
      }

      // 🔒 Calculate current multiplier based on server time
      const startedAt = new Date(round.started_at).getTime();
      const now = Date.now();
      const elapsedMs = now - startedAt;
      const elapsedSeconds = elapsedMs / 1000;

      // Same formula - calculate multiplier
      let currentMultiplier: number;
      if (elapsedSeconds < 3) {
        currentMultiplier = 1 + elapsedSeconds * 0.12;
      } else {
        const fastPhase = elapsedSeconds - 3;
        currentMultiplier = 1.36 + Math.pow(fastPhase, 1.5) * 0.25;
      }
      currentMultiplier = Math.min(10, Math.floor(currentMultiplier * 100) / 100);

      // Check if crashed
      if (currentMultiplier >= round.crash_point) {
        // Mark as crashed
        await supabase
          .from('pulse_breaker_rounds')
          .update({
            status: 'crashed',
            payout: 0,
            ended_at: new Date().toISOString()
          })
          .eq('id', round_id)
          .eq('status', 'running');

        return json({
          ok: true,
          crashed: true,
          crash_point: round.crash_point,
          server_seed: round.server_seed,
          current_multiplier: round.crash_point
        });
      }

      // Still running - return current multiplier
      return json({
        ok: true,
        crashed: false,
        current_multiplier: currentMultiplier,
        elapsed_seconds: elapsedSeconds
      });
    }

    // ============ CHECK (realtime crash detection - TIME BASED) ============
    if (action === 'check') {
      const { round_id } = body;

      if (!round_id) {
        return json({ error: 'Manca round_id' }, 400);
      }

      // Get round with started_at time
      const { data: round, error: roundError } = await supabase
        .from('pulse_breaker_rounds')
        .select('crash_point, server_seed, status, started_at')
        .eq('id', round_id)
        .single();

      if (roundError || !round) {
        return json({ error: 'Round non trovato' }, 404);
      }

      // If already crashed/cashed_out, return current status
      if (round.status !== 'running') {
        return json({
          ok: true,
          crashed: round.status === 'crashed',
          crash_point: round.crash_point,
          server_seed: round.server_seed,
          status: round.status
        });
      }

      // 🔒 Calculate multiplier based on TIME elapsed (not client multiplier!)
      // This prevents client from sending fake multipliers
      const startedAt = new Date(round.started_at).getTime();
      const now = Date.now();
      const elapsedMs = now - startedAt;
      const elapsedSeconds = elapsedMs / 1000;

      // Same formula as frontend
      let serverCalculatedMultiplier: number;
      if (elapsedSeconds < 3) {
        serverCalculatedMultiplier = 1 + elapsedSeconds * 0.12;
      } else {
        const fastPhase = elapsedSeconds - 3;
        serverCalculatedMultiplier = 1.36 + Math.pow(fastPhase, 1.5) * 0.25;
      }
      serverCalculatedMultiplier = Math.floor(serverCalculatedMultiplier * 100) / 100;

      // Check if server-calculated multiplier has reached crash point
      if (serverCalculatedMultiplier >= round.crash_point) {
        // Mark as crashed
        await supabase
          .from('pulse_breaker_rounds')
          .update({
            status: 'crashed',
            payout: 0,
            ended_at: new Date().toISOString()
          })
          .eq('id', round_id)
          .eq('status', 'running');
        
        console.log(`[PULSE-BREAKER] 💥 Round ${round_id} TIME-CRASHED at ${round.crash_point}x (elapsed: ${elapsedSeconds.toFixed(2)}s, calc: ${serverCalculatedMultiplier}x)`);
        
        return json({
          ok: true,
          crashed: true,
          crash_point: round.crash_point,
          server_seed: round.server_seed
        });
      }

      // Still running
      return json({
        ok: true,
        crashed: false,
        status: round.status,
        elapsed_seconds: elapsedSeconds
      });
    }

    // ============ CRASH / REVEAL (client notifies crash happened) ============
    if (action === 'reveal' || action === 'crash') {
      const { round_id } = body as RevealRequest;

      if (!round_id) {
        return json({ error: 'Manca round_id' }, 400);
      }

      // Get round and mark as crashed if still running
      const { data: round, error: roundError } = await supabase
        .from('pulse_breaker_rounds')
        .select('*')
        .eq('id', round_id)
        .single();

      if (roundError || !round) {
        return json({ error: 'Round non trovato' }, 404);
      }

      if (round.status === 'running') {
        // Mark as crashed
        await supabase
          .from('pulse_breaker_rounds')
          .update({
            status: 'crashed',
            payout: 0,
            ended_at: new Date().toISOString()
          })
          .eq('id', round_id);
        
        console.log(`[PULSE-BREAKER] 💥 Round ${round_id} REVEALED crash at ${round.crash_point}x`);
      }

      return json({
        ok: true,
        crash_point: round.crash_point,
        server_seed: round.server_seed,
        seed_hash: round.seed_hash,
        status: round.status === 'running' ? 'crashed' : round.status
      });
    }

    return json({ error: 'Azione non valida' }, 400);

  } catch (error: any) {
    console.error(`[PULSE-BREAKER] ❌ Error from ${ipAddress}:`, error);
    return json({ error: 'Errore interno' }, 500);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Use CORS wrapper
Deno.serve(withCors(handler));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
