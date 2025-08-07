// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// QR Code Redemption Edge Function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QRRedemptionRequest {
  code: string;
  userLat?: number;
  userLng?: number;
}

interface QRCode {
  id: string;
  code: string;
  location_name: string;
  lat: number;
  lng: number;
  reward_type: 'buzz' | 'clue' | 'enigma' | 'fake';
  reward_content: any;
  is_used: boolean;
  expires_at: string | null;
  created_by: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { code, userLat, userLng }: QRRedemptionRequest = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'QR code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🔍 QR Redemption attempt: ${code} by user: ${user.id}`);

    // Get QR code data
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_buzz_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (qrError || !qrCode) {
      await logRedemptionAttempt(supabase, null, user.id, userLat, userLng, 0, false, 'QR code not found');
      return new Response(
        JSON.stringify({ success: false, error: 'QR code not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const qr = qrCode as QRCode;

    // Check if already used
    if (qr.is_used) {
      await logRedemptionAttempt(supabase, qr.id, user.id, userLat, userLng, 0, false, 'QR code already used');
      return new Response(
        JSON.stringify({ success: false, error: 'QR code has already been used' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if expired
    if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
      await logRedemptionAttempt(supabase, qr.id, user.id, userLat, userLng, 0, false, 'QR code expired');
      return new Response(
        JSON.stringify({ success: false, error: 'QR code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check location if provided
    let distance = 0;
    const MAX_DISTANCE_METERS = 100; // 100 meters radius

    if (userLat && userLng) {
      const { data: distanceData, error: distanceError } = await supabase
        .rpc('calculate_qr_distance', {
          lat1: userLat,
          lng1: userLng,
          lat2: qr.lat,
          lng2: qr.lng
        });

      if (distanceError) {
        console.error('Distance calculation error:', distanceError);
      } else {
        distance = distanceData || 0;
      }

      if (distance > MAX_DISTANCE_METERS) {
        await logRedemptionAttempt(supabase, qr.id, user.id, userLat, userLng, distance, false, 'Too far from QR location');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `You must be within ${MAX_DISTANCE_METERS}m of the QR code location. You are ${Math.round(distance)}m away.`,
            distance: Math.round(distance),
            maxDistance: MAX_DISTANCE_METERS
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Process reward based on type
    let rewardMessage = '';
    let rewardGranted: any = {};

    switch (qr.reward_type) {
      case 'buzz':
        // Grant free buzz credit
        const { error: creditError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: user.id,
            free_buzz_credit: 1
          }, {
            onConflict: 'user_id',
            update: { free_buzz_credit: 'user_credits.free_buzz_credit + 1' }
          });

        if (creditError) {
          console.error('Credit grant error:', creditError);
          rewardMessage = 'Buzz trovato! (Errore nell\'aggiunta del credito)';
        } else {
          rewardMessage = '🎯 Fantastico! Hai trovato un BUZZ gratuito!';
          rewardGranted = { type: 'buzz', value: 1 };
        }
        break;

      case 'clue':
        rewardMessage = qr.reward_content?.message || '🔍 Hai scoperto un indizio segreto!';
        rewardGranted = { type: 'clue', content: qr.reward_content };
        break;

      case 'enigma':
        rewardMessage = qr.reward_content?.enigma || '🧩 Hai trovato un enigma misterioso!';
        rewardGranted = { type: 'enigma', content: qr.reward_content };
        break;

      case 'fake':
        rewardMessage = qr.reward_content?.fakeMessage || '🌀 Questo QR è un depistaggio... continua a cercare!';
        rewardGranted = { type: 'fake', message: rewardMessage };
        break;

      default:
        rewardMessage = '❓ QR code sconosciuto';
    }

    // Mark QR as used
    const { error: updateError } = await supabase
      .from('qr_buzz_codes')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString(),
        usage_attempts: qr.usage_attempts + 1
      })
      .eq('id', qr.id);

    if (updateError) {
      console.error('QR update error:', updateError);
    }

    // Log successful redemption
    await logRedemptionAttempt(supabase, qr.id, user.id, userLat, userLng, distance, true, null, rewardGranted);

    console.log(`✅ QR ${code} successfully redeemed by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: rewardMessage,
        reward: rewardGranted,
        location: qr.location_name,
        distance: Math.round(distance)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('QR redemption error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function logRedemptionAttempt(
  supabase: any,
  qrCodeId: string | null,
  userId: string,
  userLat?: number,
  userLng?: number,
  distance: number = 0,
  success: boolean = false,
  failureReason?: string | null,
  rewardGranted?: any
) {
  try {
    await supabase
      .from('qr_redemption_logs')
      .insert({
        qr_code_id: qrCodeId,
        user_id: userId,
        user_lat: userLat,
        user_lng: userLng,
        distance_meters: distance,
        success,
        failure_reason: failureReason,
        reward_granted: rewardGranted
      });
  } catch (error) {
    console.error('Failed to log redemption attempt:', error);
  }
}