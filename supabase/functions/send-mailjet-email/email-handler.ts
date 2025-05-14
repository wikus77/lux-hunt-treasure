
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
      console.error("Failed to create Mailjet client - API keys may be missing");
      return createErrorResponse("Configurazione Mailjet non valida. API keys mancanti.", null, 500);
    }

    // Parse request data
    let contactData: ContactData;
    try {
      contactData = await req.json();
      console.log("Received email request data:", JSON.stringify(contactData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createErrorResponse("Formato della richiesta non valido", null, 400);
    }
    
    // Validate contact data
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      return createErrorResponse(validation.errorMessage || 'Errore di validazione', null, 400);
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
      console.log("Sending email via Mailjet API...");
      const result = await sendMailjetEmail(mailjet, emailData);
      
      // Extract response status and data
      const status = result.status;
      const responseData = result.body;
      
      console.log("Mailjet API response status:", status);
      console.log("Mailjet API response body:", JSON.stringify(responseData, null, 2));
      
      // Check if the response contains a success message from Mailjet
      if (responseData?.Messages && 
          responseData.Messages[0]?.Status === "success") {
        console.log("Email sent successfully!");
        return createSuccessResponse(responseData);
      } else if (status >= 200 && status < 300) {
        // Fallback for other successful status codes
        console.log("Email sent successfully with status code:", status);
        return createSuccessResponse(responseData);
      } else {
        console.error(`Error response from Mailjet API: Status ${status}`, responseData);
        return createErrorResponse(
          `Errore nell'invio dell'email: ${responseData?.ErrorMessage || responseData?.error || 'Risposta non valida dall\'API'}`, 
          responseData, 
          status >= 400 && status < 600 ? status : 500
        );
      }
    } catch (emailError: any) {
      console.error('Specific error when sending email:', emailError);
      return createErrorResponse(
        `Errore durante l'invio dell'email: ${emailError.message || 'Errore sconosciuto'}`,
        emailError.stack || null,
        500
      );
    }
    
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Return error response with detailed information
    return createErrorResponse(
      error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email',
      error instanceof Error ? error.stack : 'No stack trace available',
      500
    );
  }
}
