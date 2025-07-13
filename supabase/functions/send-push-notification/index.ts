
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Define CORS headers directly in this file instead of importing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OneSignal credentials are set
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      console.error("OneSignal credentials not found in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "OneSignal API keys not configured" 
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

    // Parse request body
    const { title, message, segments = ["All"], url } = await req.json();
    
    if (!title || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Title and message are required" 
        }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    console.log(`Sending push notification: "${title}" to segments: ${segments.join(", ")}`);

    // Prepare OneSignal request
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      included_segments: segments,
      url: url || "https://m1ssion.com"
    };

    // Send notification via OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify(notificationData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log("OneSignal API response:", responseData);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Notification sent successfully",
          data: responseData
        }),
        { 
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    } else {
      console.error("OneSignal API error:", responseData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to send notification",
          error: responseData
        }),
        { 
          status: response.status,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in send-push-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
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
};

serve(handler);
