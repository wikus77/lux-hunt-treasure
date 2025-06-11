
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the token from the request body
    const { token, action } = await req.json();
    
    // Get the secret key from environment variables
    const SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');
    
    if (!SECRET_KEY) {
      throw new Error('RECAPTCHA_SECRET_KEY is not configured');
    }
    
    // Log the verification attempt
    console.log(`Verifying reCAPTCHA token for action: ${action}`);
    
    // Special bypass case for development
    if (token === 'BYPASS_FOR_DEVELOPMENT') {
      console.log('Development bypass token detected, allowing access');
      return new Response(
        JSON.stringify({ 
          success: true, 
          score: 1.0,
          action,
          bypass: true
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
    
    // Verify the token with Google
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('reCAPTCHA verification response:', data);
    
    // Check if verification was successful and score is high enough
    if (data.success && data.score >= 0.5) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          score: data.score,
          action: data.action
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          score: data.score || 0,
          error: data['error-codes'] ? data['error-codes'].join(', ') : 'Verification failed'
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  } catch (error: any) {
    console.error('Error verifying reCAPTCHA token:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
