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
export const sendConfirmationEmail = async (name: string, email: string, referralCode: string): Promise<boolean> => {
  try {
    // Import the registration email service 
    const { sendRegistrationEmail } = await import('@/services/email/registrationEmailService');
    
    // Send email using the Mailjet edge function
    const success = await sendRegistrationEmail({
      email,
      name,
      formType: "preregistrazione"
    });
    
    return success;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return false;
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
