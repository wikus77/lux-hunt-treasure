
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

// Define email request interface
interface AgentEmailRequest {
  name: string;
  email: string;
  referral_code: string;
}

// Main handler
const handler = async (req: Request): Promise<Response> => {
  console.log(`Processing ${req.method} request to send-agent-confirmation`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AgentEmailRequest = await req.json();
    console.log("Received agent confirmation email request:", requestData);
    
    // Validate required fields
    if (!requestData.email || !requestData.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email e nome sono campi obbligatori" 
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

    const { name, email, referral_code } = requestData;

    // Get Mailjet API keys from environment variables
    const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
    const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");
    
    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      console.error("Mailjet API keys not found in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "API keys Mailjet non configurate",
          debug: {
            MJ_APIKEY_PUBLIC_EXISTS: !!MJ_APIKEY_PUBLIC,
            MJ_APIKEY_PRIVATE_EXISTS: !!MJ_APIKEY_PRIVATE,
          }
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

    // Import Mailjet correctly
    const mailjet = await import("npm:node-mailjet@6.0.0").then(mod => mod.default);

    // Initialize Mailjet client with API keys from environment variables
    const mailjetClient = mailjet.apiConnect(
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE
    );

    console.log("Mailjet client initialized successfully");

    // Sender info
    const senderEmail = "noreply@m1ssion.com";
    const senderName = "M1SSION";
    const subject = "Sei ufficialmente un agente M1SSION";

    // Create HTML content using the template and replacing the referral code
    const displayReferralCode = referral_code || "CODICE NON DISPONIBILE";
    const htmlPart = generateAgentEmailHtml(name, displayReferralCode);

    console.log(`Preparing to send email from ${senderEmail} to ${email} with subject "${subject}"`);

    // Prepare email data
    const emailData = {
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: email, Name: name || "Nuovo Agente" }],
          Subject: subject,
          HTMLPart: htmlPart,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    };

    // Send email through Mailjet API
    try {
      console.log("Sending email via Mailjet API...");
      const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
      console.log("Mailjet API response status:", response.status);
      console.log("Mailjet API response body:", JSON.stringify(response.body, null, 2));

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email inviata con successo",
          response: response.body
        }), 
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    } catch (mailjetError: any) {
      console.error("Mailjet API error:", mailjetError);
      
      // Extract detailed error info
      let errorDetails = mailjetError;
      try {
        if (mailjetError.response && mailjetError.response.data) {
          errorDetails = mailjetError.response.data;
        } else if (mailjetError.message) {
          errorDetails = mailjetError.message;
        }
      } catch (e) {
        console.error("Error parsing Mailjet error:", e);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Errore API Mailjet: " + (mailjetError.message || mailjetError.ErrorMessage || JSON.stringify(mailjetError)),
          details: errorDetails
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
  } catch (error: any) {
    console.error("General error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Errore nell'invio email: " + error.message,
        details: error.stack || "No stack trace available"
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

// Function to generate HTML email content
function generateAgentEmailHtml(name: string, referralCode: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sei un Agente M1SSION</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #0a0a0a;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #0a0a0a;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #333;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
    }
    .blue-text {
      color: #00E5FF;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
      color: #000000;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #333;
    }
    .referral-code {
      background-color: #111;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 18px;
      font-weight: bold;
      color: #00E5FF;
      text-align: center;
      margin: 20px 0;
      letter-spacing: 2px;
    }
    .highlight {
      color: #00E5FF;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"><span class="blue-text">M1</span>SSION</div>
    </div>
    
    <div class="content">
      <h1>Congratulazioni, ${name}!</h1>
      
      <p>Sei ufficialmente diventato un <span class="highlight">Agente M1SSION</span>.</p>
      
      <p>Da questo momento fai parte di un network esclusivo di agenti che avranno accesso privilegiato al nostro ecosistema di missioni, enigmi e premi esclusivi.</p>
      
      <h3>Il tuo codice di accesso personale:</h3>
      
      <div class="referral-code">${referralCode}</div>
      
      <p>Questo codice è il tuo identificativo unico nel sistema M1SSION. Usalo per:</p>
      <ul>
        <li>Invitare altri agenti (guadagnando crediti bonus)</li>
        <li>Sbloccare missioni speciali</li>
        <li>Ottenere vantaggi esclusivi riservati agli agenti</li>
      </ul>
      
      <p>Riceverai presto ulteriori istruzioni. Tieniti pronto, la prima missione sta per iniziare.</p>
      
      <div style="text-align: center;">
        <a href="https://m1ssion.com" class="button">ACCEDI AL CENTRO COMANDI</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
      <p>Questo messaggio è confidenziale e destinato esclusivamente agli agenti M1SSION.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Start the server
console.log("Starting send-agent-confirmation edge function");
serve(handler);
