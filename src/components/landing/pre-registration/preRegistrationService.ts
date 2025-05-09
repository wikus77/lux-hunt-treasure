
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PreRegistrationFormData } from "./types";
import { generateReferralCode } from "./referralUtils";

/**
 * Check if a user with the provided email already exists
 */
export const checkExistingUser = async (email: string) => {
  const { data, error } = await supabase
    .from('pre_registrations')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  
  if (error) {
    console.error("Error checking for existing user:", error);
    throw new Error("Errore nel controllo dell'email");
  }
  
  return data;
};

/**
 * Register a new user in the pre_registrations table
 */
export const registerUser = async (userData: PreRegistrationFormData) => {
  const referralCode = generateReferralCode(userData.name);
  
  try {
    const { data, error } = await supabase
      .from('pre_registrations')
      .insert([
        {
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          referral_code: referralCode,
          credits: 100
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error during registration:", error);
      throw new Error("Errore durante la registrazione");
    }
    
    return { 
      success: true,
      referralCode: data.referral_code
    };
  } catch (error) {
    console.error("Exception during registration:", error);
    throw error;
  }
};

/**
 * Register a new user via edge function (fallback method)
 */
export const registerUserViaEdgeFunction = async (userData: PreRegistrationFormData) => {
  try {
    const { data, error } = await supabase.functions.invoke('handle-pre-registration', {
      body: {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim()
      }
    });
    
    if (error) {
      console.error("Error in edge function registration:", error);
      throw new Error("Errore durante la registrazione");
    }
    
    if (!data.success) {
      console.error("Registration was not successful:", data);
      throw new Error(data.message || "Errore durante la registrazione");
    }
    
    return {
      success: true,
      referralCode: data.referral_code
    };
  } catch (error) {
    console.error("Exception during edge function registration:", error);
    throw error;
  }
};

/**
 * Send confirmation email to the user after pre-registration
 */
export const sendConfirmationEmail = async (name: string, email: string, referralCode: string) => {
  try {
    console.log(`Sending confirmation email to ${name} <${email}> with referral code ${referralCode}`);
    
    // Use the same Mailjet edge function already used in the contact form
    const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
      body: {
        type: 'contact', // Reusing the contact type as it's the same flow
        to: [{
          email: email.trim(),
          name: name.trim()
        }],
        subject: 'Conferma pre-iscrizione M1SSION',
        from: {
          Email: "contact@m1ssion.com",
          Name: "M1SSION Team"
        },
        htmlContent: `
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
        `,
        trackOpens: true,
        trackClicks: true,
        customCampaign: 'pre_registration_confirmation',
        customId: `pre_reg_${Date.now()}`,
        consent: {
          given: true,
          date: new Date().toISOString(),
          method: 'signup'
        }
      }
    });
    
    if (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
    
    console.log("Confirmation email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    // Don't throw the error here, as this is a non-critical operation
    // We don't want to fail the registration if email sending fails
    return { success: false, error };
  }
};

/**
 * Validate an invite code and return the referrer data
 */
export const validateInviteCode = async (inviteCode: string) => {
  try {
    const { data, error } = await supabase
      .from('pre_registrations')
      .select('name, email')
      .eq('referral_code', inviteCode.trim())
      .maybeSingle();
    
    if (error) {
      console.error("Error validating invite code:", error);
      toast.error("Errore nella validazione del codice", {
        description: "Si è verificato un problema durante la verifica del codice invito."
      });
      return null;
    }
    
    if (!data) {
      toast.error("Codice invito non valido", {
        description: "Il codice inserito non è associato a nessun utente."
      });
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Exception during invite code validation:", error);
    toast.error("Errore nel sistema di inviti", {
      description: "Si è verificato un problema con il sistema di inviti."
    });
    return null;
  }
};

/**
 * Update a user's record with the referrer information
 */
export const updateUserReferrer = async (userEmail: string, referrerEmail: string) => {
  try {
    const { error } = await supabase
      .from('pre_registrations')
      .update({ referrer: referrerEmail })
      .eq('email', userEmail.toLowerCase().trim());
    
    if (error) {
      console.error("Error updating user with referrer:", error);
      throw new Error("Errore nell'aggiornamento del referrer");
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating user with referrer:", error);
    throw error;
  }
};

/**
 * Add referral credits to the referrer
 */
export const addReferralCredits = async (referrerEmail: string, creditsToAdd = 50) => {
  try {
    // Use the built-in database function to add credits
    const { error } = await supabase.rpc('add_referral_credits', {
      referrer_email: referrerEmail.toLowerCase().trim(),
      credits_to_add: creditsToAdd
    });
    
    if (error) {
      console.error("Error adding referral credits:", error);
      throw new Error("Errore nell'aggiunta dei crediti");
    }
    
    return true;
  } catch (error) {
    console.error("Exception adding referral credits:", error);
    throw error;
  }
};
