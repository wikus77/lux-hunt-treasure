
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreRegistrationData {
  name: string;
  email: string;
  referrer?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const requestData = await req.json();
    console.log("Received pre-registration request:", requestData);
    
    const { name, email, referrer } = requestData as PreRegistrationData;
    
    // Validation
    if (!name || !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Nome ed email sono campi obbligatori" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('pre_registrations')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    console.log("Check for existing user:", { existingUser, checkError });
    
    if (checkError) {
      console.error("Error checking existing user:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore durante la verifica dell'email", 
          details: checkError 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Questa email è già stata registrata",
          alreadyRegistered: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate referral code
    const referralCode = `${name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Insert pre-registration
    const { data: registration, error: registrationError } = await supabase
      .from('pre_registrations')
      .insert([{
        name,
        email,
        referrer,
        referral_code: referralCode,
        credits: 100
      }])
      .select();
    
    console.log("Registration result:", { registration, registrationError });
    
    if (registrationError) {
      console.error("Registration error:", registrationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore durante la registrazione", 
          details: registrationError 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Return success response with the user's referral code
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pre-registrazione completata con successo",
        referral_code: referralCode
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Errore del server", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
