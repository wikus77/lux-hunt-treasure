// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: Claim Welcome Bonus (500 M1U)
// Accredita 500 M1U al primo login/registrazione

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WELCOME_BONUS_AMOUNT = 500;

interface ClaimRequest {
  userId?: string; // Optional - will use auth user if not provided
}

interface ClaimResponse {
  success: boolean;
  message: string;
  amount?: number;
  newBalance?: number;
  alreadyClaimed?: boolean;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[CLAIM-WELCOME-BONUS] 🎁 Request received');

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'No authorization header' } as ClaimResponse),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Also create a client with user's token to verify identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get current user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('[CLAIM-WELCOME-BONUS] ❌ User not authenticated:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'User not authenticated' } as ClaimResponse),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = user.id;
    console.log('[CLAIM-WELCOME-BONUS] 👤 User verified:', userId.substring(0, 8) + '...');

    // Check if user has already claimed the bonus
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('welcome_bonus_claimed, m1_units, agent_code')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[CLAIM-WELCOME-BONUS] ❌ Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'profile_not_found', message: 'Profilo non trovato' } as ClaimResponse),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already claimed
    if (profile.welcome_bonus_claimed === true) {
      console.log('[CLAIM-WELCOME-BONUS] ⚠️ Bonus already claimed by user:', userId.substring(0, 8) + '...');
      return new Response(
        JSON.stringify({ 
          success: false, 
          alreadyClaimed: true,
          error: 'already_claimed', 
          message: 'Bonus di benvenuto già ricevuto' 
        } as ClaimResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Credit M1U using admin_credit_m1u RPC
    console.log('[CLAIM-WELCOME-BONUS] 💰 Crediting', WELCOME_BONUS_AMOUNT, 'M1U to user...');
    
    const { data: creditResult, error: creditError } = await supabaseAdmin.rpc('admin_credit_m1u', {
      p_user_id: userId,
      p_amount: WELCOME_BONUS_AMOUNT,
      p_reason: 'welcome_bonus'
    });

    if (creditError) {
      console.error('[CLAIM-WELCOME-BONUS] ❌ Credit error:', creditError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'credit_failed', 
          message: 'Errore durante l\'accredito M1U' 
        } as ClaimResponse),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark bonus as claimed
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ welcome_bonus_claimed: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('[CLAIM-WELCOME-BONUS] ⚠️ Failed to mark bonus as claimed:', updateError);
      // Non-fatal: bonus was credited, just logging failed
    }

    const newBalance = creditResult?.new_balance ?? (profile.m1_units + WELCOME_BONUS_AMOUNT);
    
    console.log('[CLAIM-WELCOME-BONUS] ✅ Welcome bonus claimed successfully!', {
      userId: userId.substring(0, 8) + '...',
      agentCode: profile.agent_code,
      amount: WELCOME_BONUS_AMOUNT,
      newBalance
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Benvenuto in M1SSION! Hai ricevuto il tuo bonus di benvenuto.',
        amount: WELCOME_BONUS_AMOUNT,
        newBalance
      } as ClaimResponse),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error('[CLAIM-WELCOME-BONUS] ❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Errore interno del server'
      } as ClaimResponse),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);


