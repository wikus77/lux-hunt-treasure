
import { useState } from "react";
import { toast } from "sonner";
import { FormErrors, PreRegistrationFormData } from "./types";
import { validateForm } from "./validators";
import { copyToClipboard, generateReferralCode, generateShareEmailContent } from "./referralUtils";
import { 
  checkExistingUser,
  registerUser, 
  sendConfirmationEmail, 
  validateInviteCode,
  updateUserReferrer,
  addReferralCredits,
  registerUserViaEdgeFunction
} from "./preRegistrationService";

export const usePreRegistration = () => {
  // Form data state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState("");
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  
  // Validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: ""
  });

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pulisci gli errori precedenti
    setFormErrors({ name: "", email: "" });
    
    // Valida il modulo
    const formData: PreRegistrationFormData = {
      name: name.trim(),
      email: email.trim()
    };
    
    const { isValid, errors } = validateForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log dei valori di input per il debug
      console.log("Invio pre-registrazione con:", formData);
      
      // Prova prima con il metodo standard, poi con l'edge function come fallback
      try {
        // Controlla se questa email è già registrata
        const existingUser = await checkExistingUser(formData.email);
        
        if (existingUser) {
          toast.info("Sei già pre-registrato!", {
            description: "Questa email è già stata utilizzata per la pre-registrazione."
          });
          setIsSubmitting(false);
          return;
        }
        
        // Registra l'utente
        const { referralCode } = await registerUser(formData);
        
        // Aggiorna lo stato dell'interfaccia
        setIsSubmitted(true);
        setUserReferralCode(referralCode);
        
        // Mostra il messaggio di successo
        toast.success("Benvenuto Agente!", {
          description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
        });
        
        // Pulisci il modulo
        setName("");
        setEmail("");
        setInviteCode("");
        
        // Invia l'email di conferma CON il referral code
        const emailSent = await sendConfirmationEmail(formData.name, formData.email, referralCode);
        console.log("Email confirmation status:", emailSent ? "sent" : "failed");
        
        if (!emailSent) {
          console.warn("Email sending failed, trying again...");
          // Retry once if failed
          setTimeout(async () => {
            const retryResult = await sendConfirmationEmail(formData.name, formData.email, referralCode);
            console.log("Email confirmation retry status:", retryResult ? "sent" : "failed again");
          }, 2000);
        }
        
      } catch (primaryError) {
        console.error("Errore nel metodo primario di registrazione:", primaryError);
        console.log("Tentativo con edge function come fallback...");
        
        try {
          // Metodo secondario: prova con l'edge function
          const result = await registerUserViaEdgeFunction(formData);
          
          if (result.success) {
            // Aggiorna lo stato dell'interfaccia
            setIsSubmitted(true);
            setUserReferralCode(result.referralCode);
            
            // Mostra il messaggio di successo
            toast.success("Benvenuto Agente!", {
              description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
            });
            
            // Pulisci il modulo
            setName("");
            setEmail("");
            setInviteCode("");
            
            // Invia l'email di conferma CON il referral code
            const emailSent = await sendConfirmationEmail(formData.name, formData.email, result.referralCode);
            console.log("Email confirmation status (edge function):", emailSent ? "sent" : "failed");
            
            if (!emailSent) {
              console.warn("Email sending failed via edge function, trying once more...");
              // Retry once if failed
              setTimeout(async () => {
                const retryResult = await sendConfirmationEmail(formData.name, formData.email, result.referralCode);
                console.log("Email confirmation retry status:", retryResult ? "sent" : "failed again");
              }, 2000);
            }
          } else {
            throw new Error("La registrazione non è andata a buon fine");
          }
        } catch (secondaryError) {
          console.error("Anche il metodo secondario è fallito:", secondaryError);
          throw new Error(secondaryError instanceof Error ? secondaryError.message : "Errore nella registrazione");
        }
      }
    } catch (error: any) {
      console.error("Errore nella pre-registrazione:", error);
      toast.error("Missione sospesa.", {
        description: error instanceof Error 
          ? error.message 
          : "Qualcosa non è andato come previsto. Verifica i tuoi dati e riprova a registrarti. Entra in M1SSION!"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Invite code submission handler
  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error("Inserisci un codice invito valido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Valida il codice invito e ottieni i dati del referrer
      const referrerData = await validateInviteCode(inviteCode.trim());
      
      if (!referrerData) {
        setIsSubmitting(false);
        return;
      }
      
      // Aggiorna il record dell'utente con il referrer
      await updateUserReferrer(email, referrerData.email);
      
      // Aggiungi crediti al referrer
      await addReferralCredits(referrerData.email);
      
      toast.success("Codice invito applicato con successo!", {
        description: "Hai assegnato 50 crediti bonus al tuo amico!"
      });
      
      // Nascondi l'input del referral dopo l'invio riuscito
      setShowReferralInput(false);
      
    } catch (error: any) {
      console.error("Errore nell'applicazione del codice invito:", error);
      toast.error("Errore nell'applicazione del codice", {
        description: error instanceof Error ? error.message : "Si è verificato un problema. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper functions for UI interactions
  const copyReferralCode = () => {
    if (userReferralCode) {
      copyToClipboard(userReferralCode);
    }
  };
  
  const shareViaEmail = () => {
    const { subject, body } = generateShareEmailContent(userReferralCode);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return {
    // Form data
    name,
    setName,
    email,
    setEmail,
    inviteCode,
    setInviteCode,
    
    // UI state
    isSubmitting,
    isSubmitted,
    userReferralCode,
    showInviteOptions,
    setShowInviteOptions,
    showReferralInput,
    setShowReferralInput,
    formErrors,
    
    // Form handlers
    handleSubmit,
    handleInviteCodeSubmit,
    
    // Helper functions
    copyReferralCode,
    shareViaEmail
  };
};
