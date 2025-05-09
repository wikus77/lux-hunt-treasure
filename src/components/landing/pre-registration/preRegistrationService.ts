
import { supabase } from "@/integrations/supabase/client";
import { PreRegistrationFormData } from './types';
import { generateReferralCode } from './referralUtils';
import { toast } from "sonner";

export const checkExistingUser = async (email: string) => {
  try {
    console.log("Verificando se l'utente esiste:", email.trim());
    
    const { data: existingUser, error: checkError } = await supabase
      .from('pre_registrations')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle();
    
    console.log("Risultato verifica utente esistente:", { existingUser, checkError });
    
    if (checkError) {
      console.error("Errore durante la verifica dell'utente esistente:", checkError);
      throw new Error(`Errore durante la verifica dell'email: ${checkError.message}`);
    }
    
    return existingUser;
  } catch (error) {
    console.error("Errore nella funzione checkExistingUser:", error);
    throw error; // Rilanciamo l'errore per gestirlo a livello superiore
  }
};

export const registerUser = async (data: PreRegistrationFormData) => {
  try {
    const referralCode = generateReferralCode(data.name);
    console.log("Registrando nuovo utente con codice:", referralCode);
    
    const { data: registration, error: registrationError } = await supabase
      .from('pre_registrations')
      .insert([{
        name: data.name.trim(),
        email: data.email.trim(),
        referrer: null,
        referral_code: referralCode,
        credits: 100, // Crediti iniziali per le prime 100 registrazioni
      }])
      .select();
    
    console.log("Risultato inserimento:", { registration, registrationError });
    
    if (registrationError) {
      console.error("Errore dettagliato nella registrazione:", registrationError);
      // Gestione errori più dettagliata
      if (registrationError.code === '23505') {
        throw new Error("Questa email è già stata registrata. Prova con un'altra email.");
      } else {
        throw new Error(`Errore nella registrazione: ${registrationError.message || 'Errore sconosciuto'}`);
      }
    }
    
    if (!registration || registration.length === 0) {
      throw new Error("Nessun dato restituito dalla registrazione, ma nessun errore segnalato");
    }
    
    return { registration, referralCode };
  } catch (error) {
    console.error("Errore nella funzione registerUser:", error);
    throw error; // Rilanciamo l'errore per gestirlo a livello superiore
  }
};

export const sendConfirmationEmail = async (name: string, email: string, referralCode: string) => {
  try {
    console.log("Invio email di conferma a:", email);
    
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
    
    console.log("Risposta invio email:", emailResponse);
    
    if (emailResponse.error) {
      console.error("Errore nell'invio dell'email di conferma:", emailResponse.error);
      // Non lanciamo un errore qui perché l'invio dell'email è un'operazione non critica
      // Mostriamo solo un toast di avviso
      toast.warning("L'email di conferma potrebbe non essere stata inviata", {
        description: "La tua registrazione è comunque completa"
      });
    }
    
    return emailResponse;
  } catch (emailError) {
    console.error("Errore nell'invio dell'email di conferma:", emailError);
    // Non lanciamo un errore qui perché l'invio dell'email è un'operazione non critica
  }
};

// Funzione alternativa di registrazione che utilizza l'edge function
export const registerUserViaEdgeFunction = async (data: PreRegistrationFormData) => {
  try {
    console.log("Tentativo di registrazione tramite edge function:", data);
    
    const response = await supabase.functions.invoke('handle-pre-registration', {
      body: {
        name: data.name.trim(),
        email: data.email.trim(),
      }
    });
    
    console.log("Risposta dall'edge function:", response);
    
    if (response.error || !response.data.success) {
      const errorMessage = response.error?.message || 
                          (response.data.alreadyRegistered ? 
                           "Questa email è già stata registrata" : 
                           response.data.message || "Errore nella registrazione");
      
      throw new Error(errorMessage);
    }
    
    return { 
      referralCode: response.data.referral_code,
      success: true
    };
  } catch (error) {
    console.error("Errore nella funzione registerUserViaEdgeFunction:", error);
    throw error;
  }
};

export const validateInviteCode = async (inviteCode: string) => {
  try {
    console.log("Validazione codice invito:", inviteCode.trim());
    
    const { data: referrerData, error: lookupError } = await supabase
      .from('pre_registrations')
      .select('id, email')
      .eq('referral_code', inviteCode.trim())
      .maybeSingle();
    
    console.log("Risultato ricerca referrer:", { referrerData, lookupError });
      
    if (lookupError) {
      console.error("Errore nella ricerca del referrer:", lookupError);
      throw new Error(`Errore nella ricerca del codice: ${lookupError.message}`);
    }
      
    if (!referrerData) {
      toast.error("Codice invito non valido", {
        description: "Il codice inserito non corrisponde a nessun utente."
      });
      return null;
    }
    
    return referrerData;
  } catch (error) {
    console.error("Errore nella funzione validateInviteCode:", error);
    throw error;
  }
};

export const updateUserReferrer = async (email: string, referrerEmail: string) => {
  try {
    console.log(`Aggiornamento utente ${email} con referrer ${referrerEmail}`);
    
    const { error: updateError } = await supabase
      .from('pre_registrations')
      .update({ referrer: referrerEmail })
      .eq('email', email);
    
    console.log("Risultato aggiornamento:", { updateError });
    
    if (updateError) {
      console.error("Errore nell'aggiornamento del referrer:", updateError);
      throw new Error(`Errore nell'aggiornamento del codice: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Errore nella funzione updateUserReferrer:", error);
    throw error;
  }
};

export const addReferralCredits = async (referrerEmail: string) => {
  try {
    console.log("Aggiunta crediti al referrer:", referrerEmail);
    const { error: referrerUpdateError } = await supabase.rpc('add_referral_credits', {
      referrer_email: referrerEmail,
      credits_to_add: 50
    });
    
    console.log("Risultato aggiornamento crediti:", { referrerUpdateError });
    
    if (referrerUpdateError) {
      console.error("Errore nell'aggiornamento dei crediti del referrer:", referrerUpdateError);
      // Non lanciamo un errore qui perché è un'operazione non critica
    }
  } catch (rpcError) {
    console.error("Errore nella chiamata RPC:", rpcError);
    // Non lanciamo un errore qui perché è un'operazione non critica
  }
};
