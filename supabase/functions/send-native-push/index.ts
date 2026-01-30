// © 2025 Joseph MULÉ – M1SSION™ - Native Push Notification Sender
// Supports iOS APNs and Android FCM
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { encode as base64urlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  targetUserId?: string;
}

// Mask token for logging (show first 10 chars only)
function maskToken(token: string): string {
  if (!token || token.length < 15) return '***';
  return token.substring(0, 10) + '...[' + token.length + ' chars]';
}

// ============================================================================
// TOKEN VALIDATION GUARD (HARDENING)
// ============================================================================
function validateAPNsToken(token: string, requestId?: string): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: 'Token is empty or null' };
  }
  
  if (token.length !== 64) {
    console.error(`❌ [${requestId}] Token length invalid: ${token.length} (expected 64)`);
    return { valid: false, error: `Token length ${token.length}, expected 64` };
  }
  
  if (!/^[0-9a-fA-F]+$/.test(token)) {
    console.error(`❌ [${requestId}] Token contains non-hex characters`);
    return { valid: false, error: 'Token contains non-hex characters' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📨 [${requestId}] send-native-push invoked`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // =========================================================================
    // AUTH: Support both user JWT and admin secret
    // =========================================================================
    let userId: string | null = null;
    let authMethod: string = 'none';

    // Check for admin secret first (for testing from Supabase dashboard)
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedAdminSecret = Deno.env.get('ADMIN_PUSH_SECRET');

    if (adminSecret && expectedAdminSecret && adminSecret === expectedAdminSecret) {
      authMethod = 'admin-secret';
      console.log(`🔐 [${requestId}] Auth via admin secret`);
    } else {
      // Fall back to user JWT auth
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        console.log(`❌ [${requestId}] No auth token provided`);
        return new Response(
          JSON.stringify({ 
            error: 'Authentication required',
            hint: 'Provide Authorization: Bearer <token> or x-admin-secret header'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !user) {
        console.log(`❌ [${requestId}] Invalid JWT:`, userError?.message);
        return new Response(
          JSON.stringify({ error: 'Invalid token', details: userError?.message }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = user.id;
      authMethod = 'jwt';
      console.log(`🔐 [${requestId}] Auth via JWT, user: ${userId}`);
    }

    // =========================================================================
    // PARSE PAYLOAD
    // =========================================================================
    const { title, body, data, targetUserId }: NotificationPayload = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📝 [${requestId}] Payload: title="${title}", body="${body.substring(0, 50)}..."`);

    // =========================================================================
    // QUERY PUSH TOKENS
    // =========================================================================
    let query = supabaseClient
      .from('push_tokens')
      .select('*');

    // Determine target user
    const effectiveTargetUserId = targetUserId || userId;
    
    if (effectiveTargetUserId) {
      query = query.eq('user_id', effectiveTargetUserId);
      console.log(`🎯 [${requestId}] Targeting user: ${effectiveTargetUserId}`);
    } else if (authMethod === 'admin-secret') {
      // Admin without specific target - send to all active tokens
      console.log(`🎯 [${requestId}] Admin mode: querying all tokens`);
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error(`❌ [${requestId}] Error fetching push tokens:`, tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens', details: tokensError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 [${requestId}] Found ${tokens?.length || 0} token(s)`);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No push tokens found for target user',
          sent: 0,
          target_user: effectiveTargetUserId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // SEND NOTIFICATIONS
    // =========================================================================
    let sentCount = 0;
    let failedCount = 0;
    const results: any[] = [];

    for (const tokenData of tokens) {
      const platform = tokenData.platform || 'web';
      const endpointType = tokenData.endpoint_type || 'web_push';
      const tokenPreview = maskToken(tokenData.token);
      
      console.log(`📤 [${requestId}] Processing: platform=${platform}, type=${endpointType}, token=${tokenPreview}`);

      try {
        let notificationSent = false;
        let sendResult: any = {};

        if (platform === 'android' && endpointType === 'fcm') {
          // Send FCM notification for Android
          sendResult = await sendFCMNotification(tokenData.token, title, body, data, requestId);
          notificationSent = sendResult.success;
        } else if (platform === 'ios' && endpointType === 'apns') {
          // 🛡️ HARDENING: Validate token BEFORE making network call
          const tokenValidation = validateAPNsToken(tokenData.token, requestId);
          if (!tokenValidation.valid) {
            console.error(`❌ [${requestId}] Token validation failed: ${tokenValidation.error}`);
            sendResult = { success: false, error: tokenValidation.error };
          } else {
            // Send APNs notification for iOS
            sendResult = await sendAPNSNotification(tokenData.token, title, body, data, requestId);
            notificationSent = sendResult.success;
          }
        } else {
          console.log(`⚠️ [${requestId}] Skipping unsupported platform/type: ${platform}/${endpointType}`);
          sendResult = { success: false, error: 'Unsupported platform' };
        }

        if (notificationSent) {
          sentCount++;
          // Update last_used_at
          await supabaseClient
            .from('push_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', tokenData.id);
        } else {
          failedCount++;
        }

        results.push({
          platform,
          endpoint_type: endpointType,
          token_preview: tokenPreview,
          success: notificationSent,
          ...sendResult
        });

      } catch (error: any) {
        console.error(`❌ [${requestId}] Error sending to ${platform}:`, error);
        failedCount++;
        results.push({
          platform,
          endpoint_type: endpointType,
          token_preview: tokenPreview,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`🚀 [${requestId}] Complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        request_id: requestId,
        sent: sentCount,
        failed: failedCount,
        total: tokens.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error(`❌ [${requestId}] Error in send-native-push:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message, request_id: requestId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// =============================================================================
// FCM NOTIFICATION SENDER
// =============================================================================
async function sendFCMNotification(
  token: string, 
  title: string, 
  body: string, 
  data?: Record<string, any>,
  requestId?: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.error(`❌ [${requestId}] FCM_SERVER_KEY not configured`);
      return { success: false, error: 'FCM_SERVER_KEY not configured' };
    }

    const payload = {
      to: token,
      notification: {
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      },
      data: data || {}
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ [${requestId}] FCM failed:`, result);
      return { success: false, status: response.status, error: JSON.stringify(result) };
    }

    console.log(`✅ [${requestId}] FCM sent successfully`);
    return { success: true, status: response.status };

  } catch (error: any) {
    console.error(`❌ [${requestId}] FCM error:`, error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// APNs JWT TOKEN CREATION (ES256)
// =============================================================================
async function createAppleJWT(
  teamId: string, 
  keyId: string, 
  privateKey: string,
  requestId?: string
): Promise<string> {
  const header = {
    alg: "ES256",
    kid: keyId,
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Clean and decode private key
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  
  console.log(`🔑 [${requestId}] Key data length: ${keyData.length} chars`);
  
  const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const signatureB64 = base64urlEncode(new Uint8Array(signature));
  return `${signatureInput}.${signatureB64}`;
}

// =============================================================================
// APNs NOTIFICATION SENDER - REAL IMPLEMENTATION
// =============================================================================
async function sendAPNSNotification(
  token: string, 
  title: string, 
  body: string, 
  data?: Record<string, any>,
  requestId?: string
): Promise<{ success: boolean; status?: number; apns_id?: string; error?: any }> {
  try {
    // Get APNs configuration from environment
    const teamId = Deno.env.get('APPLE_TEAM_ID');
    const keyId = Deno.env.get('APPLE_KEY_ID_PUSH');
    const privateKey = Deno.env.get('APPLE_PRIVATE_KEY');
    const bundleId = Deno.env.get('APPLE_BUNDLE_ID') || 'eu.m1ssion.app';
    const apnsEnvironment = Deno.env.get('APNS_ENVIRONMENT') || 'development';
    
    console.log(`📋 [${requestId}] APNs config check:`, { 
      hasTeamId: !!teamId, 
      hasKeyId: !!keyId, 
      hasPrivateKey: !!privateKey,
      bundleId,
      environment: apnsEnvironment
    });

    // Check required configuration
    if (!teamId || !keyId || !privateKey) {
      console.error(`❌ [${requestId}] APNs config MISSING!`);
      return { 
        success: false, 
        error: {
          message: 'APNs configuration missing',
          missing: {
            APPLE_TEAM_ID: !teamId,
            APPLE_KEY_ID_PUSH: !keyId,
            APPLE_PRIVATE_KEY: !privateKey
          }
        }
      };
    }

    // Create JWT for APNs authentication
    console.log(`🔐 [${requestId}] Creating APNs JWT...`);
    const jwtToken = await createAppleJWT(teamId, keyId, privateKey, requestId);
    
    // 🛡️ HARDENING: Validate JWT before sending
    if (!jwtToken || jwtToken.length < 100) {
      console.error(`❌ [${requestId}] JWT creation failed or too short: length=${jwtToken?.length || 0}`);
      return { 
        success: false, 
        error: { message: 'JWT creation failed', jwt_length: jwtToken?.length || 0 }
      };
    }
    
    console.log(`✅ [${requestId}] JWT created: length=${jwtToken.length}, preview=${jwtToken.substring(0, 30)}...`);

    // Determine APNs endpoint based on environment
    const apnsHost = apnsEnvironment === 'production' 
      ? 'https://api.push.apple.com'
      : 'https://api.sandbox.push.apple.com';

    const apnsUrl = `${apnsHost}/3/device/${token}`;

    console.log(`📱 [${requestId}] Sending APNs request:`, {
      tokenPreview: maskToken(token),
      bundleId,
      environment: apnsEnvironment,
      endpoint: apnsHost
    });

    // APNs payload (follows Apple's spec)
    const apnsPayload = {
      aps: {
        alert: {
          title: title,
          body: body
        },
        badge: 1,
        sound: 'default',
        'mutable-content': 1
      },
      // Custom data at root level (not inside aps)
      ...data,
      m1ssion_timestamp: new Date().toISOString()
    };

    const response = await fetch(apnsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'apns-expiration': '0'
      },
      body: JSON.stringify(apnsPayload)
    });

    const apnsId = response.headers.get('apns-id');
    
    console.log(`📥 [${requestId}] APNs response:`, {
      status: response.status,
      statusText: response.statusText,
      apnsId
    });

    if (response.ok || response.status === 200) {
      console.log(`✅ [${requestId}] APNs notification sent! apns-id: ${apnsId}`);
      return { 
        success: true, 
        status: response.status, 
        apns_id: apnsId || undefined,
        apns_env: apnsEnvironment,
        topic: bundleId
      };
    }

    // Handle error response
    let errorData: any = {};
    try {
      const errorText = await response.text();
      errorData = errorText ? JSON.parse(errorText) : { status: response.status };
    } catch {
      errorData = { status: response.status, statusText: response.statusText };
    }
    
    console.error(`❌ [${requestId}] APNs FAILED:`, {
      status: response.status,
      error: errorData,
      token: maskToken(token)
    });
    
    return { 
      success: false, 
      status: response.status,
      apns_id: apnsId || undefined,
      error: errorData
    };

  } catch (error: any) {
    console.error(`❌ [${requestId}] APNs exception:`, error);
    return { success: false, error: { message: error.message, stack: error.stack } };
  }
}
