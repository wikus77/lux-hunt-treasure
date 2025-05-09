
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "npm:node-mailjet@6.0.0";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type?: string;
  to?: Array<{email: string, name?: string}>;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  variables?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  customId?: string;
  consent?: {
    given: boolean;
    date: string;
    method: string;
  };
  from?: {
    email: string;
    name: string;
  };
}

// Setup the handler for the edge function
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
      throw new Error("Mailjet API keys not configured");
    }
    
    // Initialize Mailjet client
    const mailjet = Client.apiConnect(
      mailjetApiKey,
      mailjetSecretKey
    );

    // Parse request data
    const contactData: ContactData = await req.json();
    console.log("Received contact data:", JSON.stringify(contactData));
    
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message,
      type = 'contact',
      to,
      htmlContent,
      trackOpens = true,
      trackClicks = false,
      customCampaign,
      customId,
      from
    } = contactData;
    
    // Validate required fields based on message type
    if (type === 'contact' && (!name || !email || !message)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Campi obbligatori mancanti per email di contatto' 
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
    
    // Build email content
    let emailHtmlContent = htmlContent;
    
    // If no HTML content is provided and it's a contact form email, generate HTML
    if (!emailHtmlContent && type === 'contact') {
      emailHtmlContent = `
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
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Telefono:</strong> ${phone || 'Non fornito'}</p>
              <p><strong>Oggetto:</strong> ${subject || 'Contatto dal sito M1SSION'}</p>
              <p><strong>Messaggio:</strong></p>
              <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
            <div class="footer">
              <p>Questo messaggio è stato inviato automaticamente dal form di contatto di M1SSION.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    // Default recipients if not specified
    const recipients = to || [{ 
      Email: "contact@m1ssion.com",
      Name: "M1SSION Team"
    }];
    
    // Set sender
    const sender = from || {
      Email: "contact@m1ssion.com",
      Name: "M1SSION Contact Form"
    };
    
    // Configure the email data for Mailjet
    const emailData = {
      Messages: [
        {
          From: {
            Email: sender.Email,
            Name: sender.Name
          },
          To: recipients.map(recipient => ({
            Email: recipient.email,
            Name: recipient.name || recipient.email.split('@')[0]
          })),
          Subject: subject || `Nuovo messaggio da ${name}`,
          TextPart: message,
          HTMLPart: emailHtmlContent,
          CustomCampaign: customCampaign || "contact_form",
          CustomID: customId || `contact_${Date.now()}`,
          TrackOpens: trackOpens ? "enabled" : "disabled",
          TrackClicks: trackClicks ? "enabled" : "disabled"
        }
      ]
    };
    
    // Log the email being sent (without sensitive content)
    console.log(`Sending email to: ${recipients.map(r => r.email).join(', ')}`);
    console.log(`From: ${sender.Email} (${sender.Name})`);
    console.log(`Subject: ${emailData.Messages[0].Subject}`);

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
        
        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email inviata con successo',
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
        errorDetails: error instanceof Error ? error.stack : 'No stack trace available'
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

// Start the server
serve(handler);
