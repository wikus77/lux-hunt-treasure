// © 2025 M1SSION™ - Store FCM Token Edge Function (FIXED)
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  console.log(`[FCM Store] ${req.method} request received`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[FCM Store] CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log(`[FCM Store] Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed', allowed: ['POST'] }),
      { 
        status: 405, 
        headers: corsHeaders
      }
    );
  }

  try {
    console.log('[FCM Store] Processing POST request...');
    // Parse request body first
    let requestData;
    try {
      requestData = await req.json();
      console.log('[FCM Store] Request data parsed:', { 
        hasFid: !!requestData.fid, 
        hasToken: !!requestData.token 
      });
    } catch (error) {
      console.error('[FCM Store] Invalid JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { fid, token } = requestData;
    if (!fid || !token) {
      console.error('[FCM Store] Missing fid or token:', { fid: !!fid, token: !!token });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          required: ['fid', 'token'],
          received: { fid: !!fid, token: !!token }
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client (for demo, we'll bypass auth for now)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get client info for audit
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    console.log(`[FCM Store] Storing token - FID: ${fid.substring(0, 8)}..., IP: ${clientIp}`);

    // For demo purposes, we'll create a test record without user authentication
    // In production, you'd validate the JWT and get the actual user_id
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Demo UUID

    // Insert/update FCM token record
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id: testUserId, // Demo user ID
        fid,
        token,
        user_agent: userAgent,
        ip: clientIp,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'fid',
      })
      .select()
      .single();

    if (error) {
      console.error('[FCM Store] Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store token',
          details: error.message,
          code: error.code
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`[FCM Store] ✅ Token stored successfully - ID: ${data.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        id: data.id,
        message: 'FCM token stored successfully (demo mode)',
        timestamp: new Date().toISOString(),
        demo: true
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('[FCM Store] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});