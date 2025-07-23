// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanUpdateRequest {
  user_id: string;
  new_plan: string;
  event_type?: string;
  old_plan?: string;
  amount?: number;
  payment_intent_id?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`🔄 [PLAN-UPDATE] ${step}${detailsStr}`);
};

const generatePlanEmailTemplate = (plan: string, userEmail: string): { subject: string; html: string } => {
  const planNames = {
    'silver': 'Silver',
    'gold': 'Gold', 
    'black': 'Black',
    'titanium': 'Titanium'
  };

  const planName = planNames[plan.toLowerCase() as keyof typeof planNames] || plan;

  const templates = {
    silver: {
      subject: '🥈 Benvenuto tra gli Agenti Silver!',
      html: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; font-family: Arial, sans-serif;">
          <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #4a5568; margin-bottom: 20px;">🚀 Accesso Silver Attivato!</h1>
            <p style="color: #718096; font-size: 18px; margin-bottom: 20px;">
              Congratulazioni Agente! Il tuo piano Silver è ora attivo.
            </p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #2d3748;">I tuoi vantaggi Silver:</h3>
              <ul style="text-align: left; color: #4a5568;">
                <li>✅ 3 indizi per missione</li>
                <li>⏰ Accesso anticipato 2 ore</li>
                <li>🗺️ BUZZ Map base</li>
                <li>📞 Supporto priority</li>
              </ul>
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              Firmato: <strong>Joseph MULÉ – M1SSION™</strong><br>
              CEO & Founder - NIYVORA KFT™
            </p>
          </div>
        </div>
      `
    },
    gold: {
      subject: '🏆 Benvenuto tra gli Agenti Gold!',
      html: `
        <div style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); padding: 40px; font-family: Arial, sans-serif;">
          <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #b7791f; margin-bottom: 20px;">🚀 Accesso Gold Sbloccato!</h1>
            <p style="color: #975a16; font-size: 18px; margin-bottom: 20px;">
              Congratulazioni Agente Gold! Sei ora tra l'elite.
            </p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #f6d365;">
              <h3 style="color: #92400e;">I tuoi vantaggi Gold:</h3>
              <ul style="text-align: left; color: #b45309;">
                <li>✅ 5 indizi per missione</li>
                <li>⏰ Accesso anticipato 24 ore</li>
                <li>🗺️ BUZZ Map premium</li>
                <li>🔧 Strumenti Intelligence</li>
                <li>👑 Badge esclusivo Gold</li>
              </ul>
            </div>
            <div style="background: #10b981; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>🎯 Accesso anticipato: 24h prima di tutti!</strong>
            </div>
            <p style="color: #92400e; font-size: 14px; margin-top: 30px;">
              Firmato: <strong>Joseph MULÉ – M1SSION™</strong><br>
              CEO & Founder - NIYVORA KFT™
            </p>
          </div>
        </div>
      `
    },
    black: {
      subject: '⚫ Benvenuto tra gli Agenti Black Elite!',
      html: `
        <div style="background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%); padding: 40px; font-family: Arial, sans-serif;">
          <div style="background: #1a1a1a; color: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #38bdf8; margin-bottom: 20px;">⚫ Elite Black Access!</h1>
            <p style="color: #cbd5e1; font-size: 18px; margin-bottom: 20px;">
              Benvenuto nell'elite più esclusiva di M1SSION™
            </p>
            <div style="background: #0f172a; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #38bdf8;">
              <h3 style="color: #38bdf8;">Vantaggi Elite Black:</h3>
              <ul style="text-align: left; color: #cbd5e1;">
                <li>✅ 10 indizi per missione</li>
                <li>⏰ Accesso anticipato 48 ore</li>
                <li>🗺️ BUZZ Map illimitato</li>
                <li>🔧 Tutti gli strumenti Intelligence</li>
                <li>🏆 Premi esclusivi Black</li>
                <li>📞 Supporto dedicato VIP</li>
              </ul>
            </div>
            <div style="background: #7c3aed; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>⚡ Accesso ultra-anticipato: 48h di vantaggio!</strong>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
              Firmato: <strong>Joseph MULÉ – M1SSION™</strong><br>
              CEO & Founder - NIYVORA KFT™
            </p>
          </div>
        </div>
      `
    },
    titanium: {
      subject: '💎 Benvenuto nell\'Elite Titanium Assoluta!',
      html: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #a855f7; margin-bottom: 20px;">💎 TITANIUM ULTIMATE!</h1>
            <p style="color: #e2e8f0; font-size: 20px; margin-bottom: 20px;">
              Sei ora parte dell'elite assoluta di M1SSION™
            </p>
            <div style="background: #312e81; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #a855f7;">
              <h3 style="color: #c084fc;">Vantaggi Titanium Ultimate:</h3>
              <ul style="text-align: left; color: #e2e8f0;">
                <li>✅ Indizi ILLIMITATI</li>
                <li>⏰ Accesso anticipato 72 ore</li>
                <li>🗺️ BUZZ Map premium illimitato</li>
                <li>🔧 Strumenti Intelligence elite</li>
                <li>💎 Badge Titanium esclusivo neon</li>
                <li>📞 Supporto VIP 24/7 dedicato</li>
                <li>🎊 Eventi esclusivi Titanium</li>
              </ul>
            </div>
            <div style="background: linear-gradient(90deg, #7c3aed 0%, #f59e0b 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <strong>⚡ ACCESSO SUPREMO: 72h di vantaggio totale!</strong>
            </div>
            <p style="color: #c7d2fe; font-size: 14px; margin-top: 30px;">
              Firmato: <strong>Joseph MULÉ – M1SSION™</strong><br>
              CEO & Founder - NIYVORA KFT™
            </p>
          </div>
        </div>
      `
    }
  };

  return templates[plan.toLowerCase() as keyof typeof templates] || {
    subject: `Piano ${planName} attivato!`,
    html: `<p>Il tuo piano ${planName} è stato attivato con successo!</p>`
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Create Supabase clients
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Authentication failed: ${userError?.message}`);
    }

    const user = userData.user;
    logStep('User authenticated', { userId: user.id, email: user.email });

    // Parse request body
    const body: PlanUpdateRequest = await req.json();
    const { user_id, new_plan, event_type = 'upgrade', old_plan, amount, payment_intent_id } = body;

    // Validate that authenticated user matches request
    if (user.id !== user_id) {
      throw new Error('User ID mismatch');
    }

    logStep('Request validated', { new_plan, event_type, old_plan });

    // Get current plan before update
    const { data: currentProfile } = await supabaseService
      .from('profiles')
      .select('plan')
      .eq('id', user_id)
      .single();

    const currentPlan = currentProfile?.plan || 'base';

    // Update user plan using the comprehensive function
    const { data: updateResult, error: updateError } = await supabaseService
      .rpc('update_user_plan_complete', {
        p_user_id: user_id,
        p_new_plan: new_plan,
        p_event_type: event_type,
        p_old_plan: old_plan || currentPlan,
        p_amount: amount,
        p_payment_intent_id: payment_intent_id
      });

    if (updateError) {
      logStep('ERROR: Plan update failed', updateError);
      throw new Error(`Plan update failed: ${updateError.message}`);
    }

    logStep('Plan updated successfully', updateResult);

    // Send email notification for paid plans
    if (new_plan !== 'base') {
      try {
        const emailTemplate = generatePlanEmailTemplate(new_plan, user.email!);
        
        const { error: emailError } = await supabaseService.functions.invoke('send-mailjet-email', {
          body: {
            type: 'transactional',
            to: [{ email: user.email!, name: user.email!.split('@')[0] }],
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.html,
            trackOpens: true,
            trackClicks: true,
            customCampaign: `plan_activation_${new_plan}`
          }
        });

        if (emailError) {
          console.error('❌ Email sending failed:', emailError);
          // Don't fail the whole request for email errors
        } else {
          logStep('Email sent successfully', { plan: new_plan });
        }
      } catch (emailErr) {
        console.error('❌ Email sending exception:', emailErr);
        // Don't fail the whole request for email errors
      }
    }

    // Send push notification
    try {
      const pushMessage = {
        silver: '🥈 Piano Silver attivato! Accesso prioritario sbloccato.',
        gold: '🏆 Piano Gold attivato! Accesso anticipato 24h attivo.',
        black: '⚫ Piano Black Elite attivato! Vantaggi supremi sbloccati.',
        titanium: '💎 Piano Titanium Ultimate attivato! Accesso illimitato!'
      }[new_plan.toLowerCase()] || `Piano ${new_plan} attivato con successo!`;

      const { error: pushError } = await supabaseService.functions.invoke('send-push-notification', {
        body: {
          user_id: user_id,
          title: 'M1SSION™ - Piano Attivato!',
          message: pushMessage,
          data: {
            type: 'plan_activated',
            plan: new_plan,
            access_starts_at: updateResult.access_starts_at
          }
        }
      });

      if (pushError) {
        console.error('❌ Push notification failed:', pushError);
        // Don't fail the whole request for push notification errors
      } else {
        logStep('Push notification sent successfully');
      }
    } catch (pushErr) {
      console.error('❌ Push notification exception:', pushErr);
      // Don't fail the whole request for push notification errors
    }

    // Send in-app notification
    try {
      await supabaseService.rpc('send_user_notification', {
        p_user_id: user_id,
        p_notification_type: 'in_app',
        p_title: `Piano ${new_plan.toUpperCase()} Attivato!`,
        p_message: `Congratulazioni! Il tuo piano ${new_plan} è ora attivo con tutti i vantaggi.`,
        p_metadata: {
          plan: new_plan,
          event_type: event_type,
          access_starts_at: updateResult.access_starts_at
        }
      });
      
      logStep('In-app notification created');
    } catch (notifErr) {
      console.error('❌ In-app notification failed:', notifErr);
    }

    const response = {
      success: true,
      message: `Piano ${new_plan} aggiornato con successo`,
      data: updateResult,
      notifications_sent: {
        email: new_plan !== 'base',
        push: true,
        in_app: true
      }
    };

    logStep('Function completed successfully', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in handle-plan-update', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});