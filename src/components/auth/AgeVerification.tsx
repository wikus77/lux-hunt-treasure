
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginModal } from "./LoginModal";

interface AgeVerificationProps {
  onVerified?: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerification = () => {
    if (!birthdate) {
      setError("Inserisci la tua data di nascita");
      return;
    }

    const today = new Date();
    const birth = new Date(birthdate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Calcola l'età corretta considerando anche mese e giorno
    const isAdult = age > 18 || (age === 18 && monthDiff >= 0 && today.getDate() >= birth.getDate());

    if (!isAdult) {
      setError("Devi avere almeno 18 anni per accedere a questo sito");
      return;
    }

    setError("");
    if (onVerified) {
      onVerified();
    }
  };

  const handleLogin = () => {
    setLoginOpen(true);
  };

  return (
    <div className="max-w-sm mx-auto p-6 glass-card flex flex-col gap-4">
      <h2 className="text-xl font-bold neon-text mb-4">Verifica la tua età</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Questo sito può essere utilizzato solo da maggiorenni.
        Inserisci la tua data di nascita per continuare.
      </p>
      
      <div className="mb-4">
        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-300 mb-1">
          Data di nascita
        </label>
        <input
          type="date"
          id="birthdate"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full p-2 rounded-md bg-projectx-deep-blue border border-projectx-neon-blue"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      
      <button 
        className="bg-gradient-to-r from-projectx-blue to-projectx-pink px-4 py-2 rounded-md"
        onClick={handleVerification}
      >
        Verifica
      </button>
      
      <div 
        className="text-center mt-4 text-projectx-neon-blue hover:underline cursor-pointer select-none"
        onClick={handleLogin}
      >
        Hai già un account? Accedi
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => {}} />
    </div>
  );
};

export default AgeVerification;
