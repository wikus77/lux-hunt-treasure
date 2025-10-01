// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[NORAH-CTX] Start - method:', req.method);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NORAH-CTX] Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization', stage: 'auth_header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[NORAH-CTX] Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized', stage: 'auth_user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log('[NORAH-CTX] Authenticated user:', userId);

    // Parallel queries for maximum performance
    const [
      profileResult,
      missionResult,
      cluesResult,
      buzzResult,
      finalshotResult,
      messagesResult
    ] = await Promise.all([
      supabase.from('agent_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('agent_missions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('agent_clues').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('agent_buzz_actions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('agent_finalshot_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('norah_messages').select('role, content, intent, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    ]);

    // Resolve agent_code with fallback chain
    let agentCode = 'AG-UNKNOWN';
    let nickname = null;
    
    if (profileResult.data) {
      agentCode = profileResult.data.agent_code;
      nickname = profileResult.data.nickname;
      console.log('[NORAH-CTX] Agent from agent_profiles:', agentCode);
    } else {
      console.log('[NORAH-CTX] agent_profiles empty, fallback to profiles');
      const fallbackProfile = await supabase.from('profiles').select('agent_code, full_name').eq('id', userId).maybeSingle();
      
      if (fallbackProfile.error) {
        console.error('[NORAH-CTX] Fallback profiles query error:', fallbackProfile.error);
      }
      
      if (fallbackProfile.data?.agent_code) {
        agentCode = fallbackProfile.data.agent_code;
        nickname = fallbackProfile.data.full_name;
        console.log('[NORAH-CTX] Agent from profiles:', agentCode);
      } else {
        console.warn('[NORAH-CTX] No agent_code found in profiles, using AG-UNKNOWN');
      }
    }

    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const buzzToday = (buzzResult.data || []).filter(b => 
      b.created_at.startsWith(today)
    ).length;
    const finalshotToday = (finalshotResult.data || []).filter(f => 
      f.created_at.startsWith(today)
    ).length;

    const context = {
      agent: {
        code: agentCode,
        nickname: nickname || null
      },
      mission: missionResult.data ? {
        id: missionResult.data.mission_id,
        progress: missionResult.data.progress
      } : null,
      stats: {
        clues: cluesResult.data?.length || 0,
        buzz_today: buzzToday,
        finalshot_today: finalshotToday
      },
      clues: (cluesResult.data || []).map(c => ({
        clue_id: c.clue_id,
        meta: c.meta,
        created_at: c.created_at
      })),
      finalshot_recent: (finalshotResult.data || []).map(f => ({
        result: f.result,
        created_at: f.created_at
      })),
      recent_msgs: (messagesResult.data || []).reverse().slice(-6).map(m => ({
        role: m.role,
        content: m.content,
        intent: m.intent
      }))
    };

    const elapsed = Date.now() - startTime;
    console.log('[NORAH-CTX] Success - elapsed:', elapsed, 'ms, agent:', agentCode);

    return new Response(JSON.stringify(context), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('[NORAH-CTX] Error after', elapsed, 'ms:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      stage: 'exception'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
