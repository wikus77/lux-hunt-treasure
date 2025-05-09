
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "npm:node-mailjet@6.0.0";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email types
type EmailType = 'transactional' | 'marketing' | 'contact' | 'welcome' | 'notification';

// Email request interface
interface EmailRequest {
  type: EmailType;
  to: {
    email: string;
    name?: string;
  }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: {
    email: string;
    name: string;
  };
  templateId?: number; // For template-based emails
  variables?: Record<string, any>; // For template variables
  headers?: Record<string, string>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  eventPayload?: string; // For event tracking
  customId?: string;
  // GDPR consent fields
  consent?: {
    given: boolean;
    date: string;
    ip?: string;
    method?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("MAILJET_API_KEY");
    const secretKey = Deno.env.get("MAILJET_SECRET_KEY");
    
    if (!apiKey || !secretKey) {
      throw new Error("Mailjet API credentials not configured");
    }

    const mailjet = new Client({
      apiKey: apiKey,
      apiSecret: secretKey,
    });

    const requestData: EmailRequest = await req.json();
    console.log("Email request received:", JSON.stringify(requestData));

    // Validate required fields
    if (!requestData.to || requestData.to.length === 0 || !requestData.subject) {
      throw new Error("Missing required fields: recipients and subject are required");
    }

    // Default from address if not provided
    const from = requestData.from || {
      email: "contact@m1ssion.com",
      name: "M1SSION Team",
    };

    // Handle different email types
    let emailData: any;
    
    if (requestData.templateId) {
      // Template-based email
      emailData = {
        Messages: [{
          From: {
            Email: from.email,
            Name: from.name,
          },
          To: requestData.to.map(recipient => ({
            Email: recipient.email,
            Name: recipient.name || recipient.email.split('@')[0],
          })),
          TemplateID: requestData.templateId,
          TemplateLanguage: true,
          Variables: requestData.variables || {},
          Subject: requestData.subject,
          Headers: requestData.headers,
          TrackOpens: requestData.trackOpens !== false,
          TrackClicks: requestData.trackClicks !== false,
          CustomCampaign: requestData.customCampaign,
          EventPayload: requestData.eventPayload,
          CustomID: requestData.customId,
        }],
      };
    } else {
      // Content-based email
      emailData = {
        Messages: [{
          From: {
            Email: from.email,
            Name: from.name,
          },
          To: requestData.to.map(recipient => ({
            Email: recipient.email,
            Name: recipient.name || recipient.email.split('@')[0],
          })),
          Subject: requestData.subject,
          HTMLPart: requestData.htmlContent,
          TextPart: requestData.textContent || stripHtml(requestData.htmlContent),
          Headers: requestData.headers,
          TrackOpens: requestData.trackOpens !== false,
          TrackClicks: requestData.trackClicks !== false,
          CustomCampaign: requestData.customCampaign,
          EventPayload: requestData.eventPayload,
          CustomID: requestData.customId,
        }],
      };
    }

    console.log("Sending email via Mailjet:", JSON.stringify(emailData));

    // If contact form and consent is tracked, log it
    if (requestData.type === 'contact' && requestData.consent) {
      console.log("Contact form submission with consent:", JSON.stringify(requestData.consent));
      // In a production environment, you might want to store this consent in your database
    }

    // Send the email
    const response = await mailjet.post("send", { version: "v3.1" }).request(emailData);
    
    console.log("Mailjet response:", JSON.stringify(response.body));

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      data: response.body
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.stack : String(error)
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
};

// Helper function to strip HTML tags for text version
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Start the server
serve(handler);
