// © 2025 M1SSION™ – Handle BUZZ Press Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🎯 [HANDLE-BUZZ-PRESS] Function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [HANDLE-BUZZ-PRESS] User authenticated:', user.id);

    // Generate random clue text (same logic as other functions)
    const clueTexts = [
      "Cerca dove l'innovazione italiana splende più forte...",
      "L'indizio si nasconde tra i corridoi del progresso...", 
      "Segui le tracce della tecnologia che ha cambiato il mondo...",
      "Nel cuore della ricerca italiana troverai la chiave...",
      "Dove la scienza incontra l'arte, là troverai la risposta...",
      "L'indizio danza tra le onde dell'innovazione...",
      "Cerca nei luoghi dove il futuro prende forma..."
    ];
    
    const clueText = clueTexts[Math.floor(Math.random() * clueTexts.length)];

    // Log the BUZZ action
    const { error: logError } = await supabase
      .from('buzz_logs')
      .insert({
        user_id: user.id,
        action: 'buzz_press',
        metadata: {
          clue_text: clueText,
          source: 'handle_buzz_press',
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Log error:', logError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] BUZZ logged successfully');
    }

    // Create notification
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        type: 'buzz',
        title: '🎯 Nuovo Indizio BUZZ!',
        message: clueText,
        metadata: {
          clue_text: clueText,
          source: 'buzz_press'
        }
      });

    if (notificationError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Notification error:', notificationError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] Notification created successfully');
    }

    const response = {
      success: true,
      clue_text: clueText,
      message: 'BUZZ processed successfully'
    };

    console.log('🎉 [HANDLE-BUZZ-PRESS] Function completed successfully:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ [HANDLE-BUZZ-PRESS] Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});