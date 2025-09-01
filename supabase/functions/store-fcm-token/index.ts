// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* GESTIONE TOKEN FCM */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const body = await req.json();
    console.log('[FCM-TOKEN] Request:', JSON.stringify(body, null, 2));

    const { token, fid } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Ottieni l'utente autenticato
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (user && !userError) {
        // Salva il token per l'utente autenticato
        const { data, error } = await supabase
          .from('fcm_tokens')
          .upsert({
            user_id: user.id,
            token: token,
            fid: fid || null,
            user_agent: req.headers.get('User-Agent'),
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'token'
          });

        if (error) {
          throw error;
        }

        console.log('[FCM-TOKEN] Stored for user:', user.id);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'FCM token stored successfully',
            user_id: user.id
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Se non autenticato, salva come token anonimo
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert({
        token: token,
        fid: fid || null,
        user_agent: req.headers.get('User-Agent'),
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'token'
      });

    if (error) {
      throw error;
    }

    console.log('[FCM-TOKEN] Stored anonymous token');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'FCM token stored successfully (anonymous)'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[FCM-TOKEN] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});