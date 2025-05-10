
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreRegistrationData {
  name: string;
  email: string;
  referrer?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore di configurazione del server" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Use service role to bypass RLS policies
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    console.log("Received pre-registration request:", requestData);
    
    const { name, email, referrer } = requestData as PreRegistrationData;
    
    // Validation
    if (!name || !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Nome ed email sono campi obbligatori" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Formato email non valido" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('pre_registrations')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Using maybeSingle instead of single to avoid errors
    
    console.log("Check for existing user:", { existingUser, checkError });
    
    if (checkError) {
      console.error("Error checking existing user:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore durante la verifica dell'email", 
          details: checkError 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Questa email è già stata registrata",
          alreadyRegistered: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate referral code with improved entropy
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const randomStr = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 6)
      .toUpperCase();
    
    const referralCode = `${name.substring(0, 3).toUpperCase()}${randomStr}`;
    
    // Insert pre-registration using the service role client
    const { data: registration, error: registrationError } = await supabase
      .from('pre_registrations')
      .insert([{
        name: name.trim(),
        email: email.trim(),
        referrer: referrer?.trim(),
        referral_code: referralCode,
        credits: 100
      }])
      .select();
    
    console.log("Registration result:", { registration, registrationError });
    
    if (registrationError) {
      console.error("Registration error:", registrationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Errore durante la registrazione: " + registrationError.message, 
          details: registrationError 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Try to send confirmation email using Mailjet edge function
    try {
      // Create the proper HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%); padding: 20px; text-align: center; color: #000;">
            <h1 style="margin: 0; color: #FFF;">M1SSION</h1>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff;">
            <h3>Sei ufficialmente un agente M1SSION.</h3>
            <p>Hai completato la pre-iscrizione. Tieniti pronto: la tua prima missione sta per arrivare.</p>
            
            <p style="margin-top: 20px;">Il tuo codice referral: <strong>${referralCode}</strong></p>
            
            <p>Puoi invitare altri agenti usando questo codice e guadagnare crediti extra per la tua missione!</p>
          </div>
          
          <div style="font-size: 12px; text-align: center; padding-top: 20px; color: #999;">
            <p>&copy; ${new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
            <p>Questo messaggio è stato inviato automaticamente a seguito della tua pre-registrazione su M1SSION.</p>
          </div>
        </div>
      `;
      
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-mailjet-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            type: 'pre_registration', 
            to: [{ email: email.trim(), name: name.trim() }],
            subject: 'Conferma pre-iscrizione M1SSION',
            from: {
              Email: "contact@m1ssion.com",
              Name: "M1SSION Team"
            },
            htmlContent: htmlContent,
            customId: `pre_reg_${Date.now()}`,
            customCampaign: 'pre_registration_confirmation',
            trackOpens: true,
            trackClicks: true
          })
        }
      );
      
      const emailResult = await emailResponse.json();
      console.log("Email sending result:", emailResult);
      
      // Even if email fails, we still want to return success for the registration
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue execution, don't return error response here
    }
    
    // Return success response with the user's referral code
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pre-registrazione completata con successo",
        referral_code: referralCode
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Errore del server", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
