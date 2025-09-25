
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Correct import for Mailjet library - temporarily disabled for build
// import mailjet from "npm:node-mailjet@6.0.0";

// Add CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { campaignName, testMode = false } = await req.json();

    console.log(`Processing campaign send request for "${campaignName}" (test mode: ${testMode})`);

    // Validate required fields
    if (!campaignName) {
      return new Response(
        JSON.stringify({ success: false, error: "Nome campagna mancante" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Get Mailjet API keys from environment variables
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");
    
    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      console.error("Mailjet API keys not found in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "API keys Mailjet non configurate"
        }), 
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Return temporary response until mailjet is properly configured
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email service temporarily disabled - campaign would be sent",
        campaignName
      }), 
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );

  } catch (error: any) {
    console.error("General error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Errore durante l'elaborazione della richiesta: " + error.message,
        details: error.stack || "No stack trace available"
      }), 
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
