
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentConfirmationProps {
  email: string;
  name?: string;
  referral_code: string;
}

/**
 * Invia un'email di conferma all'agente dopo la registrazione
 */
export const sendAgentConfirmationEmail = async (props: AgentConfirmationProps): Promise<boolean> => {
  const { email, name, referral_code } = props;
  
  if (!email || !referral_code) {
    console.error("Parametri mancanti nell'invio email:", { email, referral_code });
    toast.error("Impossibile inviare l'email di conferma", {
      description: "Dati incompleti per l'invio dell'email."
    });
    return false;
  }
  
  try {
    console.log("Invio email di conferma all'agente:", { email, name, referral_code });
    
    // Tentativo principale con edge function
    const { data, error } = await supabase.functions.invoke('send-agent-confirmation', {
      body: {
        email: email.trim(),
        name: name?.trim() || "",
        referral_code: referral_code
      }
    });
    
    if (error) {
      console.error("Errore nell'invio dell'email di conferma:", error);
      
      // Fallback con altra funzione se disponibile
      try {
        console.log("Tentativo di fallback per invio email...");
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('send-mailjet-email', {
          body: {
            type: 'welcome',
            to: [{ email, name: name || "" }],
            subject: "Benvenuto in M1SSION",
            variables: {
              referral_code,
              name: name || "Agente"
            },
            templateId: 6974914
          }
        });
        
        if (fallbackError) {
          console.error("Anche il fallback è fallito:", fallbackError);
          throw fallbackError;
        }
        
        if (!fallbackData.success) {
          console.error("Fallback email non riuscito:", fallbackData);
          throw new Error(fallbackData.message || "Invio email di fallback non riuscito");
        }
        
        console.log("Email inviata con successo via fallback");
        return true;
      } catch (fallbackError) {
        console.error("Tutti i tentativi di invio email falliti:", fallbackError);
        toast.error("Impossibile inviare l'email di conferma", {
          description: "Si è verificato un errore durante l'invio. Riprova più tardi."
        });
        return false;
      }
    }
    
    if (!data.success) {
      console.error("L'invio dell'email non è andato a buon fine:", data);
      toast.error("Impossibile inviare l'email di conferma", {
        description: data.message || "Si è verificato un errore imprevisto"
      });
      return false;
    }
    
    console.log("Email di conferma inviata con successo:", data);
    return true;
  } catch (error) {
    console.error("Eccezione durante l'invio dell'email di conferma:", error);
    toast.error("Errore di sistema", {
      description: "Si è verificato un errore imprevisto. I nostri tecnici sono stati avvisati."
    });
    return false;
  }
};

/**
 * Funzione di test per verificare l'invio dell'email (per debug)
 * @deprecated Utilizzare solo per test, non in produzione
 */
export const _testSendAgentConfirmation = async (): Promise<void> => {
  const testEmail = "test@example.com";
  const testReferralCode = "TEST123";
  
  const success = await sendAgentConfirmationEmail({
    email: testEmail,
    name: "Test User",
    referral_code: testReferralCode
  });
  
  if (success) {
    toast.success("Email di test inviata con successo", {
      description: `Controlla ${testEmail}`
    });
  }
};

// Esporta la funzione per aggiornare l'index di email services
export * from './agentConfirmationService';
