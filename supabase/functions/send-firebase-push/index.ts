// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* SISTEMA FIREBASE CLOUD MESSAGING DEFINITIVO */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Firebase Server Key - AGGIUNGI LA TUA CHIAVE FIREBASE SERVER
const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY') || 'your_firebase_server_key';
const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

interface FCMPayload {
  to?: string;
  registration_ids?: string[];
  notification: {
    title: string;
    body: string;
    icon?: string;
    click_action?: string;
  };
  data?: Record<string, any>;
}

async function sendFCMNotification(payload: FCMPayload): Promise<any> {
  try {
    console.log('[FCM] Sending notification:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('[FCM] Response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      throw new Error(`FCM request failed: ${response.status} - ${JSON.stringify(result)}`);
    }

    return result;
  } catch (error) {
    console.error('[FCM] Send error:', error);
    throw error;
  }
}

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('[FCM] Request body:', JSON.stringify(body, null, 2));

    // Valida i parametri
    if (!body.title || !body.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Recupera tutti i token FCM attivi
    const { data: tokens, error: tokensError } = await supabase
      .from('fcm_tokens')
      .select('token, user_id')
      .not('token', 'is', null);

    if (tokensError) {
      console.error('[FCM] Error fetching tokens:', tokensError);
      throw new Error(`Database error: ${tokensError.message}`);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No FCM tokens found',
          sent_count: 0,
          failed_count: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[FCM] Found ${tokens.length} FCM tokens`);

    // Prepara il payload della notifica
    const notification = {
      title: body.title,
      body: body.body,
      icon: '/icon-192x192.png',
      click_action: body.url || 'https://m1ssion.eu'
    };

    const data = {
      url: body.url || '/',
      timestamp: Date.now().toString(),
      source: 'M1SSION',
      ...body.additionalData
    };

    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    // Invia notifiche in batch (massimo 1000 per volta - limite FCM)
    const batchSize = 1000;
    const tokenBatches = [];
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      tokenBatches.push(tokens.slice(i, i + batchSize));
    }

    for (const batch of tokenBatches) {
      try {
        const tokenList = batch.map(t => t.token);
        
        const fcmPayload: FCMPayload = {
          registration_ids: tokenList,
          notification,
          data
        };

        const result = await sendFCMNotification(fcmPayload);
        
        if (result.success !== undefined) {
          sentCount += result.success;
          failedCount += result.failure;
        } else {
          // FCM non restituisce sempre i contatori, conta manualmente
          sentCount += tokenList.length;
        }

        results.push({
          batch_size: tokenList.length,
          result: result
        });

      } catch (error) {
        console.error(`[FCM] Batch send failed:`, error);
        failedCount += batch.length;
        results.push({
          batch_size: batch.length,
          error: error.message
        });
      }
    }

    // Log dell'operazione
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'firebase_notification_sent',
        note: `FCM notification sent: ${body.title}`,
        context: JSON.stringify({
          title: body.title,
          body: body.body,
          total_tokens: tokens.length,
          sent_count: sentCount,
          failed_count: failedCount
        })
      });

    const finalResult = {
      success: true,
      message: 'Firebase notification sending completed',
      sent_count: sentCount,
      failed_count: failedCount,
      total_tokens: tokens.length,
      batch_results: results,
      timestamp: new Date().toISOString()
    };

    console.log('[FCM] Final result:', JSON.stringify(finalResult, null, 2));

    return new Response(
      JSON.stringify(finalResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[FCM] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});