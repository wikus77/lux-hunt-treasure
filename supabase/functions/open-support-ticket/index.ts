// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: open-support-ticket
// Creates support tickets from AI interactions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, issue, category = 'other' } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, agent_code')
      .eq('id', userId)
      .single();

    // Log as admin_log entry (support tickets table can be added later)
    const { data, error } = await supabaseClient
      .from('admin_logs')
      .insert({
        event_type: 'support_ticket_ai',
        user_id: userId,
        note: issue,
        context: category,
        device: req.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        ticketId: data.id,
        message: 'Ticket aperto con successo. Il team risponderà presto.',
        agentCode: profile?.agent_code || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[open-support-ticket] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
