
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { handleEmailRequest } from "./email-handler.ts";

/**
 * Main handler for the edge function
 */
const handler = async (req: Request): Promise<Response> => {
  console.log(`Processing ${req.method} request to send-mailjet-email`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Process the email request
  return await handleEmailRequest(req);
};

// Start the server
console.log("Starting send-mailjet-email edge function");
serve(handler);
