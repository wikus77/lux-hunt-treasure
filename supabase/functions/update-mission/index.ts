// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
};

const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid JWT token');
    }

    // Verify email hash
    const emailHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.email!));
    const emailHash = Array.from(new Uint8Array(emailHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (emailHash !== AUTHORIZED_EMAIL_HASH) {
      throw new Error('Unauthorized access - invalid email hash');
    }

    // Calculate super admin status
    const isSuperAdmin = emailHash === AUTHORIZED_EMAIL_HASH;

    // Get client info
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check rate limiting (skip for super admin)
    if (!isSuperAdmin) {
      const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        ip_addr: clientIP,
        api_endpoint: '/update-mission',
        max_requests: 10,
        window_minutes: 5
      });

      if (rateLimitError || !rateLimitResult) {
        await supabase.rpc('block_ip', {
          ip_addr: clientIP,
          block_duration_minutes: 15,
          block_reason: 'rate_limit_exceeded_update_mission'
        });
        
        throw new Error('Rate limit exceeded');
      }
    } else {
      console.log('🔓 [update-mission] rate-limit BYPASS for super-admin');
    }

    const { missionData } = await req.json();
    
    // Validate only essential required fields (city and country)
    if (!missionData?.city?.trim() || !missionData?.country?.trim()) {
      throw new Error('Missing required fields: city, country');
    }

    console.log(`🎯 MISSION UPDATE: Updating mission data for user ${user.id}`);

    // Deactivate current active mission
    await supabase
      .from('current_mission_data')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new mission data (handle optional fields)
    const { data: newMission, error: insertError } = await supabase
      .from('current_mission_data')
      .insert({
        city: missionData.city?.trim() || '',
        country: missionData.country?.trim() || '',
        street: missionData.street?.trim() || '',
        street_number: missionData.street_number?.trim() || '',
        prize_type: missionData.prize_type?.trim() || '',
        prize_color: missionData.prize_color?.trim() || '',
        prize_material: missionData.prize_material?.trim() || '',
        prize_category: missionData.prize_category?.trim() || '',
        created_by: user.id,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to update mission: ${insertError.message}`);
    }

    // Log the update action
    await supabase.from('admin_logs').insert({
      user_id: user.id,
      event_type: 'mission_updated',
      ip_address: clientIP,
      user_agent: userAgent,
      context: 'Mission data updated via admin panel',
      status_code: 200,
      note: `Mission updated: ${missionData.city}, ${missionData.country} - ${missionData.prize_type} (${missionData.prize_color} ${missionData.prize_material})`
    });

    console.log(`✅ MISSION UPDATE: Mission data updated successfully for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Mission updated successfully',
      missionId: newMission.id,
      missionData: newMission,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ UPDATE MISSION ERROR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: error.message.includes('Unauthorized') ? 403 : 
             error.message.includes('Rate limit') ? 429 : 
             error.message.includes('Missing required') ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});