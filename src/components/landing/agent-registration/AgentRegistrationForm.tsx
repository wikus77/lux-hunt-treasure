
import React, { useState } from "react";
import { toast } from "sonner";
import { registerAgent } from "@/services/agentRegistrationService";
import FormField from "../pre-registration/FormField";

interface AgentRegistrationFormProps {
  className?: string;
  onSuccess?: (referralCode: string) => void;
}

const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({ 
  className,
  onSuccess
}) => {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    email: ""
  });
  
  // Form validation
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: ""
    };
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      newErrors.email = "L'email è obbligatoria";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Inserisci un'email valida";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting agent registration form:", { name, email });
      
      const result = await registerAgent({
        name,
        email
      });
      
      console.log("Agent registration result:", result);
      
      if (result.success) {
        // IMPORTANT: Only show ONE toast notification here
        toast.success("Registrazione completata!", {
          description: "Sei ufficialmente un agente M1SSION. Controlla la tua email."
        });
        
        // Reset form
        setName("");
        setEmail("");
        
        // Call success callback if provided
        if (onSuccess && result.referralCode) {
          onSuccess(result.referralCode);
        }
        
        // Only show warning if email might be delayed
        if (result.error) {
          toast.warning(result.error, {
            description: "Controlla la tua casella email tra qualche minuto."
          });
        }
      } else {
        toast.error("Errore nella registrazione", {
          description: result.error || "Si è verificato un errore. Riprova più tardi."
        });
      }
    } catch (error: any) {
      console.error("Exception in agent registration form submission:", error);
      toast.error("Errore imprevisto", {
        description: "Si è verificato un errore nella registrazione. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className || ''}`}>
      <FormField
        id="name"
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Il tuo nome"
        disabled={isSubmitting}
        error={errors.name}
      />
      
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="La tua email"
        disabled={isSubmitting}
        error={errors.email}
      />
      
      <button
        type="submit"
        className={`w-full p-3 rounded-full flex items-center justify-center ${
          isSubmitting 
            ? 'bg-gray-700 cursor-wait' 
            : 'bg-gradient-to-r from-[#0066FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]'
        } font-medium transition-all duration-300`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Invio in corso...
          </>
        ) : (
          'Diventa un Agente'
        )}
      </button>
    </form>
  );
};

export default AgentRegistrationForm;
