
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
    const SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');
    
    if (!SECRET_KEY) {
      throw new Error('TURNSTILE_SECRET_KEY is not configured');
    }
    
    // Log the verification attempt
    console.log(`Verifying Turnstile token for action: ${action}`);
    
    // Special bypass case for development
    if (token === 'BYPASS_FOR_DEVELOPMENT') {
      console.log('Development bypass token detected, allowing access');
      return new Response(
        JSON.stringify({ 
          success: true, 
          score: 1.0,
          action,
          bypass: true,
          captcha_token: token // Add this for compatibility with Supabase Auth
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
    
    // Verify the token with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    
    // Verify the token with Cloudflare Turnstile
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('Turnstile verification response:', data);
    
    // Check if verification was successful
    if (data.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          action: action || 'default',
          captcha_token: token // Add this for compatibility with Supabase Auth
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
          error: data['error-codes'] ? data['error-codes'].join(', ') : 'Verification failed',
          details: data
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
    console.error('Error verifying Turnstile token:', error);
    
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
