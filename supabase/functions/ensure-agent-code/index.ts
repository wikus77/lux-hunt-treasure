
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// Generate a unique agent code
const generateAgentCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'AG-';
  
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Ensure the agent code is unique
const ensureUniqueCode = async (supabase: any, code: string): Promise<string> => {
  // Check if the code already exists
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('agent_code', code)
    .limit(1);

  if (error) {
    console.error('Error checking code uniqueness:', error);
    throw error;
  }

  // If the code exists, generate a new one recursively
  if (data && data.length > 0) {
    return ensureUniqueCode(supabase, generateAgentCode());
  }

  return code;
};

Deno.serve(async (req) => {
  try {
    // Get the request body
    const { userId } = await req.json();
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {  // PGRST116 is "no rows returned"
      throw error;
    }

    let agentCode: string;
    
    // If the user already has an agent code, return it
    if (profile && profile.agent_code) {
      agentCode = profile.agent_code;
    } else {
      // Generate a new unique agent code
      agentCode = await ensureUniqueCode(supabase, generateAgentCode());
      
      // Update the user's profile with the new agent code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ agent_code: agentCode })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    }

    // Return the agent code
    return new Response(
      JSON.stringify({ 
        success: true, 
        agentCode
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
