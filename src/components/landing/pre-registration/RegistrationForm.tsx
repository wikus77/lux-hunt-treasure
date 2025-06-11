
import React, { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import FormField from "./FormField";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";
import { toast } from "sonner";

interface RegistrationFormProps {
  name: string;
  email: string;
  isSubmitting: boolean;
  formErrors: {
    name: string;
    email: string;
  };
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  name,
  email,
  isSubmitting,
  formErrors,
  onNameChange,
  onEmailChange,
  onSubmit: originalSubmit
}) => {
  const [widgetRendered, setWidgetRendered] = useState(false);
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  
  const { verifyToken, isVerifying, setTurnstileToken } = useTurnstile({
    action: 'pre_registration',
    onSuccess: () => {
      console.log("Turnstile verification successful");
      setTurnstileVerified(true);
    },
    onError: (error) => {
      console.warn("Turnstile verification error, but continuing:", error);
      // Not showing toast to user to avoid interruption
      // Still allowing submission with a warning in logs
      setTurnstileVerified(true);
    }
  });
  
  // Effect to trigger widget rendering after component mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setWidgetRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for required fields
    if (!name.trim()) {
      toast.error("Nome richiesto", { description: "Inserisci il tuo nome" });
      return;
    }
    
    if (!email.trim()) {
      toast.error("Email richiesta", { description: "Inserisci la tua email" });
      return;
    }
    
    try {
      console.log("Pre-registration form submission initiated", {
        name, 
        email, 
        turnstileVerified,
        isVerifying
      });
      
      // Always proceed with form submission even if Turnstile has issues
      // The edge function will handle additional verification if needed
      originalSubmit(e);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Errore nell'invio del modulo", {
        description: "Riprova più tardi o contatta l'assistenza"
      });
    }
  };
  
  // Handler to receive token from TurnstileWidget
  const handleTurnstileVerify = (token: string) => {
    console.log("Turnstile token received:", token.substring(0, 10) + "...");
    setTurnstileToken(token);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="name"
        label="Nome"
        value={name}
        onChange={onNameChange}
        placeholder="Il tuo nome"
        disabled={isSubmitting || isVerifying}
        error={formErrors.name}
      />
      
      <FormField
        id="email"
        label="Email"
        value={email}
        onChange={onEmailChange}
        placeholder="La tua email"
        disabled={isSubmitting || isVerifying}
        error={formErrors.email}
        type="email"
      />
      
      {/* Turnstile Widget - only render after component mount but not visible to user */}
      <div className="mt-4 opacity-0 h-0 overflow-hidden">
        {widgetRendered && (
          <TurnstileWidget 
            onVerify={handleTurnstileVerify} 
            action="pre_registration"
          />
        )}
      </div>
      
      <button
        type="submit"
        className={`w-full p-3 rounded-full flex items-center justify-center ${
          isSubmitting || isVerifying 
            ? 'bg-gray-700 cursor-wait' 
            : 'bg-gradient-to-r from-[#0066FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]'
        } font-medium transition-all duration-300`}
      >
        {isSubmitting || isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {isVerifying ? "Verifica in corso..." : "Pre-registrazione in corso..."}
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Unisciti a M1SSION
          </>
        )}
      </button>
      
      <p className="text-xs text-white/40 text-center">
        Iscrivendoti accetti la nostra <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>. 
        Puoi annullare l'iscrizione in qualsiasi momento.
      </p>
    </form>
  );
};

export default RegistrationForm;
