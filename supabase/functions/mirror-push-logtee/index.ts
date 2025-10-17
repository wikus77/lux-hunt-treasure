import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Payload = {
  title: string;
  body: string;
  url?: string | null;
  target: 'all' | { userIds: string[] };
  invocation_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get auth user from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using is_admin_secure()
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_secure');
    
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload
    const payload: Payload = await req.json();

    if (!payload.title?.trim() || !payload.body?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare metadata for target
    let metadata = null;
    if (payload.target !== 'all' && typeof payload.target === 'object' && payload.target.userIds) {
      metadata = { userIds: payload.target.userIds };
    }

    // Insert into mirror_push.notification_logs
    const logData = {
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      sent_by: user.id,
      provider: 'TEE',
      status_code: 202,
      title: payload.title.trim(),
      body: payload.body.trim(),
      url: payload.url || null,
      endpoint: null,
      project_ref: 'vkjrqirvdvjbemsfzxof',
      invocation_id: payload.invocation_id || null,
      metadata: metadata
    };

    const { error: insertError } = await supabase
      .schema('mirror_push')
      .from('notification_logs')
      .insert(logData);

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mirror push logtee error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})