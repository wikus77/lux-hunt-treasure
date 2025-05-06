
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'verification' | 'password_reset' | 'notification';
  email: string;
  name?: string;
  subject?: string;
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    
    // Validate required fields
    if (!requestData.email || !requestData.type) {
      throw new Error("Missing required fields: email and type are required");
    }
    
    // Email content based on type
    let subject = "";
    let htmlContent = "";
    
    switch (requestData.type) {
      case 'welcome':
        subject = requestData.subject || "Benvenuto in M1SSION - La sfida inizia presto!";
        htmlContent = generateWelcomeEmail(requestData.name || "", requestData.data?.launchDate || "19 Giugno 2025");
        break;
        
      case 'notification':
        subject = requestData.subject || "M1SSION - Aggiornamento importante";
        htmlContent = generateNotificationEmail(requestData.name || "", requestData.data?.message || "");
        break;
        
      default:
        throw new Error(`Unsupported email type: ${requestData.type}`);
    }
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "M1SSION <onboarding@resend.dev>", // Update with your verified domain
      to: [requestData.email],
      subject: subject,
      html: htmlContent,
    });
    
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateWelcomeEmail(name: string, launchDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Benvenuto in M1SSION</title>
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
          .countdown {
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #333;
            border-radius: 8px;
            background-color: rgba(0, 229, 255, 0.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="blue-text">M1</span>SSION</div>
          </div>
          <div class="content">
            <h1>Benvenuto, ${name}!</h1>
            <p>Grazie per esserti iscritto alla newsletter di M1SSION. Sei ufficialmente parte di questa avventura esclusiva.</p>
            
            <div class="countdown">
              <h3>La sfida inizia il ${launchDate}</h3>
              <p>Riceverai aggiornamenti esclusivi 15 giorni, 7 giorni, 3 giorni e 24 ore prima del lancio.</p>
            </div>
            
            <p>Preparati per:</p>
            <ul>
              <li>Enigmi da risolvere in tempo reale</li>
              <li>Indizi esclusivi riservati agli iscritti alla newsletter</li>
              <li>La possibilità di vincere premi straordinari</li>
            </ul>
            
            <p>Ricorda: <strong>IT IS POSSIBLE</strong></p>
            
            <div style="text-align: center;">
              <a href="https://m1ssion.com" class="button">VISITA IL SITO</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>Per annullare l'iscrizione, rispondi a questa email con oggetto "CANCELLA".</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateNotificationEmail(name: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Aggiornamento M1SSION</title>
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
          .message {
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #00E5FF;
            background-color: rgba(0, 229, 255, 0.05);
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="blue-text">M1</span>SSION</div>
          </div>
          <div class="content">
            <h1>Ciao ${name},</h1>
            <p>Abbiamo un importante aggiornamento per te riguardo M1SSION.</p>
            
            <div class="message">
              ${message}
            </div>
            
            <div style="text-align: center;">
              <a href="https://m1ssion.com" class="button">VISITA IL SITO</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>Per annullare l'iscrizione, rispondi a questa email con oggetto "CANCELLA".</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
