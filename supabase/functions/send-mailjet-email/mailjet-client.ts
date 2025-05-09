
// Import the Mailjet package correctly
import mailjet from "npm:node-mailjet@6.0.0";
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

// Function to send email using Mailjet client - fixed to properly handle the API response
export async function sendMailjetEmail(mailjetClient: any, emailData: any): Promise<{status: number, body: any}> {
  try {
    const result = await mailjetClient
      .post("send", { version: "v3.1" })
      .request(emailData);
    
    return {
      status: result.status,
      body: result.body
    };
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    if (error.statusCode) {
      return {
        status: error.statusCode,
        body: { error: error.message, errorInfo: error.ErrorInfo || null }
      };
    }
    throw error; // Re-throw if it's not a standard Mailjet API error
  }
}

// Create and configure Mailjet client - completely rewritten to ensure proper auth
export function createMailjetClient(): any {
  // Get Mailjet API keys from environment variables
  const mailjetApiKey = Deno.env.get("MAILJET_API_KEY");
  const mailjetSecretKey = Deno.env.get("MAILJET_SECRET_KEY");
  
  if (!mailjetApiKey || !mailjetSecretKey) {
    console.error("Mailjet API keys not configured");
    return null;
  }
  
  // Initialize Mailjet client with the correct approach for node-mailjet 6.0
  try {
    const client = mailjet.apiConnect(
      mailjetApiKey,
      mailjetSecretKey
    );
    console.log("Mailjet client created successfully");
    return client;
  } catch (error) {
    console.error("Failed to create Mailjet client:", error);
    return null;
  }
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
