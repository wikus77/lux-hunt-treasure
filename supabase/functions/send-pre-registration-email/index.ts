// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreRegistrationEmailRequest {
  email: string;
  agent_code: string;
  name?: string;
  subscription_plan?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, agent_code, name, subscription_plan = 'base' }: PreRegistrationEmailRequest = await req.json();

    console.log('📧 Sending pre-registration email to:', email, 'with agent code:', agent_code);

    const emailResponse = await resend.emails.send({
      from: "M1SSION™ <noreply@m1ssion.com>",
      to: [email],
      subject: "🚀 Pre-registrazione M1SSION™ completata!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pre-registrazione M1SSION™</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 20px;">
          
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="background: linear-gradient(135deg, #00FFFF, #0066FF); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">
                M1
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
                <span style="color: #00FFFF;">M1</span><span style="color: #ffffff;">SSION™</span>
              </h1>
              <p style="color: #999; margin: 10px 0 0 0;">Pre-registrazione completata con successo</p>
            </div>

            <!-- Success Message -->
            <div style="background: linear-gradient(135deg, #003300, #006600); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #00AA00;">
              <h2 style="color: #00FF00; margin: 0 0 15px 0; font-size: 22px;">🎉 Benvenuto nella M1SSION™!</h2>
              <p style="color: #CCFFCC; margin: 0; font-size: 16px; line-height: 1.6;">
                ${name ? `Ciao ${name}, la` : 'La'} tua pre-registrazione è stata completata con successo. 
                Sei ora in lista prioritaria per l'accesso alla missione più epica del 2025!
              </p>
            </div>

            <!-- Agent Code -->
            <div style="background: linear-gradient(135deg, #001133, #003366); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #0099FF; text-align: center;">
              <h3 style="color: #00CCFF; margin: 0 0 15px 0; font-size: 18px;">🆔 Il tuo Codice Agente</h3>
              <div style="background: #000; padding: 20px; border-radius: 8px; border: 2px solid #00FFFF; font-family: 'Courier New', monospace;">
                <div style="font-size: 24px; font-weight: bold; color: #00FFFF; letter-spacing: 2px;">
                  ${agent_code}
                </div>
              </div>
              <p style="color: #99CCFF; margin: 15px 0 0 0; font-size: 14px;">
                Conserva questo codice! Ti servirà per l'accesso prioritario.
              </p>
            </div>

            ${subscription_plan !== 'base' ? `
            <!-- Early Access -->
            <div style="background: linear-gradient(135deg, #330033, #660066); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #CC00CC;">
              <h3 style="color: #FF00FF; margin: 0 0 15px 0; font-size: 18px;">⚡ Accesso Anticipato Attivato</h3>
              <p style="color: #FFCCFF; margin: 0; font-size: 16px; line-height: 1.6;">
                Con il piano <strong>${subscription_plan.toUpperCase()}</strong>, avrai accesso anticipato alla M1SSION™ 
                ${subscription_plan === 'silver' ? '2 ore' : 
                  subscription_plan === 'gold' ? '24 ore' : 
                  subscription_plan === 'black' ? '48 ore' : 
                  subscription_plan === 'titanium' ? '72 ore' : ''} 
                prima del lancio ufficiale!
              </p>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #444;">
              <h3 style="color: #FFFFFF; margin: 0 0 20px 0; font-size: 18px;">📋 Prossimi Passi</h3>
              <ul style="color: #CCCCCC; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Ti invieremo una email di notifica quando sarà il momento dell'accesso</li>
                <li>Tieni pronto il tuo codice agente per il login prioritario</li>
                <li>Segui i nostri canali social per aggiornamenti in tempo reale</li>
                <li>Prepara la tua strategia per la missione più difficile mai creata!</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #333;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
              </p>
              <p style="color: #888; margin: 0; font-size: 12px;">
                Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Pre-registration email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error sending pre-registration email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);