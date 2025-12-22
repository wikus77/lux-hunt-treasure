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

    // 2. Email di benvenuto PREMIUM via IONOS SMTP - IN PARALLELO
    tasks.push(
      supabase.functions.invoke('send-welcome-email', {
        body: {
          to: email,
          fullName: fullName || 'Agente',
          agentCode: realAgentCode
        }
      }).then(r => {
        console.log('📧 Welcome email result:', r);
        return { type: 'email', success: !r.error };
      }).catch((err) => {
        console.error('📧 Welcome email error:', err);
        return { type: 'email', success: false };
      })
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