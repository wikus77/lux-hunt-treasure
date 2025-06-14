
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Sentry integration
let Sentry: any = null;
try {
  const { Toucan } = await import("https://esm.sh/toucan-js");
  const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
  
  if (SENTRY_DSN) {
    Sentry = new Toucan({
      dsn: SENTRY_DSN,
      environment: "production",
      release: "m1ssion@3.0.0",
    });
  }
} catch (e) {
  console.error("Sentry initialization failed:", e);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      error_message, 
      url, 
      user_id, 
      device, 
      browser_info,
      stack_trace,
      severity = "info"
    } = await req.json();
    
    // Basic validation
    if (!error_message) {
      return new Response(
        JSON.stringify({ success: false, error: "Error message is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseKey || !supabaseUrl) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Log to runtime_logs table
    const { data: logData, error: logError } = await supabase
      .from("runtime_logs")
      .insert({
        error_message,
        url,
        user_id,
        device,
        browser_info,
      })
      .select();
      
    if (logError) {
      throw new Error(`Error logging to runtime_logs: ${logError.message}`);
    }
    
    // If severity is high, also log to system_logs
    if (severity === "high" || severity === "error") {
      const { error: sysLogError } = await supabase
        .from("system_logs")
        .insert({
          severity,
          error_message,
          url,
          user_id,
          device,
          stack_trace,
          user_agent: browser_info
        });
        
      if (sysLogError) {
        console.error(`Error logging to system_logs: ${sysLogError.message}`);
      }
      
      // Check if high severity and needs immediate alert
      if (severity === "high") {
        try {
          await sendHighSeverityAlert(supabase, {
            error_message,
            url,
            user_id,
            device,
            browser_info,
          });
        } catch (alertError) {
          console.error("Failed to send high severity alert:", alertError);
        }
      }
    }
    
    // Log to Sentry if available
    if (Sentry) {
      Sentry.setContext("user", { id: user_id });
      Sentry.setContext("device", { device });
      Sentry.setContext("browser", { browser_info });
      Sentry.setExtra("url", url);
      
      if (stack_trace) {
        Sentry.captureException(new Error(error_message), { 
          extra: { stack_trace } 
        });
      } else {
        Sentry.captureMessage(error_message, severity === "high" ? "fatal" : severity);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Error logged successfully",
      log_id: logData?.[0]?.id
    }), { 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });

  } catch (err) {
    console.error("Error logging error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { 
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });
  }
});

async function sendHighSeverityAlert(supabase: any, errorData: any) {
  // Send email alert
  await supabase.functions.invoke("send-mailjet-email", {
    body: {
      recipient_email: "tech@m1ssion.com",
      subject: `[URGENT] M1SSION Error Alert - ${errorData.error_message.substring(0, 30)}...`,
      template_id: "error-alert",
      variables: {
        error_message: errorData.error_message,
        url: errorData.url,
        user_id: errorData.user_id || "Not available",
        device: errorData.device || "Not available",
        browser_info: errorData.browser_info || "Not available",
        timestamp: new Date().toISOString()
      }
    }
  });
  
  // Send Telegram alert if configured
  const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
  
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const message = `🚨 *M1SSION HIGH SEVERITY ERROR*\n\n` +
                   `*Error:* ${errorData.error_message}\n` +
                   `*URL:* ${errorData.url}\n` +
                   `*User:* ${errorData.user_id || "Unknown"}\n` +
                   `*Device:* ${errorData.device || "Unknown"}\n` +
                   `*Time:* ${new Date().toISOString()}`;
    
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });
  }
}
