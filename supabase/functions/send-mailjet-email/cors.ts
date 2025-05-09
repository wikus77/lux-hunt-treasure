
// Define CORS headers for browser compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to handle CORS preflight requests
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}
