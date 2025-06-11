
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message, type } = await req.json();
    
    console.log("📧 Email request received:", { name, email, type });
    
    const MJ_APIKEY_PUBLIC = Deno.env.get('MJ_APIKEY_PUBLIC');
    const MJ_APIKEY_PRIVATE = Deno.env.get('MJ_APIKEY_PRIVATE');
    
    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      throw new Error('Mailjet API keys not configured');
    }
    
    // ✅ NO CAPTCHA VALIDATION - Direct email sending
    console.log("✅ Proceeding with email send - NO CAPTCHA validation");
    
    const emailData = {
      Messages: [{
        From: {
          Email: "noreply@m1ssion.app",
          Name: "M1SSION App"
        },
        To: [{
          Email: "wikus77@hotmail.it",
          Name: "Support Team"
        }],
        Subject: `[${type.toUpperCase()}] ${subject}`,
        TextPart: `
Nuovo messaggio da ${name}
Email: ${email}
${phone ? `Telefono: ${phone}` : ''}

Messaggio:
${message}
        `,
        HTMLPart: `
<h3>Nuovo messaggio da ${name}</h3>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Telefono:</strong> ${phone}</p>` : ''}
<p><strong>Messaggio:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
        `
      }]
    };
    
    const auth = btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`);
    
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Mailjet API error:", errorData);
      throw new Error(`Mailjet API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("✅ Email sent successfully:", result);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email inviata con successo" 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error("❌ Error in send-mailjet-email:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Errore durante l'invio dell'email" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
