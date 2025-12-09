// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🔐 Admin email for registration notifications
const ADMIN_EMAIL = "wikus77@hotmail.it";

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

    console.log(`📧 REGISTRATION NOTIFICATION for ${email}`);

    // 🚀 OTTIMIZZAZIONE: Recupera agent_code reale dal database
    // Il trigger lo genera automaticamente, non usare quello client-side
    let realAgentCode = agentCode;
    if (agentCode === 'PENDING' && userId !== 'bypass-user') {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('agent_code')
          .eq('id', userId)
          .single();
        
        if (profile?.agent_code) {
          realAgentCode = profile.agent_code;
          console.log(`✅ Agent code from DB: ${realAgentCode}`);
        }
      } catch (e) {
        console.warn('⚠️ Could not fetch agent_code from DB, using placeholder');
        realAgentCode = `AGT-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      }
    }

    // 🔥 PARALLELIZZA tutte le operazioni indipendenti
    const tasks: Promise<any>[] = [];

    // 1. Push notification (se c'è token) - IN PARALLELO
    if (deviceToken) {
      tasks.push(
        supabase.functions.invoke('send-push-notification', {
          body: {
            token: deviceToken,
            title: "🧠 Benvenuto in M1SSION™!",
            body: `Il tuo codice agente ${realAgentCode} è stato creato. Scegli un piano per iniziare!`,
            data: { type: 'registration_welcome', agentCode: realAgentCode, status: 'registered_pending' }
          }
        }).then(r => ({ type: 'push', success: !r.error })).catch(() => ({ type: 'push', success: false }))
      );
    }

    // 2. Email di benvenuto - IN PARALLELO
    tasks.push(
      supabase.functions.invoke('send-email', {
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
                <p style="font-size: 16px; line-height: 1.6;">Ciao ${fullName || 'Agente'},</p>
                <p style="font-size: 16px; line-height: 1.6;">La tua registrazione è stata completata. Il tuo codice agente è:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; color: #00d1ff; background: #1a1a2e; padding: 10px 20px; border-radius: 6px; border: 2px solid #00d1ff;">${realAgentCode}</span>
                </div>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://m1ssion.eu/choose-plan" style="display: inline-block; background: linear-gradient(135deg, #00d1ff, #0099cc); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">🚀 SCEGLI IL TUO PIANO</a>
              </div>
              <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; border-left: 4px solid #ffa500; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #ccc;"><strong>⚠️ Importante:</strong> Per accedere alla missione devi completare l'abbonamento.</p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                <p style="font-size: 12px; color: #666; margin: 0;">© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™</p>
              </div>
            </div>
          `
        }
      }).then(r => ({ type: 'email', success: !r.error })).catch(() => ({ type: 'email', success: false }))
    );

    // 3. Log attività - IN PARALLELO
    tasks.push(
      supabase.from('user_logs').insert({
        user_id: userId === 'bypass-user' ? null : userId,
        action: 'registration_notification_sent',
        details: { agent_code: realAgentCode, email, full_name: fullName, timestamp: new Date().toISOString() }
      }).then(() => ({ type: 'log', success: true })).catch(() => ({ type: 'log', success: false }))
    );

    // 4. Admin notification - IN PARALLELO (non blocca)
    tasks.push(
      (async () => {
        try {
          const { data: adminUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', ADMIN_EMAIL)
            .single();
          
          if (adminUser?.id) {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/webpush-targeted-send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
                'x-admin-token': Deno.env.get('PUSH_ADMIN_TOKEN') || ''
              },
              body: JSON.stringify({
                user_ids: adminUser.id,
                payload: {
                  title: '🆕 Nuova Registrazione',
                  body: `${fullName || 'Nuovo utente'} (${email})`,
                  icon: '/icons/icon-192x192.png',
                  tag: `registration-${userId}`
                }
              })
            });
          }
          return { type: 'admin', success: true };
        } catch {
          return { type: 'admin', success: false };
        }
      })()
    );

    // 🚀 ESEGUI TUTTO IN PARALLELO (molto più veloce!)
    const results = await Promise.allSettled(tasks);
    console.log('📊 Notification results:', results.map(r => r.status === 'fulfilled' ? r.value : 'failed'));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Registration notifications sent successfully',
        agentCode: realAgentCode
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