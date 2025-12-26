// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Auto-Reply Email Function for contact@m1ssion.com

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoReplyData {
  to: string;
  senderName: string;
  originalSubject?: string;
}

/**
 * Generate Premium HTML Auto-Reply Email - M1SSION™
 * Style: Professional / Brand-consistent / Cinematic
 */
function generateAutoReplyEmail(senderName: string, originalSubject?: string): string {
  const currentYear = new Date().getFullYear();
  const name = senderName || 'Agente';
  const subject = originalSubject || 'il tuo messaggio';
  
  return `<!DOCTYPE html><html lang="it" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"><title>M1SSION - Messaggio Ricevuto</title><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:linear-gradient(180deg,#0a0a0f 0%,#0d0d14 50%,#0a0a0f 100%);border:1px solid rgba(0,229,255,0.15);border-radius:16px;"><tr><td style="height:3px;background:linear-gradient(90deg,transparent 0%,#00E5FF 50%,transparent 100%);border-radius:16px 16px 0 0;"></td></tr><tr><td align="center" style="padding:25px 30px 10px 30px;"><img src="https://m1ssion.eu/icons/icon-m1-192x192.png" alt="M1SSION" width="80" height="80" style="display:block;width:80px;height:80px;border:0;border-radius:12px;box-shadow:0 0 20px rgba(0,229,255,0.3);"></td></tr><tr><td align="center" style="padding:10px 30px 20px 30px;"><span style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;letter-spacing:2px;"><span style="color:#00E5FF;text-shadow:0 0 15px rgba(0,229,255,0.5);">M1</span><span style="color:#ffffff;">SSION</span><span style="font-size:10px;vertical-align:super;color:#888;">™</span></span></td></tr><tr><td style="padding:0 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(0,229,255,0.2) 50%,transparent 100%);"></td></tr></table></td></tr><tr><td style="padding:30px 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:20px;"><span style="display:inline-block;background:linear-gradient(135deg,rgba(0,229,255,0.1) 0%,rgba(138,43,226,0.1) 100%);border:1px solid rgba(0,229,255,0.2);border-radius:6px;padding:10px 20px;font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:2px;color:#00E5FF;font-weight:600;text-transform:uppercase;">✅ MESSAGGIO RICEVUTO</span></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:16px;color:#ffffff;padding-bottom:15px;line-height:1.6;">Ciao <span style="color:#00E5FF;font-weight:600;">${name}</span>,</td></tr><tr><td style="font-size:14px;color:#cccccc;padding-bottom:20px;line-height:1.7;">Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio riguardo a "<span style="color:#ffffff;font-style:italic;">${subject}</span>".</td></tr><tr><td style="font-size:14px;color:#cccccc;padding-bottom:20px;line-height:1.7;">Il nostro team esaminerà la tua richiesta e ti risponderà il prima possibile, generalmente entro <span style="color:#00E5FF;font-weight:600;">24-48 ore lavorative</span>.</td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;"><tr><td style="background:rgba(138,43,226,0.1);border-left:3px solid #8a2be2;border-radius:0 6px 6px 0;padding:15px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#aaa;line-height:1.6;">💡 <strong style="color:#ffffff;">Nel frattempo:</strong><br>Visita <a href="https://m1ssion.eu" style="color:#00E5FF;text-decoration:none;font-weight:600;">m1ssion.eu</a> per scoprire tutte le novità e prepararti alla caccia al tesoro!</td></tr></table></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px;color:#888;padding-top:20px;line-height:1.6;font-style:italic;">A presto,</td></tr><tr><td style="font-size:13px;color:#666;padding-top:5px;">— Il Team M1SSION™</td></tr></table></td></tr><tr><td style="padding:0 40px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.08) 50%,transparent 100%);"></td></tr></table></td></tr><tr><td style="background:rgba(0,0,0,0.3);padding:20px 30px;border-radius:0 0 16px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="font-size:10px;color:#555;line-height:1.8;">© ${currentYear} <span style="color:#00E5FF;">M1</span>SSION™ — All Rights Reserved<br><span style="color:#444;">NIYVORA KFT™ — Budapest, Hungary</span></td></tr><tr><td align="center" style="padding-top:10px;"><span style="font-size:9px;color:#444;">Questa è una risposta automatica. Per ulteriori informazioni visita <a href="https://m1ssion.eu" style="color:#00E5FF;text-decoration:none;">m1ssion.eu</a></span></td></tr></table></td></tr><tr><td style="height:2px;background:linear-gradient(90deg,transparent 0%,rgba(138,43,226,0.4) 50%,transparent 100%);border-radius:0 0 16px 16px;"></td></tr></table></td></tr></table></body></html>`;
}

/**
 * Generate plain text fallback
 */
function generatePlainTextFallback(senderName: string, originalSubject?: string): string {
  const name = senderName || 'Agente';
  const subject = originalSubject || 'il tuo messaggio';
  const currentYear = new Date().getFullYear();
  
  return `═══════════════════════════════════════════════════
M1SSION™ — MESSAGGIO RICEVUTO
═══════════════════════════════════════════════════

Ciao ${name},

Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio riguardo a "${subject}".

Il nostro team esaminerà la tua richiesta e ti risponderà il prima possibile, generalmente entro 24-48 ore lavorative.

Nel frattempo, visita https://m1ssion.eu per scoprire tutte le novità e prepararti alla caccia al tesoro!

A presto,
— Il Team M1SSION™

═══════════════════════════════════════════════════

© ${currentYear} M1SSION™ — All Rights Reserved
NIYVORA KFT™ — Budapest, Hungary

Questa è una risposta automatica.
Per ulteriori informazioni visita https://m1ssion.eu`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let autoReplyData: AutoReplyData;
    try {
      autoReplyData = await req.json();
      console.log("📧 Auto-reply request:", JSON.stringify({ to: autoReplyData.to }));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, message: 'Errore nel formato dei dati' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { to, senderName, originalSubject } = autoReplyData;

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campo obbligatorio mancante: to' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SMTP Configuration
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.ionos.it";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER") || "contact@m1ssion.com";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpPassword) {
      throw new Error("Configurazione SMTP incompleta");
    }

    const htmlContent = generateAutoReplyEmail(senderName, originalSubject);
    const textContent = generatePlainTextFallback(senderName, originalSubject);
    const subject = `✅ M1SSION™ — Abbiamo ricevuto il tuo messaggio`;

    let client: SMTPClient | null = null;
    
    try {
      client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: true,
          auth: {
            username: smtpUser,
            password: smtpPassword,
          },
        },
      });

      await client.send({
        from: `"M1SSION™" <${smtpUser}>`,
        to: to,
        replyTo: smtpUser,
        subject: subject,
        content: textContent,
        html: htmlContent,
      });

      console.log("✅ Auto-reply sent successfully!");
      
      if (client) {
        try { await client.close(); } catch (e) { console.warn("Close error:", e); }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Auto-reply inviata con successo', to }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } catch (emailError) {
      if (client) {
        try { await client.close(); } catch (e) { console.warn("Close error:", e); }
      }
      throw emailError;
    }

  } catch (error) {
    console.error('💥 Auto-reply error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Errore durante l\'invio'
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);



