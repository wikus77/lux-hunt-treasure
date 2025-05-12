
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [useBypass, setUseBypass] = useState(false);
  
  const { verifyToken, isVerifying } = useTurnstile({
    action: 'pre_registration',
    onError: (error) => {
      console.error("Turnstile verification failed:", error);
      toast.error("Verifica di sicurezza fallita", {
        description: error
      });
    }
  });
  
  // Effetto per applicare bypass automaticamente in ambiente di sviluppo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log("Development environment detected, bypassing Turnstile");
      setUseBypass(true);
      setTurnstileToken("DEVELOPMENT_BYPASS_TOKEN");
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission attempted");
    
    // In modalità sviluppo o con bypass, procedi sempre
    if (useBypass) {
      console.log("Using development bypass for Turnstile");
      originalSubmit(e);
      return;
    }
    
    if (!turnstileToken) {
      console.log("No turnstile token available");
      toast.error("Completa la verifica di sicurezza");
      return;
    }
    
    try {
      // Verify turnstile token before form submission
      console.log("Verifying turnstile token...");
      const isValid = await verifyToken(turnstileToken);
      console.log("Turnstile verification result:", isValid);
      if (isValid) {
        // Proceed with the original form submission
        originalSubmit(e);
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
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
      
      {/* Turnstile Widget, solo se non in modalità bypass */}
      {!useBypass && (
        <div className="mt-4">
          <TurnstileWidget 
            onVerify={setTurnstileToken} 
            action="pre_registration"
          />
          <div className="text-xs text-white/40 mt-1">Completa la verifica di sicurezza</div>
        </div>
      )}
      
      <button
        type="submit"
        className={`w-full p-3 rounded-full flex items-center justify-center ${
          (isSubmitting || isVerifying)
            ? 'bg-gray-700 opacity-90' 
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
