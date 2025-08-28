import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOW = [
  "https://m1ssion.eu",
  "https://www.m1ssion.eu"
];

const corsHeaders = {
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "vary": "origin"
};

function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

serve(async (req) => {
  const reqId = generateRequestId();
  const origin = req.headers.get("origin") || "";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
            req.headers.get("cf-connecting-ip") ||
            "unknown";
  
  console.log(`[M1SSION FCM] req_${reqId} → ${req.method} request started`);
  console.log(`[M1SSION FCM] req_${reqId} → Origin: ${origin}, IP: ${ip}, UA: ${userAgent.substring(0, 50)}...`);

  const finalCors = {
    ...corsHeaders,
    "access-control-allow-origin": ALLOW.includes(origin) ? origin : "https://m1ssion.eu"
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`[M1SSION FCM] req_${reqId} → CORS preflight → OK`);
    return new Response(null, { headers: finalCors });
  }

  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    console.log(`[M1SSION FCM] req_${reqId} → payload parsed`);
    
    const { fid, token } = body;
    if (!fid || !token) {
      console.log(`[M1SSION FCM] req_${reqId} → missing fid/token → ERROR`);
      return new Response(
        JSON.stringify({ error: "fid and token required", reqId }), 
        { 
          status: 400, 
          headers: { ...finalCors, "content-type": "application/json" }
        }
      );
    }

    // JWT validation
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      console.log(`[M1SSION FCM] req_${reqId} → token missing → ERROR`);
      return new Response(
        JSON.stringify({ error: "Missing JWT token", reqId }), 
        { 
          status: 401, 
          headers: { ...finalCors, "content-type": "application/json" }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } }
      }
    );

    // Verify user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.log(`[M1SSION FCM] req_${reqId} → invalid JWT → ERROR: ${userError?.message}`);
      return new Response(
        JSON.stringify({ error: "Invalid JWT token", reqId }), 
        { 
          status: 401, 
          headers: { ...finalCors, "content-type": "application/json" }
        }
      );
    }

    console.log(`[M1SSION FCM] req_${reqId} → user authenticated: ${userData.user.id}`);

    // Check if FID exists with different user_id
    const { data: existingToken, error: checkError } = await supabase
      .from("fcm_tokens")
      .select("user_id, fid")
      .eq("fid", fid)
      .maybeSingle();
    
    if (checkError) {
      console.log(`[M1SSION FCM] req_${reqId} → check error → ERROR: ${checkError.message}`);
      throw checkError;
    }
    
    // If FID exists for different user, return conflict
    if (existingToken && existingToken.user_id !== userData.user.id) {
      console.log(`[M1SSION FCM] req_${reqId} → FID conflict → ERROR: fid ${fid} belongs to different user`);
      return new Response(
        JSON.stringify({ 
          error: "FID already associated with different user", 
          reqId,
          conflictingFid: fid
        }), 
        { 
          status: 409, 
          headers: { ...finalCors, "content-type": "application/json" }
        }
      );
    }

    // Upsert FCM token
    const { data, error } = await supabase
      .from("fcm_tokens")
      .upsert({ 
        user_id: userData.user.id, 
        fid, 
        token, 
        user_agent: userAgent, 
        ip: ip 
      }, { 
        onConflict: "fid" 
      })
      .select()
      .single();

    if (error) {
      console.log(`[M1SSION FCM] req_${reqId} → upsert error → ERROR: ${error.message}`);
      throw error;
    }

    const duration = Date.now() - startTime;
    console.log(`[M1SSION FCM] req_${reqId} → success after ${duration}ms → TOKEN_SAVED`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fid: data.fid,
        user_id: data.user_id,
        token_id: data.id,
        reqId,
        duration: `${duration}ms`
      }), 
      { 
        headers: { ...finalCors, "content-type": "application/json" }
      }
    );

  } catch (e) {
    const duration = Date.now() - startTime;
    const errorMsg = String(e);
    console.log(`[M1SSION FCM] req_${reqId} → error after ${duration}ms: ${errorMsg}`);
    
    return new Response(
      JSON.stringify({ 
        error: errorMsg, 
        reqId,
        duration: `${duration}ms`
      }), 
      { 
        status: 500, 
        headers: { ...finalCors, "content-type": "application/json" }
      }
    );
  }
});