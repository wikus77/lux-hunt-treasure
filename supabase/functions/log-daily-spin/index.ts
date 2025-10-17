// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailySpinRequest {
  user_id: string;
  prize: string;
  rotation_deg: number;
  client_ip?: string;
  reroute_path?: string;
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

    // Ottieni l'utente autenticato dal JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verifica il token JWT e ottieni l'utente
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      throw new Error('Unauthorized: ' + (authError?.message || 'Invalid token'))
    }

    console.log(`🔐 Utente autenticato: ${user.id} (${user.email})`)

    const { user_id, prize, rotation_deg, client_ip, reroute_path }: DailySpinRequest = await req.json()

    // Verifica che l'utente coincida con quello autenticato
    if (user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Ottieni la data di oggi in formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // Verifica se l'utente ha già giocato oggi
    const { data: existingLog, error: checkError } = await supabaseClient
      .from('daily_spin_logs')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', today)
      .maybeSingle()

    if (checkError) {
      console.error('Errore controllo log esistente:', checkError)
      throw checkError
    }

    if (existingLog) {
      return new Response(
        JSON.stringify({ 
          error: 'Hai già giocato oggi! Torna domani per un nuovo giro.',
          code: 'ALREADY_PLAYED_TODAY'
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Registra il giro usando il Service Role Key (bypassa RLS)
    const { data: spinLog, error: insertError } = await supabaseClient
      .from('daily_spin_logs')
      .insert({
        user_id,
        date: today,
        prize,
        rotation_deg,
        client_ip: client_ip || req.headers.get('x-forwarded-for') || 'unknown'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Errore inserimento log:', insertError)
      throw insertError
    }

    console.log(`✅ Daily Spin registrato per utente ${user_id}: ${prize}`)
    console.log(`📊 Dettagli spin:`, { 
      user_id, 
      prize, 
      rotation_deg, 
      reroute_path,
      today,
      log_id: spinLog.id 
    })

    // Determina il messaggio personalizzato
    let message = `Hai vinto: ${prize}!`;
    if (['Missione Fallita', 'Nessun premio'].includes(prize)) {
      message = `${prize} - Riprova domani!`;
    } else if (prize === '3h senza blocchi BUZZ') {
      message = 'Hai vinto 3 ore senza limitazioni BUZZ!';
    }

    return new Response(
      JSON.stringify({
        success: true,
        prize,
        rotation_deg,
        message,
        log_id: spinLog.id,
        reroute_path: reroute_path || null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Errore log-daily-spin:', error)
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