
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FormErrors {
  name: string;
  email: string;
}

export const usePreRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState("");
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: ""
  });

  // Generate a unique referral code for the user after successful registration
  useEffect(() => {
    if (isSubmitted && !userReferralCode) {
      // Generate a unique code based on name and random characters
      const generateCode = () => {
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${name.substring(0, 3).toUpperCase()}${randomStr}`;
      };
      
      setUserReferralCode(generateCode());
    }
  }, [isSubmitted, name, userReferralCode]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    const errors = {
      name: "",
      email: ""
    };
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      errors.name = "Inserisci il tuo nome";
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      errors.email = "Inserisci il tuo indirizzo email";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Inserisci un indirizzo email valido";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({
      name: "",
      email: ""
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Registration data to send to backend
      const registrationData = {
        name: name.trim(),
        email: email.trim()
      };
      
      // Check if this email is already registered
      const { data: existingUser, error: checkError } = await supabase
        .from('pre_registrations')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();
      
      if (existingUser) {
        toast.info("Sei già pre-registrato!", {
          description: "Questa email è già stata utilizzata per la pre-registrazione."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create pre-registration record without referral code initially
      const { data: registration, error: registrationError } = await supabase
        .from('pre_registrations')
        .insert([{
          name: registrationData.name,
          email: registrationData.email,
          referrer: null,
          referral_code: userReferralCode || null,
          credits: 100, // Initial credits for first 100 registrations
        }])
        .select();
      
      if (registrationError) {
        throw registrationError;
      }
      
      // If registration successful
      setIsSubmitted(true);
      toast.success("Benvenuto Agente!", {
        description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
      });
      
      // Clear form
      setName("");
      setEmail("");
      setInviteCode("");
      
      // Send confirmation email via edge function
      try {
        await supabase.functions.invoke('send-mailjet-email', {
          body: {
            type: 'pre_registration',
            name: registrationData.name,
            email: registrationData.email,
            referral_code: userReferralCode,
            subject: "Pre-registrazione a M1SSION confermata",
            to: [
              {
                email: registrationData.email,
                name: registrationData.name
              }
            ]
          }
        });
      } catch (emailError) {
        console.error("Errore nell'invio dell'email di conferma:", emailError);
        // Don't stop the process if email fails, the registration is still valid
      }
      
    } catch (error) {
      console.error("Errore nella pre-registrazione:", error);
      toast.error("Missione sospesa.", {
        description: "Qualcosa non è andato come previsto. Verifica i tuoi dati e riprova a registrarti. Entra in M1SSION!"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error("Inserisci un codice invito valido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate the invite code
      const { data: referrerData } = await supabase
        .from('pre_registrations')
        .select('id, email')
        .eq('referral_code', inviteCode.trim())
        .maybeSingle();
        
      if (!referrerData) {
        toast.error("Codice invito non valido", {
          description: "Il codice inserito non corrisponde a nessun utente."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update user's record with the referrer
      const { error: updateError } = await supabase
        .from('pre_registrations')
        .update({ referrer: referrerData.email })
        .eq('email', email);
      
      if (updateError) {
        throw updateError;
      }
      
      // If there was a referrer, update their credits
      const { error: referrerUpdateError } = await supabase.rpc('add_referral_credits', {
        referrer_email: referrerData.email,
        credits_to_add: 50
      });
      
      if (referrerUpdateError) {
        console.error("Errore nell'aggiornamento dei crediti del referrer:", referrerUpdateError);
        // Continue despite error
      }
      
      toast.success("Codice invito applicato con successo!", {
        description: "Hai assegnato 50 crediti bonus al tuo amico!"
      });
      
      // Hide the referral input after successful submission
      setShowReferralInput(false);
      
    } catch (error) {
      console.error("Errore nell'applicazione del codice invito:", error);
      toast.error("Errore nell'applicazione del codice", {
        description: "Si è verificato un problema. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyReferralCode = () => {
    if (userReferralCode) {
      navigator.clipboard.writeText(userReferralCode);
      toast.success("Codice copiato negli appunti!", {
        description: "Condividilo con i tuoi amici per guadagnare crediti."
      });
    }
  };
  
  const shareViaEmail = () => {
    const subject = "Unisciti a me su M1SSION!";
    const body = `Ciao,\n\nHo pensato che M1SSION potrebbe interessarti! È una nuova esperienza di gioco dove puoi vincere premi reali risolvendo missioni.\n\nUsa il mio codice invito per ricevere crediti bonus: ${userReferralCode}\n\nRegistrati qui: ${window.location.origin}\n\nA presto!`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return {
    name,
    setName,
    email,
    setEmail,
    inviteCode,
    setInviteCode,
    isSubmitting,
    isSubmitted,
    userReferralCode,
    showInviteOptions,
    setShowInviteOptions,
    showReferralInput,
    setShowReferralInput,
    formErrors,
    handleSubmit,
    handleInviteCodeSubmit,
    copyReferralCode,
    shareViaEmail
  };
};
