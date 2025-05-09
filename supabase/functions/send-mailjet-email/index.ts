
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleCorsPreflightRequest, corsHeaders } from "./cors.ts";
import { handleEmailRequest } from "./email-handler.ts";

// Main handler function for the edge function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  
  return handleEmailRequest(req);
};

// Start the server
serve(handler);
