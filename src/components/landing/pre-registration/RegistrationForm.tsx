
import React, { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import FormField from "./FormField";
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
        email
      });
      
      // Proceed with form submission - no CAPTCHA needed
      originalSubmit(e);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Errore nell'invio del modulo", {
        description: "Riprova più tardi o contatta l'assistenza"
      });
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
        disabled={isSubmitting}
        error={formErrors.name}
      />
      
      <FormField
        id="email"
        label="Email"
        value={email}
        onChange={onEmailChange}
        placeholder="La tua email"
        disabled={isSubmitting}
        error={formErrors.email}
        type="email"
      />
      
      <button
        type="submit"
        className={`w-full p-3 rounded-full flex items-center justify-center ${
          isSubmitting
            ? 'bg-gray-700 cursor-wait' 
            : 'bg-gradient-to-r from-[#0066FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]'
        } font-medium transition-all duration-300`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Pre-registrazione in corso...
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
