
import React, { useState } from "react";
import { toast } from "sonner";
import AgentRegistrationForm from "./agent-registration/AgentRegistrationForm";
import AgentRegistrationSuccess from "./agent-registration/AgentRegistrationSuccess";

interface AgentRegistrationContainerProps {
  className?: string;
}

const AgentRegistrationContainer: React.FC<AgentRegistrationContainerProps> = ({ className }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  
  // Questo è l'UNICO punto in cui dovrebbe apparire la notifica di successo
  const handleRegistrationSuccess = (code: string) => {
    // Log per il debugging del flusso dei toast
    console.log("Registration success handled in AgentRegistrationContainer - showing toast notification");
    
    // UNICO punto di notifica - questo è l'UNICO posto dove il toast di successo dovrebbe apparire
    toast.success("Registrazione completata!", {
      description: "Sei ufficialmente un agente M1SSION™. Controlla la tua email."
    });
    
    // Aggiorna lo stato per mostrare la vista di successo
    setReferralCode(code);
    setIsSubmitted(true);
    
    // Log di successo per il debugging
    console.log("Registration success handled in AgentRegistrationContainer");
  };
  
  return (
    <div className={`max-w-md mx-auto ${className || ''}`}>
      <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-800">
        {!isSubmitted ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Diventa un Agente
            </h2>
            <AgentRegistrationForm onSuccess={handleRegistrationSuccess} />
          </>
        ) : (
          <AgentRegistrationSuccess referralCode={referralCode} />
        )}
      </div>
    </div>
  );
};

export default AgentRegistrationContainer;
