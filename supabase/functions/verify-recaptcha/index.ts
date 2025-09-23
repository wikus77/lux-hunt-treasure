
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔓 reCAPTCHA verification - COMPLETELY DISABLED");
    
    // ✅ ALWAYS RETURN SUCCESS - CAPTCHA COMPLETELY DISABLED
    return new Response(
      JSON.stringify({ 
        success: true, 
        score: 1.0,
        action: 'bypass',
        disabled: true,
        message: 'CAPTCHA completely disabled'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.log('reCAPTCHA error handled - returning success anyway:', error);
    
    // ✅ EVEN ON ERROR, RETURN SUCCESS - CAPTCHA DISABLED
    return new Response(
      JSON.stringify({ 
        success: true,
        score: 1.0,
        disabled: true,
        error_handled: true
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
