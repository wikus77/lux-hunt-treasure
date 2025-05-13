
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Make sure we're only accepting POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    // Parse the JSON body
    const requestData = await req.json();
    const { email, name, referral_code } = requestData as AgentData;

    console.log("Agent confirmation request received for:", email);
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
          TemplateID: 6974914,
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

    const mailjetResult = await mailjetResponse.json();

    console.log("Mailjet response status:", mailjetResponse.status);
    console.log("Mailjet response:", JSON.stringify(mailjetResult, null, 2));

    if (mailjetResponse.status >= 200 && mailjetResponse.status < 300) {
      console.log("Email sent successfully");
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
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
