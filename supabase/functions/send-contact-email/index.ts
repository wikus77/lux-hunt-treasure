
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
}

// Setup the handler for the edge function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure we're receiving proper JSON data
    let contactData: ContactData;
    try {
      contactData = await req.json();
      console.log("Received contact data:", JSON.stringify(contactData));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Errore nel formato dei dati inviati' 
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
    
    const { name, email, phone, subject, message } = contactData;
    
    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Campi obbligatori mancanti' 
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

    // Get SMTP configuration from environment variables with defaults
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.ionos.it";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER") || "contact@m1ssion.com";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const contactEmail = Deno.env.get("CONTACT_EMAIL") || "contact@m1ssion.com";

    // Log SMTP configuration (for debugging only)
    console.log("SMTP Configuration:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      to: contactEmail,
    });
    
    if (!smtpPassword) {
      console.error("SMTP_PASSWORD environment variable not set");
      throw new Error("Configurazione SMTP incompleta");
    }

    // Configure SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: false, // Important: use false for STARTTLS
        auth: {
          username: smtpUser, 
          password: smtpPassword,
        },
      },
    });
    
    // Format email content
    const emailSubject = subject || "Contatto dal sito M1SSION";
    const phoneInfo = phone ? `Telefono: ${phone}` : "Telefono non fornito";
    const emailText = `
Nome: ${name}
Email: ${email}
${phoneInfo}

Messaggio:
${message}
`;

    const htmlTemplate = `
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

    // Log the email being sent
    console.log(`Sending email to: ${contactEmail}`);

    try {
      // Send the email
      await client.send({
        from: smtpUser,
        to: contactEmail,
        subject: emailSubject,
        content: "Messaggio dal form di contatto",
        html: htmlTemplate,
      });
      
      console.log("Email sent successfully!");
      
      // Close the connection
      await client.close();
      
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
    } catch (emailError) {
      console.error('Errore specifico nell\'invio dell\'email:', emailError);
      throw emailError; // Re-throw to be caught by the outer try/catch
    }
    
  } catch (error) {
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
