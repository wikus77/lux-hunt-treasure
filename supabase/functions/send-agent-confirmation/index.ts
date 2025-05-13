
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

interface AgentData {
  email: string;
  name: string;
  referral_code: string;
}

const mailjetApiKey = Deno.env.get("MJ_APIKEY_PUBLIC");
const mailjetSecretKey = Deno.env.get("MJ_APIKEY_PRIVATE");

if (!mailjetApiKey || !mailjetSecretKey) {
  console.error("Missing Mailjet API keys!");
  console.error("MJ_APIKEY_PUBLIC present:", !!mailjetApiKey);
  console.error("MJ_APIKEY_PRIVATE present:", !!mailjetSecretKey);
}

serve(async (req) => {
  console.log("Agent confirmation request received");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Make sure we're only accepting POST requests
  if (req.method !== "POST") {
    console.error("Invalid method:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    let requestData;
    try {
      // Parse the JSON body
      requestData = await req.json();
      
      // Log the raw request data for debugging
      console.log("Raw request data received:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email, name, referral_code } = requestData as AgentData;

    console.log("Agent confirmation request received for:", email);
    console.log("Name:", name);
    console.log("Referral code:", referral_code);

    // Validate that all required fields are present
    if (!email || !name || !referral_code) {
      console.error("Missing required fields:", { email, name, referral_code });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          received: { email, name, referral_code },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate Mailjet API keys
    if (!mailjetApiKey || !mailjetSecretKey) {
      console.error("Cannot send email: Mailjet API keys are not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Mailjet API keys not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Construct the Mailjet API request
    const mailjetData = {
      Messages: [
        {
          From: {
            Email: "noreply@m1ssion.com",
            Name: "M1SSION",
          },
          To: [
            {
              Email: email,
              Name: name,
            },
          ],
          TemplateID: 6977931,
          TemplateLanguage: true,
          Subject: "Benvenuto, Agente di M1SSION!",
          Variables: {
            name: name,
            referral_code: referral_code,
          },
          CustomCampaign: "agent_confirmation",
          TrackOpens: "enabled",
          TrackClicks: "enabled",
        },
      ],
    };

    console.log("Sending Mailjet request with data:", JSON.stringify(mailjetData, null, 2));

    // Call the Mailjet API to send the email
    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${mailjetApiKey}:${mailjetSecretKey}`
        )}`,
      },
      body: JSON.stringify(mailjetData),
    });

    console.log("Mailjet API response status:", mailjetResponse.status);
    
    let mailjetResult;
    try {
      mailjetResult = await mailjetResponse.json();
      console.log("Mailjet API response:", JSON.stringify(mailjetResult, null, 2));
    } catch (jsonError) {
      console.error("Failed to parse Mailjet response as JSON:", jsonError);
      const textResponse = await mailjetResponse.text();
      console.log("Mailjet text response:", textResponse);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON response from Mailjet API",
          details: textResponse
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (mailjetResponse.status >= 200 && mailjetResponse.status < 300) {
      console.log("Email sent successfully to:", email);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
          data: mailjetResult,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.error("Mailjet API error:", mailjetResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send email",
          details: mailjetResult,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    let errorMessage = "Unknown error";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = { stack: error.stack };
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
