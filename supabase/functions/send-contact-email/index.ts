
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the expected request body structure
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Setup the API handler
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const formData: ContactFormData = await req.json();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      throw new Error('Missing required fields');
    }
    
    // Validate email format using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Invalid email format');
    }

    // Sanitize inputs (basic HTML escape)
    const sanitize = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const sanitizedData = {
      name: sanitize(formData.name),
      email: sanitize(formData.email),
      subject: sanitize(formData.subject || 'Contatto dal sito M1SSION'),
      message: sanitize(formData.message),
    };

    // Format email content (plain text version)
    const emailPlainText = `
Nuovo messaggio da: ${sanitizedData.name}
Email: ${sanitizedData.email}
Oggetto: ${sanitizedData.subject}

Messaggio:
${sanitizedData.message}
    `;

    // Format email content (HTML version)
    const emailHtml = `
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
      <p><strong>Nome:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Oggetto:</strong> ${sanitizedData.subject}</p>
      <p><strong>Messaggio:</strong></p>
      <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 5px;">${sanitizedData.message}</p>
    </div>
    <div class="footer">
      <p>Questo messaggio è stato inviato automaticamente dal form di contatto di M1SSION.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Log the attempt for debugging purposes
    console.log("Tentativo di invio email da:", sanitizedData.name, sanitizedData.email);
    
    // Here we would normally implement sending via a service like Resend.com
    // For demonstration, we'll simulate success after basic validation
    
    // TODO: Implement actual email sending using a service like Resend.com
    // Example with Resend would be:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'noreply@m1ssion.com',
    //   to: 'contact@m1ssion.com',
    //   subject: sanitizedData.subject,
    //   html: emailHtml,
    //   text: emailPlainText,
    // });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email inviata con successo'
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Errore nell'invio dell'email:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Errore sconosciuto'
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
};

serve(handler);
