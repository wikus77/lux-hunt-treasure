
import { Client } from "npm:node-mailjet@6.0.0";
import { ContactData } from "./types.ts";
import { generateContactEmailHtml } from "./templates.ts";
import { corsHeaders } from "./cors.ts";

// Function to prepare email data for Mailjet
export function prepareEmailData(data: ContactData): any {
  const { 
    name, 
    email, 
    subject, 
    message, 
    to, 
    htmlContent, 
    trackOpens = true, 
    trackClicks = false,
    customCampaign, 
    customId, 
    from 
  } = data;
  
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

  // Determine HTML content to use
  const emailHtmlContent = htmlContent || 
    (data.type === 'contact' ? generateContactEmailHtml(data) : '');
  
  // Configure the email data for Mailjet v3.1 API
  return {
    Messages: [
      {
        From: {
          Email: sender.Email,
          Name: sender.Name
        },
        To: recipients.map(recipient => ({
          Email: recipient.email || recipient.Email,
          Name: recipient.name || recipient.Name || ''
        })),
        Subject: subject || `Nuovo messaggio da ${name || 'un visitatore'}`,
        TextPart: message || "",
        HTMLPart: emailHtmlContent,
        CustomCampaign: customCampaign || "contact_form",
        CustomID: customId || `contact_${Date.now()}`,
        TrackOpens: trackOpens ? "enabled" : "disabled",
        TrackClicks: trackClicks ? "enabled" : "disabled"
      }
    ]
  };
}

// Function to send email using Mailjet client
export async function sendMailjetEmail(mailjetClient: any, emailData: any): Promise<{status: number, body: any}> {
  const result = await mailjetClient
    .post("send", { version: "v3.1" })
    .request(emailData);
  
  return {
    status: result.status,
    body: result.body
  };
}

// Create and configure Mailjet client
export function createMailjetClient(): Client | null {
  // Get Mailjet API keys from environment variables
  const mailjetApiKey = Deno.env.get("MAILJET_API_KEY");
  const mailjetSecretKey = Deno.env.get("MAILJET_SECRET_KEY");
  
  if (!mailjetApiKey || !mailjetSecretKey) {
    console.error("Mailjet API keys not configured");
    return null;
  }
  
  // Initialize Mailjet client
  return Client.apiConnect(
    mailjetApiKey,
    mailjetSecretKey
  );
}

// Function to create error response
export function createErrorResponse(message: string, details?: any, status = 500): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      errorDetails: details
    }),
    { 
      status,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

// Function to create success response
export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Email inviata con successo',
      data
    }),
    { 
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}
