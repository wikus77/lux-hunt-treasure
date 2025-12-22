// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailData {
  to: string;
  fullName: string;
  agentCode: string;
}

/**
 * Generate Premium HTML Welcome Email - M1SSION™ Agent Activation
 * Style: Cinematic / Investigative / Premium with Official Orbitron Font
 * Compatible: Gmail, iOS Mail, Outlook, Yahoo
 * NOTE: HTML is minified to prevent =20 encoding issues
 */
function generatePremiumWelcomeEmail(fullName: string, agentCode: string): string {
  const currentYear = new Date().getFullYear();
  const name = fullName || 'Operativo';
  
  // IMPORTANT: Keep HTML minified (no newlines) to prevent quoted-printable =20 encoding
  return `<!DOCTYPE html><html lang="it" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"><title>M1SSION Agent Activation</title><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');.orbitron{font-family:'Orbitron',sans-serif!important;}</style></head><body style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:linear-gradient(180deg,#0a0a0f 0%,#0d0d14 50%,#0a0a0f 100%);border:1px solid rgba(0,229,255,0.15);border-radius:16px;"><tr><td style="height:3px;background:linear-gradient(90deg,transparent 0%,#00E5FF 50%,transparent 100%);border-radius:16px 16px 0 0;"></td></tr><tr><td align="center" style="padding:25px 30px 15px 30px;"><span style="display:inline-block;background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);border-radius:4px;padding:6px 16px;font-size:10px;letter-spacing:3px;color:#ff4444;font-weight:700;text-transform:uppercase;">⚠️ DOCUMENTO RISERVATO — CLASSIFICATO</span></td></tr><tr><td align="center" style="padding:10px 30px 10px 30px;"><img src="https://m1ssion.eu/icons/icon-m1-192x192.png" alt="M1SSION" width="100" height="100" style="display:block;width:100px;height:100px;border:0;border-radius:16px;box-shadow:0 0 30px rgba(0,229,255,0.4);"></td></tr><tr><td align="center" style="padding:10px 30px 20px 30px;"><span style="font-family:'Orbitron',sans-serif;font-size:28px;font-weight:800;letter-spacing:2px;"><span style="color:#00E5FF;text-shadow:0 0 20px rgba(0,229,255,0.6);">M1</span><span style="color:#ffffff;">SSION</span><span style="font-size:12px;vertical-align:super;color:#888;">™</span></span></td></tr><tr><td style="padding:0 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(0,229,255,0.3) 50%,transparent 100%);"></td></tr></table></td></tr><tr><td style="padding:35px 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:25px;"><span style="display:inline-block;background:linear-gradient(135deg,rgba(0,229,255,0.15) 0%,rgba(138,43,226,0.15) 100%);border:1px solid rgba(0,229,255,0.3);border-radius:8px;padding:12px 24px;font-family:'Orbitron',sans-serif;font-size:14px;letter-spacing:2px;color:#00E5FF;font-weight:700;text-transform:uppercase;">🔓 ATTIVAZIONE AGENTE CONFERMATA</span></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:18px;color:#ffffff;padding-bottom:20px;line-height:1.6;">Agente <span style="color:#00E5FF;font-weight:700;">${name}</span>,</td></tr><tr><td style="font-size:15px;color:#cccccc;padding-bottom:25px;line-height:1.7;">La tua richiesta di arruolamento è stata <span style="color:#00ff88;font-weight:600;">APPROVATA</span>. Sei stato assegnato al programma <span style="color:#00E5FF;font-weight:600;">M1SSION™</span> — la prima caccia al tesoro globale con premi reali.</td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:30px;"><tr><td style="background:linear-gradient(135deg,#0f1922 0%,#0a1015 100%);border:2px solid rgba(0,229,255,0.4);border-radius:12px;padding:25px;text-align:center;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:10px;"><span style="font-size:11px;letter-spacing:3px;color:#888;text-transform:uppercase;">Il Tuo Codice Agente Univoco</span></td></tr><tr><td align="center" style="padding:15px 0;"><span style="display:inline-block;font-family:'Orbitron',monospace;font-size:28px;font-weight:900;letter-spacing:4px;color:#00E5FF;background:rgba(0,229,255,0.1);border:2px dashed rgba(0,229,255,0.4);border-radius:8px;padding:15px 30px;text-shadow:0 0 15px rgba(0,229,255,0.5);">${agentCode}</span></td></tr><tr><td align="center" style="padding-top:12px;"><span style="font-size:12px;color:#ff9900;font-style:italic;">⚠️ Conserva questo codice. È la tua identità nella missione.</span></td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:30px;"><tr><td style="background:linear-gradient(135deg,rgba(138,43,226,0.15) 0%,rgba(0,229,255,0.1) 100%);border-left:4px solid #8a2be2;border-radius:0 8px 8px 0;padding:20px 25px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#ffffff;font-weight:700;padding-bottom:8px;">🚀 LANCIO GLOBALE</td></tr><tr><td style="font-family:'Orbitron',sans-serif;font-size:22px;color:#00E5FF;font-weight:900;letter-spacing:1px;">19 DICEMBRE 2025</td></tr><tr><td style="font-size:13px;color:#aaa;padding-top:10px;line-height:1.5;">La caccia ha inizio. Preparati a decifrare indizi, risolvere enigmi e competere per premi straordinari.</td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:30px;"><tr><td style="font-size:14px;color:#ffffff;font-weight:700;padding-bottom:15px;text-transform:uppercase;letter-spacing:1px;">📋 PROSSIMI PASSI</td></tr><tr><td><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:8px 0;font-size:14px;color:#ccc;line-height:1.6;"><span style="color:#00E5FF;font-weight:700;">1.</span> Scegli un piano di abbonamento per attivare l'accesso completo</td></tr><tr><td style="padding:8px 0;font-size:14px;color:#ccc;line-height:1.6;"><span style="color:#00E5FF;font-weight:700;">2.</span> Familiarizza con l'interfaccia e le meccaniche di gioco</td></tr><tr><td style="padding:8px 0;font-size:14px;color:#ccc;line-height:1.6;"><span style="color:#00E5FF;font-weight:700;">3.</span> Attendi il briefing iniziale il 19 dicembre</td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:10px 0 20px 0;"><a href="https://m1ssion.eu/choose-plan" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#00E5FF 0%,#0099cc 100%);color:#000000;text-decoration:none;padding:16px 40px;border-radius:50px;font-family:'Orbitron',sans-serif;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 20px rgba(0,229,255,0.4);">🎯 SCEGLI IL TUO PIANO</a></td></tr></table></td></tr><tr><td style="padding:0 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%);"></td></tr></table></td></tr><tr><td style="padding:25px 40px 20px 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#888;line-height:1.6;font-style:italic;">IT IS POSSIBLE.</td></tr><tr><td style="font-size:12px;color:#666;padding-top:10px;">— Comando Centrale M1SSION™</td></tr></table></td></tr><tr><td style="background:rgba(0,0,0,0.3);padding:25px 30px;border-radius:0 0 16px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="font-size:11px;color:#555;line-height:1.8;">© ${currentYear} <span style="color:#00E5FF;">M1</span>SSION™ — All Rights Reserved<br><span style="color:#444;">NIYVORA KFT™ — Budapest, Hungary</span></td></tr><tr><td align="center" style="padding-top:15px;"><span style="font-size:10px;color:#444;">Hai ricevuto questa email perché ti sei registrato su <a href="https://m1ssion.eu" style="color:#00E5FF;text-decoration:none;">m1ssion.eu</a>.<br>Per supporto: <a href="mailto:contact@m1ssion.com" style="color:#00E5FF;text-decoration:none;">contact@m1ssion.com</a></span></td></tr></table></td></tr><tr><td style="height:3px;background:linear-gradient(90deg,transparent 0%,rgba(138,43,226,0.5) 50%,transparent 100%);border-radius:0 0 16px 16px;"></td></tr></table></td></tr></table></body></html>`;
}

