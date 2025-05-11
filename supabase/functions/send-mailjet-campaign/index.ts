
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Correct import for Mailjet library
import mailjet from "npm:node-mailjet@6.0.0";

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

    // Initialize Mailjet client with API keys
    const mailjetClient = mailjet.apiConnect(
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE
    );

    console.log("Mailjet client initialized successfully");
    
    // Step 1: Find the campaign by name
    console.log(`Looking for campaign with name "${campaignName}"...`);
    
    const campaignsResponse = await mailjetClient
      .get("campaign")
      .request({
        Limit: 100,
        Sort: "-CreatedAt"
      });
    
    if (!campaignsResponse.body || !Array.isArray(campaignsResponse.body.Data)) {
      throw new Error("Invalid campaigns response from Mailjet API");
    }
    
    console.log(`Retrieved ${campaignsResponse.body.Data.length} campaigns`);
    
    // Find campaign by name (case-insensitive)
    const campaign = campaignsResponse.body.Data.find(
      (c: any) => c.Title && c.Title.toLowerCase() === campaignName.toLowerCase()
    );
    
    if (!campaign) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Campagna "${campaignName}" non trovata`,
          campaigns: campaignsResponse.body.Data.map((c: any) => ({ id: c.ID, title: c.Title }))
        }), 
        { 
          status: 404,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log(`Found campaign "${campaignName}" with ID ${campaign.ID}`);
    
    // For testing purposes, we might want to just return the campaign details
    if (testMode) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Campagna trovata (test mode - no sending)",
          campaign: {
            id: campaign.ID,
            title: campaign.Title,
            status: campaign.Status
          }
        }), 
        { 
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Step 2: Send the campaign
    console.log(`Sending campaign "${campaignName}" (ID: ${campaign.ID})...`);
    
    try {
      const sendResponse = await mailjetClient
        .post(`campaign/${campaign.ID}/send`)
        .request();
      
      console.log("Campaign send response:", sendResponse.body);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Campagna "${campaignName}" inviata con successo!`,
          campaignId: campaign.ID,
          response: sendResponse.body
        }), 
        { 
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    } catch (sendError: any) {
      console.error("Error sending campaign:", sendError);
      
      // Handle specific error cases
      let errorMessage = "Errore durante l'invio della campagna";
      let statusCode = 500;
      
      // Check for common Mailjet API errors
      if (sendError.statusCode === 400) {
        errorMessage = "La campagna non è in stato valido per essere inviata. Verificare che sia in stato 'draft'.";
        statusCode = 400;
      } else if (sendError.statusCode === 403) {
        errorMessage = "Non hai i permessi per inviare questa campagna.";
        statusCode = 403;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          details: sendError.message || JSON.stringify(sendError)
        }), 
        { 
          status: statusCode,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
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
