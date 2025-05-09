
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
    from,
    referral_code
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
  
  // Set variables for template
  const variables = {};
  if (referral_code) {
    variables["referral_code"] = referral_code;
  }

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
        TrackClicks: trackClicks ? "enabled" : "disabled",
        Variables: variables
      }
    ]
  };
}

// Function to send email using Mailjet client - improved error handling
export async function sendMailjetEmail(mailjetClient: any, emailData: any): Promise<{status: number, body: any}> {
  try {
    console.log("Sending request to Mailjet API with data:", JSON.stringify(emailData, null, 2));
    
    const result = await mailjetClient
      .post("send", { version: "v3.1" })
      .request(emailData);
    
    return {
      status: result.status,
      body: result.body
    };
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    
    // Try to extract more detailed error information
    let errorInfo = error;
    let statusCode = 500;
    
    if (error.statusCode) {
      statusCode = error.statusCode;
    }
    
    if (error.response) {
      try {
        // Try to parse the response body if it exists
        errorInfo = typeof error.response.body === 'string' 
          ? JSON.parse(error.response.body) 
          : error.response.body;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
    }
    
    return {
      status: statusCode,
      body: { 
        error: error.message, 
        errorInfo, 
        errorCode: error.code || error.statusCode
      }
    };
  }
}

// Create and configure Mailjet client - improved to better handle API key issues
export function createMailjetClient(): any {
  // Get Mailjet API keys from environment variables
  const mailjetApiKey = Deno.env.get("MAILJET_API_KEY");
  const mailjetSecretKey = Deno.env.get("MAILJET_SECRET_KEY");
  
  if (!mailjetApiKey || !mailjetSecretKey) {
    console.error("Mailjet API keys not configured:");
    console.error("MAILJET_API_KEY present:", !!mailjetApiKey);
    console.error("MAILJET_SECRET_KEY present:", !!mailjetSecretKey);
    return null;
  }
  
  // Log API key info for debugging (don't log actual keys)
  console.log("Initializing Mailjet client with API key starting with:", 
    mailjetApiKey.substring(0, 4) + "..." + mailjetApiKey.substring(mailjetApiKey.length - 4));
  
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
  console.error(`Returning error response (${status}):`, message);
  if (details) {
    console.error("Error details:", JSON.stringify(details, null, 2));
  }
  
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
  console.log("Returning success response");
  
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
