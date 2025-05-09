
import { validateContactData } from "./validation.ts";
import { ContactData } from "./types.ts";
import { corsHeaders } from "./cors.ts";
import { 
  createMailjetClient, 
  prepareEmailData, 
  sendMailjetEmail,
  createErrorResponse,
  createSuccessResponse
} from "./mailjet-client.ts";

// Function to handle email requests
export async function handleEmailRequest(req: Request): Promise<Response> {
  try {
    // Initialize Mailjet client
    const mailjet = createMailjetClient();
    if (!mailjet) {
      throw new Error("Mailjet API keys not configured");
    }

    // Parse request data
    const contactData: ContactData = await req.json();
    console.log("Received contact data:", JSON.stringify(contactData));
    
    // Validate contact data
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      return createErrorResponse(validation.errorMessage || 'Validation error', null, 400);
    }
    
    // Prepare email data
    const emailData = prepareEmailData(contactData);
    
    // Log the email being sent (without sensitive content)
    const recipients = emailData.Messages[0].To.map((r: any) => r.Email).join(', ');
    console.log(`Sending email to: ${recipients}`);
    console.log(`From: ${emailData.Messages[0].From.Email} (${emailData.Messages[0].From.Name})`);
    console.log(`Subject: ${emailData.Messages[0].Subject}`);

    try {
      // Send the email using Mailjet
      const result = await sendMailjetEmail(mailjet, emailData);
      
      // Extract response status and data
      const status = result.status;
      const responseData = result.body;
      
      console.log("Mailjet API response:", status, JSON.stringify(responseData));
      
      if (status >= 200 && status < 300) {
        console.log("Email sent successfully!");
        return createSuccessResponse(responseData);
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
    return createErrorResponse(
      error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email',
      error instanceof Error ? error.stack : 'No stack trace available'
    );
  }
}
