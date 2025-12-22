// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Cashback Vault™ - Claim Edge Function
// Trasferisce accumulated_m1u dal wallet al profilo utente

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { secureCors } from "../_shared/secureCors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // 🔧 FIX: CORS preflight - must return 204 with proper headers
  if (req.method === "OPTIONS") {
    const corsHeaders = secureCors(req);
    console.log("[cashback-claim] ✅ OPTIONS preflight handled");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Estrai JWT dall'header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Crea client Supabase per verificare l'utente
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verifica il JWT e ottieni l'utente
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    
    if (authError || !user) {
      console.log(`[cashback-claim] Auth error: ${authError?.message || 'No user'}`);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    // Log sicuro: solo ultimi 8 caratteri
    console.log(`[cashback-claim] Processing claim for user ...${userId.slice(-8)}`);

    // Crea client admin per operazioni DB
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Carica wallet utente
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("user_cashback_wallet")
      .select("accumulated_m1u, last_claim_at")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      console.log(`[cashback-claim] No wallet found for user ...${userId.slice(-8)}`);
      return new Response(
        JSON.stringify({ error: "No cashback wallet found. Start earning cashback first!" }),
        { status: 400, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    // Verifica se c'è qualcosa da riscattare
    if (wallet.accumulated_m1u <= 0) {
      return new Response(
        JSON.stringify({ error: "Nothing to claim. Keep playing to earn cashback!" }),
        { status: 400, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    // 🔥 VERIFICA CHE SIA DOMENICA - Claim disponibile SOLO la Domenica
    const now = new Date();
    const isSunday = now.getUTCDay() === 0; // 0 = Domenica (UTC per coerenza server)
    
    if (!isSunday) {
      // Calcola prossima domenica
      const daysUntilSunday = 7 - now.getUTCDay();
      const nextSunday = new Date(now);
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      nextSunday.setUTCHours(0, 0, 0, 0);
      
      console.log(`[cashback-claim] ❌ Claim rejected: not Sunday (today is day ${now.getUTCDay()})`);
      
      return new Response(
        JSON.stringify({ 
          error: "Il riscatto del cashback è disponibile solo di Domenica!",
          next_claim_available: nextSunday.toISOString(),
          today: now.toISOString()
        }),
        { status: 400, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    // Verifica cooldown 7 giorni
    if (wallet.last_claim_at) {
      const lastClaim = new Date(wallet.last_claim_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (lastClaim > sevenDaysAgo) {
        const nextClaimDate = new Date(lastClaim);
        nextClaimDate.setDate(nextClaimDate.getDate() + 7);
        const daysRemaining = Math.ceil((nextClaimDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        return new Response(
          JSON.stringify({ 
            error: `Claim available in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
            next_claim_available: nextClaimDate.toISOString()
          }),
          { status: 400, headers: { ...secureCors(req), "Content-Type": "application/json" } }
        );
      }
    }

    const amountToCredit = wallet.accumulated_m1u;

    // 🔧 FIX: Trasferisci M1U al profilo - leggi prima il saldo attuale poi aggiorna
    // Step 1: Leggi saldo attuale
    const { data: currentProfile, error: profileReadError } = await supabaseAdmin
      .from("profiles")
      .select("m1_units")
      .eq("id", userId)
      .single();

    if (profileReadError) {
      console.error(`[cashback-claim] Profile read failed for user ...${userId.slice(-8)}: ${profileReadError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to read profile. Please try again later." }),
        { status: 500, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    const currentBalance = currentProfile?.m1_units || 0;
    const newBalance = currentBalance + amountToCredit;

    // Step 2: Aggiorna con nuovo saldo
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        m1_units: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      console.error(`[cashback-claim] Credit failed for user ...${userId.slice(-8)}: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to credit M1U. Please try again later." }),
        { status: 500, headers: { ...secureCors(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`[cashback-claim] ✅ Credited ${amountToCredit} M1U (${currentBalance} → ${newBalance})`)

    // Reset wallet
    const { error: resetError } = await supabaseAdmin
      .from("user_cashback_wallet")
      .update({
        accumulated_m1u: 0,
        last_claim_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (resetError) {
      console.error(`[cashback-claim] Reset failed for user ...${userId.slice(-8)}: ${resetError.message}`);
      // Non fallire completamente, l'M1U è già stato accreditato
    }

    // Ottieni nuovo saldo
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("m1_units")
      .eq("id", userId)
      .single();

    const nextClaimDate = new Date();
    nextClaimDate.setDate(nextClaimDate.getDate() + 7);

    console.log(`[cashback-claim] ✅ Claimed ${amountToCredit} M1U for user ...${userId.slice(-8)}`);

    return new Response(
      JSON.stringify({
        success: true,
        credited_m1u: amountToCredit,
        new_balance: profile?.m1_units || 0,
        next_claim_available: nextClaimDate.toISOString(),
        message: `Congratulazioni! Hai riscattato ${amountToCredit} M1U dal tuo Cashback Vault!`
      }),
      { status: 200, headers: { ...secureCors(req), "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`[cashback-claim] Unexpected error:`, error.message);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...secureCors(req), "Content-Type": "application/json" } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

