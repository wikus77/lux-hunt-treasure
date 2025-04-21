
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

interface AgeVerificationProps {
  onVerified?: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerification = () => {
    if (onVerified) {
      onVerified();
    }
  };

  const handleLogin = () => {
    setLoginOpen(true);
  };

  return (
    <div className="max-w-sm mx-auto p-6 glass-card flex flex-col gap-4">
      {/* ... supposizione contenuto verifica età */}
      <h2 className="text-xl font-bold neon-text mb-4">Verifica la tua età</h2>
      {/* ... altri elementi della verifica */}
      
      {/* Bottone di verifica */}
      <button 
        className="bg-gradient-to-r from-projectx-blue to-projectx-pink px-4 py-2 rounded-md"
        onClick={handleVerification}
      >
        Verifica
      </button>
      
      {/* Link cliccabile per accedere */}
      <div 
        className="text-center mt-4 text-projectx-neon-blue hover:underline cursor-pointer select-none"
        onClick={handleLogin}
      >
        Hai già un account? Accedi
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default AgeVerification;
