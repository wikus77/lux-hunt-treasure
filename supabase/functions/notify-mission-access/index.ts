// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  agentCode: string;
  subscriptionPlan: string;
  userEmail: string;
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

    const { userId, agentCode, subscriptionPlan, userEmail, deviceToken }: NotificationRequest = await req.json();

    console.log(`🔔 MISSION ACCESS NOTIFICATION for agent ${agentCode} (${subscriptionPlan})`);

    // 1. Invia notifica push se c'è un device token
    if (deviceToken) {
      try {
        const pushResponse = await supabase.functions.invoke('send-push-notification', {
          body: {
            token: deviceToken,
            title: "🧠 La tua missione è attiva!",
            body: `Il tuo codice agente ${agentCode} è attivo. Inizia ora la missione!`,
            data: {
              type: 'mission_access',
              agentCode,
              subscriptionPlan
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

    // 2. Invia email di notifica
    try {
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: "✅ La tua missione è attiva – M1SSION™",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00d1ff; font-size: 28px; margin: 0;">M1SSION™</h1>
                <p style="color: #888; margin: 5px 0 0 0;">Tactical Intelligence Game</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #00d1ff33;">
                <h2 style="color: #00d1ff; margin-top: 0;">🧠 La tua missione è attiva!</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                  Ciao agente <strong style="color: #00d1ff;">${agentCode}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  Il tuo piano <strong style="color: #00d1ff;">${subscriptionPlan}</strong> ti consente ora di accedere alla missione.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://','https://').replace('.supabase.co','.lovable.app') || 'https://m1ssion.lovable.app'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #00d1ff, #0099cc); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  🚀 INIZIA LA MISSIONE
                </a>
              </div>
              
              <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; border-left: 4px solid #00d1ff;">
                <p style="margin: 0; font-size: 14px; color: #ccc;">
                  <strong>Importante:</strong> Mantieni il tuo codice agente riservato. È la tua identità nella missione.
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
      action: 'mission_access_notification_sent',
      details: {
        agent_code: agentCode,
        subscription_plan: subscriptionPlan,
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
        message: 'Mission access notifications sent successfully',
        agentCode,
        subscriptionPlan
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Mission access notification error:', error);
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