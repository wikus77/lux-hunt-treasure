import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type"
};
serve((req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: cors
    });
  }
  const body = JSON.stringify({
    publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? null,
    alg: "ES256",
    kty: "EC"
  });
  return new Response(body, {
    headers: {
      ...cors,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
});
