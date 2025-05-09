
import { supabase } from "@/integrations/supabase/client";
import { PreRegistrationFormData } from './types';
import { generateReferralCode } from './referralUtils';
import { toast } from "sonner";

export const checkExistingUser = async (email: string) => {
  console.log("Checking if user exists:", email.trim());
  
  const { data: existingUser, error: checkError } = await supabase
    .from('pre_registrations')
    .select('id')
    .eq('email', email.trim())
    .maybeSingle();
  
  console.log("Check for existing user:", { existingUser, checkError });
  
  if (checkError) {
    console.error("Error checking existing user:", checkError);
    throw new Error(`Errore durante la verifica dell'email: ${checkError.message}`);
  }
  
  return existingUser;
};

export const registerUser = async (data: PreRegistrationFormData) => {
  const referralCode = generateReferralCode(data.name);
  console.log("Registering new user with code:", referralCode);
  
  const { data: registration, error: registrationError } = await supabase
    .from('pre_registrations')
    .insert([{
      name: data.name.trim(),
      email: data.email.trim(),
      referrer: null,
      referral_code: referralCode,
      credits: 100, // Initial credits for first 100 registrations
    }])
    .select();
  
  console.log("Insert result:", { registration, registrationError });
  
  if (registrationError) {
    console.error("Detailed registration error:", registrationError);
    throw new Error(`Errore nella registrazione: ${registrationError.message || 'Errore sconosciuto'}`);
  }
  
  return { registration, referralCode };
};

export const sendConfirmationEmail = async (name: string, email: string, referralCode: string) => {
  try {
    const emailResponse = await supabase.functions.invoke('send-mailjet-email', {
      body: {
        type: 'pre_registration',
        name: name,
        email: email,
        referral_code: referralCode,
        subject: "Pre-registrazione a M1SSION confermata",
        to: [
          {
            email: email,
            name: name
          }
        ]
      }
    });
    
    console.log("Email sending response:", emailResponse);
    return emailResponse;
  } catch (emailError) {
    console.error("Errore nell'invio dell'email di conferma:", emailError);
    // Don't throw here - email sending is non-critical
  }
};

export const validateInviteCode = async (inviteCode: string) => {
  console.log("Validating invite code:", inviteCode.trim());
  
  const { data: referrerData, error: lookupError } = await supabase
    .from('pre_registrations')
    .select('id, email')
    .eq('referral_code', inviteCode.trim())
    .maybeSingle();
  
  console.log("Referrer lookup result:", { referrerData, lookupError });
    
  if (lookupError) {
    console.error("Error looking up referrer:", lookupError);
    throw new Error(`Errore nella ricerca del codice: ${lookupError.message}`);
  }
    
  if (!referrerData) {
    toast.error("Codice invito non valido", {
      description: "Il codice inserito non corrisponde a nessun utente."
    });
    return null;
  }
  
  return referrerData;
};

export const updateUserReferrer = async (email: string, referrerEmail: string) => {
  console.log(`Updating user ${email} with referrer ${referrerEmail}`);
  
  const { error: updateError } = await supabase
    .from('pre_registrations')
    .update({ referrer: referrerEmail })
    .eq('email', email);
  
  console.log("Update result:", { updateError });
  
  if (updateError) {
    console.error("Error updating referrer:", updateError);
    throw new Error(`Errore nell'aggiornamento del codice: ${updateError.message}`);
  }
};

export const addReferralCredits = async (referrerEmail: string) => {
  try {
    console.log("Adding credits to referrer:", referrerEmail);
    const { error: referrerUpdateError } = await supabase.rpc('add_referral_credits', {
      referrer_email: referrerEmail,
      credits_to_add: 50
    });
    
    console.log("Credit update result:", { referrerUpdateError });
    
    if (referrerUpdateError) {
      console.error("Errore nell'aggiornamento dei crediti del referrer:", referrerUpdateError);
    }
  } catch (rpcError) {
    console.error("RPC call error:", rpcError);
  }
};
