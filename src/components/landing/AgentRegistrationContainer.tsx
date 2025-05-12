
import React, { useState } from "react";
import AgentRegistrationForm from "./agent-registration/AgentRegistrationForm";
import AgentRegistrationSuccess from "./agent-registration/AgentRegistrationSuccess";

interface AgentRegistrationContainerProps {
  className?: string;
}

const AgentRegistrationContainer: React.FC<AgentRegistrationContainerProps> = ({ className }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  
  const handleRegistrationSuccess = (code: string) => {
    setReferralCode(code);
    setIsSubmitted(true);
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
