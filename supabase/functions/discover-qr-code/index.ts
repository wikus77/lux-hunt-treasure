// Secure QR Code Discovery Edge Function
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}

interface DiscoveryRequest {
  qr_code: string;
  discovery_latitude?: number;
  discovery_longitude?: number;
  scanned_at?: string;
}

interface DiscoveryResponse {
  success: boolean;
  message: string;
  reward?: {
    type: string;
    value: string;
    description: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid authentication' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body: DiscoveryRequest = await req.json();
    const { qr_code, discovery_latitude, discovery_longitude } = body;

    if (!qr_code) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'QR code is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate QR code exists and is active
    const { data: qrCodeData, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, code, reward_type, reward_value, lat, lng, is_active, expires_at')
      .eq('code', qr_code)
      .eq('is_active', true)
      .single();

    if (qrError || !qrCodeData) {
      console.log('Invalid QR code attempted:', qr_code, 'by user:', user.id);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or inactive QR code' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if already discovered by this user
    const { data: existingDiscovery } = await supabase
      .from('qr_code_discoveries')
      .select('id')
      .eq('qr_code_id', qrCodeData.id)
      .eq('user_id', user.id)
      .single();

    if (existingDiscovery) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'QR code already discovered' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Record the discovery
    const { error: discoveryError } = await supabase
      .from('qr_code_discoveries')
      .insert({
        qr_code_id: qrCodeData.id,
        user_id: user.id,
        discovered_at: new Date().toISOString(),
        discovery_latitude,
        discovery_longitude
      });

    if (discoveryError) {
      console.error('Discovery recording error:', discoveryError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to record discovery' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log security event
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'qr_code_discovered',
        user_id: user.id,
        details: {
          qr_code_id: qrCodeData.id,
          code: qr_code,
          discovery_location: discovery_latitude && discovery_longitude ? 
            { lat: discovery_latitude, lng: discovery_longitude } : null,
          timestamp: new Date().toISOString()
        }
      });

    const response: DiscoveryResponse = {
      success: true,
      message: 'QR code successfully discovered!',
      reward: {
        type: qrCodeData.reward_type || 'buzz_credit',
        value: qrCodeData.reward_value || '10',
        description: `You found a ${qrCodeData.reward_type}!`
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('QR discovery error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});