/**
 * Generate plain text fallback for email clients that don't support HTML
 */
function generatePlainTextFallback(fullName: string, agentCode: string): string {
  const name = fullName || 'Operativo';
  const currentYear = new Date().getFullYear();
  
  return `═══════════════════════════════════════════════════
🧠 M1SSION™ — ATTIVAZIONE AGENTE CONFERMATA
═══════════════════════════════════════════════════

Agente ${name},

La tua richiesta di arruolamento è stata APPROVATA.
Sei stato assegnato al programma M1SSION™ — la prima caccia al tesoro globale con premi reali.

═══════════════════════════════════════════════════
IL TUO CODICE AGENTE UNIVOCO
═══════════════════════════════════════════════════

>>> ${agentCode} <<<

⚠️ Conserva questo codice. È la tua identità nella missione.

═══════════════════════════════════════════════════
🚀 LANCIO GLOBALE: 19 DICEMBRE 2025
═══════════════════════════════════════════════════

La caccia ha inizio. Preparati a decifrare indizi, risolvere enigmi e competere per premi straordinari.

PROSSIMI PASSI:
1. Scegli un piano di abbonamento per attivare l'accesso completo
2. Familiarizza con l'interfaccia e le meccaniche di gioco
3. Attendi il briefing iniziale il 19 dicembre

👉 SCEGLI IL TUO PIANO: https://m1ssion.eu/choose-plan

═══════════════════════════════════════════════════

IT IS POSSIBLE.
— Comando Centrale M1SSION™

© ${currentYear} M1SSION™ — All Rights Reserved
NIYVORA KFT™ — Budapest, Hungary

Per supporto: contact@m1ssion.com`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    let emailData: WelcomeEmailData;
    try {
      emailData = await req.json();
      console.log("📧 Welcome email request:", JSON.stringify({ to: emailData.to, agentCode: emailData.agentCode }));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, message: 'Errore nel formato dei dati inviati' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { to, fullName, agentCode } = emailData;

    // Validate required fields
    if (!to || !agentCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campi obbligatori mancanti: to, agentCode' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SMTP Configuration - IONOS SSL on port 465
    // Authenticate with contact@ but send FROM noreply@
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.ionos.it";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER") || "contact@m1ssion.com";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const noreplyEmail = "noreply@m1ssion.com"; // Send FROM this address
    const contactEmail = Deno.env.get("CONTACT_EMAIL") || "contact@m1ssion.com";

    console.log("📮 SMTP Configuration:", { host: smtpHost, port: smtpPort, authUser: smtpUser, fromEmail: noreplyEmail });

    if (!smtpPassword) {
      console.error("❌ SMTP_PASSWORD environment variable not set");
      throw new Error("Configurazione SMTP incompleta");
    }

    // Generate email content
    const htmlContent = generatePremiumWelcomeEmail(fullName, agentCode);
    const textContent = generatePlainTextFallback(fullName, agentCode);
    const subject = `🧠 M1SSION™ — Attivazione Agente ${agentCode} Confermata`;

    console.log(`📤 Sending welcome email to: ${to}`);

    // Create SMTP client
    let client: SMTPClient | null = null;
    
    try {
      client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: true, // SSL for port 465
          auth: {
            username: smtpUser, // Authenticate with contact@
            password: smtpPassword,
          },
        },
      });

      // Send the email with proper encoding from noreply@
      await client.send({
        from: `"M1SSION™" <${noreplyEmail}>`,
        to: to,
        replyTo: contactEmail, // Reply-To goes to contact@
        subject: subject,
        content: textContent,
        html: htmlContent,
      });

      console.log("✅ Welcome email sent successfully!");
      
      // Close client
      if (client) {
        try {
          await client.close();
        } catch (closeErr) {
          console.warn("⚠️ Error closing SMTP client:", closeErr);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email di benvenuto inviata con successo',
          to: to,
          agentCode: agentCode
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      
      if (client) {
        try {
          await client.close();
        } catch (closeErr) {
          console.warn("⚠️ Error closing SMTP client:", closeErr);
        }
      }
      
      throw emailError;
    }

  } catch (error) {
    console.error('💥 Welcome email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email',
        errorDetails: error instanceof Error ? error.stack : 'No stack trace available'
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
