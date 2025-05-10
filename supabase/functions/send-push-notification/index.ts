
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationPayload {
  userId?: string; // Optional - if null, send to all users
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const apiKey = Deno.env.get("FCM_SERVER_KEY");
    if (!apiKey) {
      throw new Error("FCM_SERVER_KEY not found");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: PushNotificationPayload = await req.json();
    const { userId, title, body, data } = payload;

    // Validate the required fields
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the FCM tokens for the user(s)
    let tokens: string[] = [];

    if (userId) {
      // Send to specific user
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from("device_tokens")
        .select("token")
        .eq("user_id", userId);

      if (tokenError) {
        throw new Error(`Error fetching tokens: ${tokenError.message}`);
      }

      tokens = tokenData.map((t) => t.token);
    } else {
      // Send to all users
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from("device_tokens")
        .select("token");

      if (tokenError) {
        throw new Error(`Error fetching tokens: ${tokenError.message}`);
      }

      tokens = tokenData.map((t) => t.token);
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No device tokens found to notify" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Sending notification to ${tokens.length} tokens`);

    // Send the FCM notification
    const fcmEndpoint = "https://fcm.googleapis.com/fcm/send";
    
    const fcmPayload = {
      registration_ids: tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const fcmResponse = await fetch(fcmEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${apiKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const fcmResult = await fcmResponse.json();

    // Store the notification in the database for in-app access
    const { data: notificationData, error: notificationError } = await supabaseClient
      .from("notifications")
      .insert([
        {
          user_id: userId, // Null for all users
          title,
          body,
          data: data || {}
        }
      ]);

    if (notificationError) {
      console.error("Error storing notification:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        message: "Notification sent", 
        result: fcmResult,
        recipients: tokens.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
