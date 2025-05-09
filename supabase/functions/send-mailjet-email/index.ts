
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "npm:node-mailjet@6.0.0";
import { corsHeaders } from "./cors.ts";
import { handleEmailRequest } from "./email-handler.ts";

/**
 * Main handler for the edge function
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Process the email request
  return await handleEmailRequest(req);
};

// Start the server
serve(handler);
