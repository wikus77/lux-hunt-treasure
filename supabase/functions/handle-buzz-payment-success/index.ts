// © 2025 M1SSION™ – Handle BUZZ Payment Success Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('💳 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function started');

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
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [HANDLE-BUZZ-PAYMENT-SUCCESS] User authenticated:', user.id);

    // Parse request body
    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      throw new Error('Missing paymentIntentId');
    }

    console.log('💳 [HANDLE-BUZZ-PAYMENT-SUCCESS] Processing payment:', paymentIntentId);

    // Generate random clue text for paid BUZZ
    const premiumClueTexts = [
      "Il segreto più prezioso si nasconde dove l'eccellenza italiana brilla...",
      "Segui il sentiero dorato dell'innovazione premium...",
      "Nell'epicentro del lusso tecnologico troverai l'indizio supremo...",
      "Dove l'arte incontra la perfezione, là si cela il mistero...",
      "Il tesoro più ambito attende nel tempio dell'innovazione...",
      "Tra le creazioni più raffinate si nasconde la chiave del successo...",
      "Nel regno dell'eccellenza italiana scoprirai il segreto finale..."
    ];
    
    const clueText = premiumClueTexts[Math.floor(Math.random() * premiumClueTexts.length)];

    // Log the payment BUZZ action
    const { error: logError } = await supabase
      .from('buzz_logs')
      .insert({
        user_id: user.id,
        action: 'buzz_payment_success',
        metadata: {
          clue_text: clueText,
          payment_intent_id: paymentIntentId,
          source: 'buzz_purchase',
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Log error:', logError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Payment BUZZ logged successfully');
    }

    // Create premium notification
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        type: 'buzz',
        title: '🎯 Nuovo Indizio BUZZ Premium!',
        message: clueText,
        metadata: {
          clue_text: clueText,
          source: 'buzz_purchase',
          payment_intent_id: paymentIntentId,
          premium: true
        }
      });

    if (notificationError) {
      console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Notification error:', notificationError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PAYMENT-SUCCESS] Premium notification created successfully');
    }

    const response = {
      success: true,
      clue_text: clueText,
      message: 'Premium BUZZ processed successfully',
      payment_intent_id: paymentIntentId
    };

    console.log('🎉 [HANDLE-BUZZ-PAYMENT-SUCCESS] Function completed successfully:', response);

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
    console.error('❌ [HANDLE-BUZZ-PAYMENT-SUCCESS] Function error:', error);
    
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