
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "npm:node-mailjet@6.0.0";
import { corsHeaders } from "./cors.ts";

/**
 * Main handler for the edge function
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get Mailjet API keys from environment variables
    const mailjetApiKey = Deno.env.get("MAILJET_API_KEY");
    const mailjetSecretKey = Deno.env.get("MAILJET_SECRET_KEY");
    
    if (!mailjetApiKey || !mailjetSecretKey) {
      console.error("Mailjet API keys not configured");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Configurazione email non valida"
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
    
    // Initialize Mailjet client
    const mailjet = Client.apiConnect(
      mailjetApiKey,
      mailjetSecretKey
    );

    // Parse request data
    const data = await req.json();
    const { type, name, email, phone, subject, message, to, htmlContent } = data;
    
    console.log("Received contact data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email obbligatoria mancante" 
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
    
    // Default subject if not provided
    const emailSubject = subject || `Nuovo messaggio da ${name || 'un visitatore'}`;
    
    // Default recipients if not provided
    const recipients = to || [{ 
      Email: "contact@m1ssion.com",
      Name: "M1SSION Team"
    }];
    
    // Default sender
    const sender = data.from || {
      Email: "contact@m1ssion.com",
      Name: "M1SSION Contact Form"
    };

    // Generate HTML content for contacts if not provided
    const emailHtml = htmlContent || generateContactEmailHtml(data);
    
    // Configure the email data for Mailjet v3.1 API
    const emailData = {
      Messages: [
        {
          From: {
            Email: sender.Email,
            Name: sender.Name
          },
          To: recipients.map(recipient => ({
            Email: recipient.Email || recipient.email,
            Name: recipient.Name || recipient.name || ''
          })),
          Subject: emailSubject,
          TextPart: message || "",
          HTMLPart: emailHtml,
          CustomCampaign: data.customCampaign || "contact_form",
          CustomID: data.customId || `contact_${Date.now()}`,
          TrackOpens: data.trackOpens ? "enabled" : "disabled",
          TrackClicks: data.trackClicks ? "enabled" : "disabled"
        }
      ]
    };
    
    // Log the email being sent (without sensitive content)
    console.log(`Sending email to: ${recipients[0].Email}`);
    console.log(`Subject: ${emailSubject}`);

    try {
      // Send the email using Mailjet
      const result = await mailjet
        .post("send", { version: "v3.1" })
        .request(emailData);
      
      // Extract response status and data
      const status = result.status;
      const responseData = result.body;
      
      console.log("Mailjet API response:", status, JSON.stringify(responseData));
      
      if (status >= 200 && status < 300) {
        console.log("Email sent successfully!");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email inviata con successo!",
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
        console.error("Unexpected status code:", status);
        throw new Error(`Unexpected response status: ${status}`);
      }
    } catch (emailError: any) {
      console.error('Errore specifico nell\'invio dell\'email:', emailError);
      throw emailError; // Re-throw to be caught by the outer try/catch
    }
    
  } catch (error: any) {
    console.error('Errore nell\'invio dell\'email:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email',
        errorDetails: error instanceof Error ? error.stack : undefined
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

/**
 * Generate HTML content for contact emails
 */
function generateContactEmailHtml(data: any): string {
  const { name, email, phone, subject, message } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #00e5ff; color: #000; padding: 10px 20px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nuovo messaggio da M1SSION</h2>
        </div>
        <div class="content">
          <p><strong>Nome:</strong> ${name || 'Non fornito'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefono:</strong> ${phone || 'Non fornito'}</p>
          <p><strong>Oggetto:</strong> ${subject || 'Contatto dal sito M1SSION'}</p>
          <p><strong>Messaggio:</strong></p>
          <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message || 'Nessun messaggio fornito'}</p>
        </div>
        <div class="footer">
          <p>Questo messaggio è stato inviato automaticamente dal form di contatto di M1SSION.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Start the server
serve(handler);
