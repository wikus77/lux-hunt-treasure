
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Get the API key from environment variables
const apiKey = Deno.env.get("RESEND_API_KEY");
if (!apiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(apiKey);

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
    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      console.error("Failed to parse request JSON:", e);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: { message: "Invalid JSON in request body" } 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { type, email, name = '', subject, data = {} }: EmailRequest = payload;
    
    if (!type || !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: "Missing required fields: type and email" } 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!apiKey) {
      console.error("Cannot send email: RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: "Email service is not properly configured. RESEND_API_KEY is missing." } 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending ${type} email to ${email}`);
    
    let emailData;
    
    // Configure email based on type
    switch (type) {
      case 'welcome':
        emailData = getWelcomeEmail(email, name);
        break;
      case 'verification':
        if (!data.verificationLink) {
          throw new Error("Missing verificationLink in data for verification email");
        }
        emailData = getVerificationEmail(email, name, data.verificationLink);
        break;
      case 'password_reset':
        if (!data.resetLink) {
          throw new Error("Missing resetLink in data for password reset email");
        }
        emailData = getPasswordResetEmail(email, data.resetLink);
        break;
      case 'notification':
        if (!subject || !data.message) {
          throw new Error("Missing subject or message for notification email");
        }
        emailData = getNotificationEmail(email, name, subject, data.message);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send the email
    try {
      const emailResponse = await resend.emails.send(emailData);
      
      console.log("Email API response:", JSON.stringify(emailResponse));

      if (emailResponse.error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: emailResponse.error 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: emailResponse }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (sendError: any) {
      console.error("Failed to send email:", sendError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            message: sendError.message || "Failed to send email", 
            details: sendError
          } 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: error.message || "Errore nell'invio dell'email" }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Email templates
function getWelcomeEmail(email: string, name: string) {
  return {
    from: "M1SSION <noreply@m1ssion.app>",
    to: email,
    subject: "Benvenuto in M1SSION!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(90deg, #00e5ff, #0066ff); padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Benvenuto in M1SSION!</h1>
        </div>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #eaeaea;">
          <p>Ciao ${name || 'Agente'},</p>
          <p>Benvenuto nel mondo di M1SSION! Siamo entusiasti di averti con noi come agente investigativo.</p>
          <p>Inizia subito ad esplorare la tua prima missione e sbloccare indizi esclusivi.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://m1ssion.app/home" style="background: linear-gradient(90deg, #00e5ff, #0066ff); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Inizia la tua prima missione</a>
          </div>
          <p>Se hai domande, non esitare a contattarci.</p>
          <p>Buona fortuna,<br>Il Team di M1SSION</p>
        </div>
      </div>
    `,
  };
}

function getVerificationEmail(email: string, name: string, verificationLink: string) {
  return {
    from: "M1SSION <noreply@m1ssion.app>",
    to: email,
    subject: "Verifica il tuo indirizzo email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(90deg, #00e5ff, #0066ff); padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Verifica la tua email</h1>
        </div>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #eaeaea;">
          <p>Ciao ${name || 'Agente'},</p>
          <p>Grazie per esserti registrato a M1SSION. Per completare la registrazione, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: linear-gradient(90deg, #00e5ff, #0066ff); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifica la tua email</a>
          </div>
          <p>Se non hai richiesto questa email, puoi ignorarla.</p>
          <p>A presto,<br>Il Team di M1SSION</p>
        </div>
      </div>
    `,
  };
}

function getPasswordResetEmail(email: string, resetLink: string) {
  return {
    from: "M1SSION <noreply@m1ssion.app>",
    to: email,
    subject: "Ripristina la tua password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(90deg, #00e5ff, #0066ff); padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Ripristina la tua password</h1>
        </div>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #eaeaea;">
          <p>Abbiamo ricevuto una richiesta di ripristino della password per il tuo account.</p>
          <p>Clicca sul pulsante qui sotto per impostare una nuova password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(90deg, #00e5ff, #0066ff); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Imposta una nuova password</a>
          </div>
          <p>Se non hai richiesto il ripristino della password, puoi ignorare questa email.</p>
          <p>Cordiali saluti,<br>Il Team di M1SSION</p>
        </div>
      </div>
    `,
  };
}

function getNotificationEmail(email: string, name: string, emailSubject: string, message: string) {
  return {
    from: "M1SSION <noreply@m1ssion.app>",
    to: email,
    subject: emailSubject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(90deg, #00e5ff, #0066ff); padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">${emailSubject}</h1>
        </div>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #eaeaea;">
          <p>Ciao ${name || 'Agente'},</p>
          <div style="margin: 20px 0;">
            ${message}
          </div>
          <p>Cordiali saluti,<br>Il Team di M1SSION</p>
        </div>
      </div>
    `,
  };
}

serve(handler);
