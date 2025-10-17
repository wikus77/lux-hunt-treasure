// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationNotificationRequest {
  userId: string;
  email: string;
  agentCode: string;
  fullName?: string;
  deviceToken?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, email, agentCode, fullName, deviceToken }: RegistrationNotificationRequest = await req.json();

    console.log(`📧 REGISTRATION NOTIFICATION for ${email} with agent code ${agentCode}`);

    // 1. Invia notifica push se c'è un device token
    if (deviceToken) {
      try {
        const pushResponse = await supabase.functions.invoke('send-push-notification', {
          body: {
            token: deviceToken,
            title: "🧠 Benvenuto in M1SSION™!",
            body: `Il tuo codice agente ${agentCode} è stato creato. Scegli un piano per iniziare!`,
            data: {
              type: 'registration_welcome',
              agentCode,
              status: 'registered_pending'
            }
          }
        });

        if (pushResponse.error) {
          console.error('❌ Push notification failed:', pushResponse.error);
        } else {
          console.log('✅ Push notification sent successfully');
        }
      } catch (pushError) {
        console.error('💥 Push notification exception:', pushError);
      }
    }

    // 2. Invia email di benvenuto
    try {
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: "🧠 Benvenuto in M1SSION™ - Il tuo codice agente è pronto",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00d1ff; font-size: 28px; margin: 0;">M1SSION™</h1>
                <p style="color: #888; margin: 5px 0 0 0;">Tactical Intelligence Game</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #00d1ff33;">
                <h2 style="color: #00d1ff; margin-top: 0;">🧠 Benvenuto in M1SSION™!</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                  Ciao ${fullName || 'Agente'},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  La tua registrazione è stata completata con successo. Il tuo codice agente è:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; color: #00d1ff; background: #1a1a2e; padding: 10px 20px; border-radius: 6px; border: 2px solid #00d1ff;">
                    ${agentCode}
                  </span>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://','https://').replace('.supabase.co','.lovable.app') || 'https://m1ssion.lovable.app'}/subscriptions" 
                   style="display: inline-block; background: linear-gradient(135deg, #00d1ff, #0099cc); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  🚀 SCEGLI IL TUO PIANO
                </a>
              </div>
              
              <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; border-left: 4px solid #ffa500; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #ccc;">
                  <strong>⚠️ Importante:</strong> Per accedere alla missione devi completare l'abbonamento. 
                  Il tuo accesso sarà abilitato in base al piano scelto.
                </p>
              </div>
              
              <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; border-left: 4px solid #00d1ff;">
                <p style="margin: 0; font-size: 14px; color: #ccc;">
                  <strong>🔐 Sicurezza:</strong> Mantieni il tuo codice agente riservato. È la tua identità nella missione.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
                </p>
              </div>
            </div>
          `
        }
      });

      if (emailResponse.error) {
        console.error('❌ Email notification failed:', emailResponse.error);
      } else {
        console.log('✅ Email notification sent successfully');
      }
    } catch (emailError) {
      console.error('💥 Email notification exception:', emailError);
    }

    // 3. Log dell'attività
    await supabase.from('user_logs').insert({
      user_id: userId,
      action: 'registration_notification_sent',
      details: {
        agent_code: agentCode,
        email: email,
        full_name: fullName,
        notification_methods: {
          push: !!deviceToken,
          email: true
        },
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Registration notifications sent successfully',
        agentCode: agentCode
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Registration notification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});