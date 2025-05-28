
// Define CORS headers for browser compatibility - updating to include authentication headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mailjet-api-key, x-mailjet-api-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
