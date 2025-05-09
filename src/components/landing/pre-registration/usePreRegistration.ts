
import { useState } from "react";
import { toast } from "sonner";
import { FormErrors, PreRegistrationFormData, PreRegistrationState } from "./types";
import { validateForm } from "./validators";
import { copyToClipboard, generateReferralCode, generateShareEmailContent } from "./referralUtils";
import { 
  checkExistingUser,
  registerUser, 
  sendConfirmationEmail, 
  validateInviteCode,
  updateUserReferrer,
  addReferralCredits
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
    
    // Clear previous errors
    setFormErrors({ name: "", email: "" });
    
    // Validate form
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
      // Log input values for debugging
      console.log("Submitting pre-registration with:", formData);
      
      // Check if this email is already registered
      const existingUser = await checkExistingUser(formData.email);
      
      if (existingUser) {
        toast.info("Sei già pre-registrato!", {
          description: "Questa email è già stata utilizzata per la pre-registrazione."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Register the user
      const { referralCode } = await registerUser(formData);
      
      // Update UI state
      setIsSubmitted(true);
      setUserReferralCode(referralCode);
      
      // Show success message
      toast.success("Benvenuto Agente!", {
        description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
      });
      
      // Clear form
      setName("");
      setEmail("");
      setInviteCode("");
      
      // Send confirmation email
      await sendConfirmationEmail(formData.name, formData.email, referralCode);
      
    } catch (error: any) {
      console.error("Errore nella pre-registrazione:", error);
      toast.error("Missione sospesa.", {
        description: error instanceof Error ? error.message : "Qualcosa non è andato come previsto. Verifica i tuoi dati e riprova a registrarti. Entra in M1SSION!"
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
      // Validate the invite code and get referrer data
      const referrerData = await validateInviteCode(inviteCode.trim());
      
      if (!referrerData) {
        setIsSubmitting(false);
        return;
      }
      
      // Update user's record with the referrer
      await updateUserReferrer(email, referrerData.email);
      
      // Add credits to referrer
      await addReferralCredits(referrerData.email);
      
      toast.success("Codice invito applicato con successo!", {
        description: "Hai assegnato 50 crediti bonus al tuo amico!"
      });
      
      // Hide the referral input after successful submission
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
