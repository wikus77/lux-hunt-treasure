
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { SmtpClient } from "https://deno.land/x/denomailer@0.15.1/mod.ts";

interface AgentData {
  email: string;
  name: string;
  referral_code: string;
}

const mailjetApiKey = Deno.env.get("MJ_APIKEY_PUBLIC");
const mailjetSecretKey = Deno.env.get("MJ_APIKEY_PRIVATE");
const ionosSmtpUser = Deno.env.get("IONOS_SMTP_USER");
const ionosSmtpPass = Deno.env.get("IONOS_SMTP_PASS");

// Function to send email via Mailjet API
async function sendEmailViaMailjet(data: AgentData) {
  console.log("Attempting to send email via Mailjet API");
  
  const mailjetData = {
    Messages: [
      {
        From: {
          Email: "noreply@m1ssion.com",
          Name: "M1SSION",
        },
        To: [
          {
            Email: data.email,
            Name: data.name,
          },
        ],
        TemplateID: 6977931,
        TemplateLanguage: true,
        Subject: "Benvenuto, Agente di M1SSION!",
        Variables: {
          name: data.name,
          referral_code: data.referral_code,
        },
        CustomCampaign: "agent_confirmation",
        TrackOpens: "enabled",
        TrackClicks: "enabled",
      },
    ],
  };

  console.log("Sending Mailjet request with data:", JSON.stringify(mailjetData, null, 2));

  const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${mailjetApiKey}:${mailjetSecretKey}`)}`,
    },
    body: JSON.stringify(mailjetData),
  });

  console.log("Mailjet API response status:", mailjetResponse.status);
  
  const mailjetResult = await mailjetResponse.json();
  console.log("Mailjet API response:", JSON.stringify(mailjetResult, null, 2));
  
  return {
    status: mailjetResponse.status,
    data: mailjetResult
  };
}

// Function to send email via IONOS SMTP (fallback)
async function sendEmailViaIonosSMTP(data: AgentData) {
  console.log("Attempting to send email via IONOS SMTP fallback");
  
  const client = new SmtpClient();
  await client.connectTLS({
    hostname: "smtp.ionos.it",
    port: 587,
    username: ionosSmtpUser,
    password: ionosSmtpPass,
  });

  // Create a basic HTML email that mimics the template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Benvenuto in M1SSION</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0a0a0a; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #333; }
          .logo { font-size: 28px; font-weight: bold; }
          .blue-text { color: #00E5FF; }
          .content { padding: 30px 0; }
          .referral-code { text-align: center; padding: 15px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #00E5FF; }
          .footer { text-align: center; padding-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="blue-text">M1</span>SSION</div>
          </div>
          <div class="content">
            <h1>Benvenuto, ${data.name}!</h1>
            <p>Grazie per esserti pre-iscritto a M1SSION. Sei ufficialmente parte di questa avventura esclusiva.</p>
            
            <p>Ecco il tuo codice di invito personale. Condividilo con i tuoi amici per guadagnare crediti bonus:</p>
            <div class="referral-code">${data.referral_code}</div>
            
            <p>Ricorda: <strong>IT IS POSSIBLE</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>Per annullare l'iscrizione, rispondi a questa email con oggetto "CANCELLA".</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await client.send({
    from: "noreply@m1ssion.com",
    to: data.email,
    subject: "Benvenuto, Agente di M1SSION!",
    html: htmlContent,
    headers: {
      "X-Fallback": "IONOS",
    },
  });

  await client.close();
  console.log("IONOS SMTP email sent successfully", { recipient: data.email });
  
  return result;
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

    // Implement the primary-fallback logic
    try {
      // 1. Primary: Try sending via Mailjet
      const mailjetResponse = await sendEmailViaMailjet({ email, name, referral_code });
      
      if (mailjetResponse.status >= 200 && mailjetResponse.status < 300 && 
          mailjetResponse.data?.Messages?.[0]?.Status === "success") {
        
        console.log("Email sent successfully via Mailjet to:", email);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email sent successfully via Mailjet",
            provider: "mailjet",
            data: mailjetResponse.data,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        throw new Error(`Mailjet failed with status ${mailjetResponse.status}`);
      }
      
    } catch (mailjetError) {
      console.error("Mailjet error:", mailjetError);
      
      // 2. Fallback: Try sending via IONOS SMTP
      try {
        if (!ionosSmtpUser || !ionosSmtpPass) {
          throw new Error("IONOS SMTP credentials not configured");
        }
        
        const ionosResult = await sendEmailViaIonosSMTP({ email, name, referral_code });
        
        console.log("Fallback email sent via IONOS SMTP to:", email);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Fallback email sent via IONOS SMTP",
            provider: "ionos",
            fallback: true,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
        
      } catch (ionosError) {
        console.error("IONOS SMTP fallback also failed:", ionosError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Email failed on both Mailjet and IONOS SMTP",
            details: {
              mailjetError: mailjetError.message,
              ionosError: ionosError.message
            }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
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
