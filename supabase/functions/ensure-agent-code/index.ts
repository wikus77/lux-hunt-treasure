
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// The reserved code specifically for wikus77@hotmail.it
const RESERVED_ADMIN_CODE = 'AG-X019';
const RESERVED_ADMIN_EMAIL = 'wikus77@hotmail.it';

// Generate a unique agent code with exclusion for admin code
const generateAgentCode = async (supabase: any): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  let code: string;
  let exists = true;

  while (exists) {
    // Generate a random code
    const random = Array.from({ length: 5 }, () =>
      characters[Math.floor(Math.random() * characters.length)]
    ).join('');

    code = `AG-${random}`;
    
    // Skip if this is the reserved admin code
    if (code === RESERVED_ADMIN_CODE) {
      continue;
    }

    // Check if the code already exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('agent_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error checking code uniqueness:', error);
      throw error;
    }

    exists = !!data;
  }

  return code;
};

// Ensures the admin user has the reserved code
const ensureAdminCode = async (supabase: any): Promise<void> => {
  try {
    // Find the admin user by email
    const { data: adminUser, error: userError } = await supabase
      .from('profiles')
      .select('id, agent_code')
      .eq('email', RESERVED_ADMIN_EMAIL)
      .maybeSingle();

    if (userError) {
      console.error('Error finding admin user:', userError);
      return;
    }

    // If admin user exists but doesn't have the reserved code, update it
    if (adminUser && adminUser.agent_code !== RESERVED_ADMIN_CODE) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ agent_code: RESERVED_ADMIN_CODE })
        .eq('id', adminUser.id);

      if (updateError) {
        console.error('Error setting admin code:', updateError);
      } else {
        console.log(`Reserved code ${RESERVED_ADMIN_CODE} set for admin user`);
      }
    }
    
    // Check if any other user incorrectly has the admin code and reset it
    const { data: wrongUsers, error: wrongUsersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('agent_code', RESERVED_ADMIN_CODE)
      .neq('email', RESERVED_ADMIN_EMAIL);

    if (wrongUsersError) {
      console.error('Error checking for unauthorized admin code usage:', wrongUsersError);
      return;
    }

    // Fix any unauthorized usage of the admin code
    if (wrongUsers && wrongUsers.length > 0) {
      for (const user of wrongUsers) {
        const newCode = await generateAgentCode(supabase);
        const { error: fixError } = await supabase
          .from('profiles')
          .update({ agent_code: newCode })
          .eq('id', user.id);

        if (fixError) {
          console.error(`Error fixing unauthorized admin code for user ${user.id}:`, fixError);
        } else {
          console.log(`Fixed unauthorized admin code usage for user ${user.id}, assigned ${newCode}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in admin code management:', error);
  }
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
    
    // Ensure the admin has the correct code and no one else has it
    await ensureAdminCode(supabase);
    
    // Get the user's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('agent_code, email')
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
      // If this is the admin user, assign the reserved code
      if (profile && profile.email === RESERVED_ADMIN_EMAIL) {
        agentCode = RESERVED_ADMIN_CODE;
      } else {
        // Generate a new unique agent code for non-admin users
        agentCode = await generateAgentCode(supabase);
      }
      
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
