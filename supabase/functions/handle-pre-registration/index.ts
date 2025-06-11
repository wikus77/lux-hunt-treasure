
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();
    
    console.log("📝 Pre-registration request:", { name, email });
    
    // ✅ NO CAPTCHA VALIDATION - Direct processing
    console.log("✅ Processing pre-registration - NO CAPTCHA validation");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate referral code
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store pre-registration
    const { data, error } = await supabase
      .from('pre_registrations')
      .insert({
        name,
        email,
        referral_code: referralCode
      })
      .select()
      .single();
    
    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("✅ Pre-registration saved successfully");
    
    return new Response(JSON.stringify({
      success: true,
      referralCode,
      message: "Pre-registrazione completata con successo"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error("❌ Error in handle-pre-registration:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Errore durante la pre-registrazione"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
