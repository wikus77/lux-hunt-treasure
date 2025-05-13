import { useState } from "react";
import { toast } from "sonner";
import { FormErrors, PreRegistrationFormData } from "./types";
import { validateForm } from "./validators";
import { copyToClipboard, generateReferralCode, generateShareEmailContent } from "./referralUtils";
import { 
  checkExistingUser,
  registerUser, 
  validateInviteCode,
  updateUserReferrer,
  addReferralCredits,
  registerUserViaEdgeFunction
} from "./preRegistrationService";
import { sendAgentConfirmationEmail } from "@/services/email/agentConfirmationService";

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
    
    // Validate the form
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
      
      let registrationSuccess = false;
      let emailSent = false;
      let referralCode = "";
      
      // Try with standard method first, then edge function as fallback
      try {
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
        const result = await registerUser(formData);
        registrationSuccess = result.success;
        referralCode = result.referralCode;
        
        if (!registrationSuccess) {
          throw new Error("Errore nella registrazione dell'utente");
        }
        
        console.log("Registration completed successfully. Referral code:", referralCode);
        
      } catch (primaryError) {
        console.error("Error in primary registration method:", primaryError);
        console.log("Attempting edge function fallback...");
        
        try {
          // Secondary method: try with edge function
          const result = await registerUserViaEdgeFunction(formData);
          
          if (result.success) {
            registrationSuccess = true;
            referralCode = result.referralCode;
            console.log("Edge function registration completed. Referral code:", referralCode);
          } else {
            throw new Error("Registration failed");
          }
        } catch (secondaryError) {
          console.error("Secondary method also failed:", secondaryError);
          throw new Error(secondaryError instanceof Error ? secondaryError.message : "Registration error");
        }
      }
      
      // Only if registration was successful, send the email
      if (registrationSuccess && referralCode) {
        try {
          console.log("Attempting to send agent confirmation email with referral code:", referralCode);
          
          // Send confirmation email using agent confirmation service
          emailSent = await sendAgentConfirmationEmail({
            email: formData.email,
            name: formData.name,
            referral_code: referralCode
          });
          
          console.log("Agent confirmation email sending result:", emailSent ? "Success" : "Failed");
          
          // If email sending fails, we log but don't throw an error
          if (!emailSent) {
            console.warn("Email not sent, but registration was successful");
          }
        } catch (emailError) {
          console.error("Error sending agent confirmation email:", emailError);
          // Don't throw an error that would block the flow, just log it
          emailSent = false;
        }
        
        // Update UI state ONLY if registration was successful
        setIsSubmitted(true);
        setUserReferralCode(referralCode);
        
        // Show appropriate success message based on email sending outcome
        if (emailSent) {
          toast.success("Benvenuto Agente!", {
            description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
          });
        } else {
          // Success message but with note about email
          toast.success("Pre-iscrizione completata!", {
            description: "Ti sei registrato con successo, ma potrebbe esserci stato un problema nell'invio dell'email di conferma. Il tuo codice referral è: " + referralCode
          });
        }
        
        // Clear the form
        setName("");
        setEmail("");
        setInviteCode("");
      } else {
        throw new Error("Errore nella generazione del codice referral");
      }
    } catch (error: any) {
      console.error("Error in pre-registration:", error);
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
      // Validate invite code and get referrer data
      const referrerData = await validateInviteCode(inviteCode.trim());
      
      if (!referrerData) {
        setIsSubmitting(false);
        return;
      }
      
      // Update user record with referrer
      await updateUserReferrer(email, referrerData.email);
      
      // Add credits to referrer
      await addReferralCredits(referrerData.email);
      
      toast.success("Codice invito applicato con successo!", {
        description: "Hai assegnato 50 crediti bonus al tuo amico!"
      });
      
      // Hide referral input after successful submission
      setShowReferralInput(false);
      
    } catch (error: any) {
      console.error("Error applying invite code:", error);
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
