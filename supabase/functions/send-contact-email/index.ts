
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

/**
 * Generate Auto-Reply HTML Email
 */
function generateAutoReplyHtml(senderName: string, originalSubject?: string): string {
  const currentYear = new Date().getFullYear();
  const name = senderName || 'Agente';
  const subject = originalSubject || 'il tuo messaggio';
  
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>M1SSION - Messaggio Ricevuto</title><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:linear-gradient(180deg,#0a0a0f 0%,#0d0d14 50%,#0a0a0f 100%);border:1px solid rgba(0,229,255,0.15);border-radius:16px;"><tr><td style="height:3px;background:linear-gradient(90deg,transparent 0%,#00E5FF 50%,transparent 100%);border-radius:16px 16px 0 0;"></td></tr><tr><td align="center" style="padding:25px 30px 10px 30px;"><img src="https://m1ssion.eu/icons/icon-m1-192x192.png" alt="M1SSION" width="80" height="80" style="display:block;width:80px;height:80px;border:0;border-radius:12px;box-shadow:0 0 20px rgba(0,229,255,0.3);"></td></tr><tr><td align="center" style="padding:10px 30px 20px 30px;"><span style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;letter-spacing:2px;"><span style="color:#00E5FF;text-shadow:0 0 15px rgba(0,229,255,0.5);">M1</span><span style="color:#ffffff;">SSION</span><span style="font-size:10px;vertical-align:super;color:#888;">™</span></span></td></tr><tr><td style="padding:0 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(0,229,255,0.2) 50%,transparent 100%);"></td></tr></table></td></tr><tr><td style="padding:30px 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:20px;"><span style="display:inline-block;background:linear-gradient(135deg,rgba(0,229,255,0.1) 0%,rgba(138,43,226,0.1) 100%);border:1px solid rgba(0,229,255,0.2);border-radius:6px;padding:10px 20px;font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:2px;color:#00E5FF;font-weight:600;text-transform:uppercase;">✅ MESSAGGIO RICEVUTO</span></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:16px;color:#ffffff;padding-bottom:15px;line-height:1.6;">Ciao <span style="color:#00E5FF;font-weight:600;">${name}</span>,</td></tr><tr><td style="font-size:14px;color:#cccccc;padding-bottom:20px;line-height:1.7;">Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio riguardo a "<span style="color:#ffffff;font-style:italic;">${subject}</span>".</td></tr><tr><td style="font-size:14px;color:#cccccc;padding-bottom:20px;line-height:1.7;">Il nostro team esaminerà la tua richiesta e ti risponderà il prima possibile, generalmente entro <span style="color:#00E5FF;font-weight:600;">24-48 ore lavorative</span>.</td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;"><tr><td style="background:rgba(138,43,226,0.1);border-left:3px solid #8a2be2;border-radius:0 6px 6px 0;padding:15px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#aaa;line-height:1.6;">💡 <strong style="color:#ffffff;">Nel frattempo:</strong><br>Visita <a href="https://m1ssion.eu" style="color:#00E5FF;text-decoration:none;font-weight:600;">m1ssion.eu</a> per scoprire tutte le novità!</td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#888;padding-top:20px;line-height:1.6;font-style:italic;">A presto,</td></tr><tr><td style="font-size:13px;color:#666;padding-top:5px;">— Il Team M1SSION™</td></tr></table></td></tr><tr><td style="background:rgba(0,0,0,0.3);padding:20px 30px;border-radius:0 0 16px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="font-size:10px;color:#555;line-height:1.8;">© ${currentYear} <span style="color:#00E5FF;">M1</span>SSION™ — All Rights Reserved<br><span style="color:#444;">NIYVORA KFT™</span></td></tr></table></td></tr><tr><td style="height:2px;background:linear-gradient(90deg,transparent 0%,rgba(138,43,226,0.4) 50%,transparent 100%);border-radius:0 0 16px 16px;"></td></tr></table></td></tr></table></body></html>`;
}

/**
 * Generate Auto-Reply Plain Text
 */
function generateAutoReplyText(senderName: string, originalSubject?: string): string {
  const name = senderName || 'Agente';
  const subject = originalSubject || 'il tuo messaggio';
  
  return `M1SSION™ — MESSAGGIO RICEVUTO

Ciao ${name},

Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio riguardo a "${subject}".

Il nostro team esaminerà la tua richiesta e ti risponderà il prima possibile, generalmente entro 24-48 ore lavorative.

Nel frattempo, visita https://m1ssion.eu per scoprire tutte le novità!

A presto,
— Il Team M1SSION™

© ${new Date().getFullYear()} M1SSION™ — NIYVORA KFT™`;
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
    const smtpPortEnv = Deno.env.get("SMTP_PORT") || "465";
    const smtpPort = parseInt(smtpPortEnv);
    const smtpUser = Deno.env.get("SMTP_USER") || "contact@m1ssion.com";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const contactEmail = Deno.env.get("CONTACT_EMAIL") || "contact@m1ssion.com";
    // Noreply email for auto-replies
    const noreplyEmail = Deno.env.get("NOREPLY_EMAIL") || "noreply@m1ssion.com";
    const noreplyPassword = Deno.env.get("NOREPLY_PASSWORD") || smtpPassword; // Use same password if not set
    // Use TLS for port 465, STARTTLS for port 587
    const useTls = smtpPort === 465;

    // Log SMTP configuration (for debugging only)
    console.log("SMTP Configuration:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      to: contactEmail,
      tls: useTls,
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
        tls: useTls, // true for SSL (465), false for STARTTLS (587)
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
      // Send the email to M1SSION team
      await client.send({
        from: smtpUser,
        to: contactEmail,
        subject: emailSubject,
        content: "Messaggio dal form di contatto",
        html: htmlTemplate,
      });
      
      console.log("Email sent successfully to team!");
      
      // Send auto-reply to the sender using noreply@m1ssion.com
      console.log(`Sending auto-reply from ${noreplyEmail} to: ${email}`);
      try {
        // Create separate client for noreply if different credentials
        const noreplyClient = new SMTPClient({
          connection: {
            hostname: smtpHost,
            port: smtpPort,
            tls: useTls,
            auth: {
              username: noreplyEmail,
              password: noreplyPassword,
            },
          },
        });
        
        await noreplyClient.send({
          from: `"M1SSION™" <${noreplyEmail}>`,
          to: email,
          replyTo: contactEmail, // Reply-To goes to contact@
          subject: "✅ M1SSION™ — Abbiamo ricevuto il tuo messaggio",
          content: generateAutoReplyText(name, subject),
          html: generateAutoReplyHtml(name, subject),
        });
        
        await noreplyClient.close();
        console.log("Auto-reply sent successfully from noreply@m1ssion.com!");
      } catch (autoReplyError) {
        console.warn("Auto-reply failed (non-blocking):", autoReplyError);
        // Don't fail the whole request if auto-reply fails
      }
      
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
