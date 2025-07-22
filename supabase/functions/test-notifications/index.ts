// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Test Edge Function for Push Notifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing notification system...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Schedule a test notification for 1 minute from now
    const testTime = new Date();
    testTime.setMinutes(testTime.getMinutes() + 1);

    const { error: scheduleError } = await supabase
      .from('scheduled_notifications')
      .insert({
        user_id: user.id,
        notification_type: 'test_notification',
        title: '🧪 Test Notification',
        message: 'This is a test notification to verify the system is working!',
        scheduled_for: testTime.toISOString(),
        payload: { test: true, url: '/dashboard' }
      });

    if (scheduleError) {
      console.error('❌ Error scheduling test notification:', scheduleError);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule test notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Immediately process notifications to test the system
    const { data: processData, error: processError } = await supabase.functions.invoke('process-scheduled-notifications');

    console.log('✅ Test notification scheduled and processing attempted');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test notification scheduled for 1 minute from now',
        scheduled_for: testTime.toISOString(),
        process_result: processData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Test notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™