
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PreRegistrationFormData } from "./types";
import { generateReferralCode } from "./referralUtils";
import { logActivity } from "@/services/activityLogService";
import { createReferral } from "@/services/referralService";

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
    // Get the current authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    console.log("Current authenticated user ID:", userId || "Not authenticated");
    
    const { data, error } = await supabase
      .from('pre_registrations')
      .insert([
        {
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          referral_code: referralCode,
          credits: 100,
          user_id: userId || null // Include the user_id if user is authenticated
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error during registration:", error);
      throw new Error("Errore durante la registrazione");
    }
    
    console.log("User registered successfully:", data);
    
    // Log the pre-registration activity
    await logActivity({
      userEmail: userData.email,
      action: 'pre_registration',
      metadata: {
        name: userData.name,
        referral_code: referralCode,
        user_id: userId || null
      }
    });
    
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
    console.log("Attempting registration via edge function");
    
    // Get the current authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    console.log("Current authenticated user ID for edge function:", userId || "Not authenticated");
    
    const { data, error } = await supabase.functions.invoke('handle-pre-registration', {
      body: {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        user_id: userId || null // Include the user_id if user is authenticated
      }
    });
    
    if (error) {
      console.error("Error in edge function registration:", error);
      throw new Error("Errore durante la registrazione");
    }
    
    console.log("Edge function registration response:", data);
    
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
    console.log("Sending confirmation email to:", email);
    console.log("Including referral code:", referralCode);
    
    // First method: Use the registration email service
    try {
      // Import the registration email service 
      const { sendRegistrationEmail } = await import('@/services/email/registrationEmailService');
      
      // Send email using the Mailjet edge function
      const success = await sendRegistrationEmail({
        email,
        name,
        formType: "preregistrazione",
        referral_code: referralCode  // Pass the referral code here
      });
      
      if (success) {
        console.log("Confirmation email sent successfully via registrationEmailService");
        return true;
      }
      
      // If the first method fails, try the second method
      throw new Error("First email method failed");
      
    } catch (primaryError) {
      console.warn("Error with primary email method, trying secondary method:", primaryError);
      
      // Second method: Direct edge function call
      try {
        const { data, error } = await supabase.functions.invoke('send-registration-email', {
          body: {
            email: email,
            name: name,
            formType: "preregistrazione",
            referral_code: referralCode  // Pass the referral code here too
          }
        });
        
        if (error) {
          console.error("Error sending confirmation email via edge function:", error);
          throw error;
        }
        
        console.log("Confirmation email sent successfully via direct edge function call", data);
        return true;
        
      } catch (secondaryError) {
        console.error("All email methods failed:", secondaryError);
        
        // Even though email sending failed, we don't want to break the registration flow
        // So we'll show a warning but continue the process
        toast.warning("Iscrizione completata, ma l'email potrebbe essere in ritardo", {
          description: "Controlla la tua casella email tra qualche minuto."
        });
        
        return false;
      }
    }
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
    // Update the user record
    const { error } = await supabase
      .from('pre_registrations')
      .update({ referrer: referrerEmail })
      .eq('email', userEmail.toLowerCase().trim());
    
    if (error) {
      console.error("Error updating user with referrer:", error);
      throw new Error("Errore nell'aggiornamento del referrer");
    }
    
    // Create a referral record
    const user = await supabase
      .from('pre_registrations')
      .select('referral_code')
      .eq('email', referrerEmail)
      .maybeSingle();
      
    if (user?.data?.referral_code) {
      await createReferral({
        invitedEmail: userEmail,
        referrerCode: user.data.referral_code
      });
      
      // Log the referral activity
      await logActivity({
        userEmail: userEmail,
        action: 'referral_applied',
        metadata: {
          referrer: referrerEmail,
          referral_code: user.data.referral_code
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating user with referrer:", error);
    throw error;
  }
};

/**
 * Add referral credits to the referrer
 * @param params Object with user_email and credits_to_add
 */
export const addReferralCredits = async (
  params: { user_email: string; credits_to_add: number }
) => {
  try {
    const { error } = await supabase.rpc('add_referral_credits', {
      user_email: params.user_email,
      credits_to_add: params.credits_to_add
    });

    if (error) {
      console.error('Error adding referral credits:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Exception adding referral credits:', err);
    throw err;
  }
};
