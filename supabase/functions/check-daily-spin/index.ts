// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Ottieni l'utente autenticato
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Ottieni la data di oggi
    const today = new Date().toISOString().split('T')[0]

    // Controlla se l'utente ha già giocato oggi
    const { data: existingLog, error: checkError } = await supabaseClient
      .from('daily_spin_logs')
      .select('id, prize, rotation_deg, created_at')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    if (checkError) {
      console.error('Errore controllo daily spin:', checkError)
      throw checkError
    }

    const hasPlayedToday = !!existingLog

    console.log(`🎰 Check Daily Spin utente ${user.id}: ${hasPlayedToday ? 'già giocato' : 'può giocare'}`)

    return new Response(
      JSON.stringify({
        hasPlayedToday,
        canPlay: !hasPlayedToday,
        todaysResult: existingLog ? {
          prize: existingLog.prize,
          rotation_deg: existingLog.rotation_deg,
          played_at: existingLog.created_at
        } : null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Errore check-daily-spin:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Errore interno del server',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})