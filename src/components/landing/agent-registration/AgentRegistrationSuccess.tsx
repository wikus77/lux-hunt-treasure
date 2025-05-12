
import React from "react";
import { CopyIcon, Share } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard, generateShareEmailContent } from "../pre-registration/referralUtils";

interface AgentRegistrationSuccessProps {
  name?: string;
  referralCode: string;
  className?: string;
}

const AgentRegistrationSuccess: React.FC<AgentRegistrationSuccessProps> = ({ 
  name, 
  referralCode,
  className 
}) => {
  // Copy referral code to clipboard
  const handleCopyCode = () => {
    copyToClipboard(referralCode);
    toast.success("Codice copiato!", {
      description: "Il codice è stato copiato negli appunti."
    });
  };
  
  // Share via email
  const handleShareViaEmail = () => {
    const { subject, body } = generateShareEmailContent(referralCode);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-white">
          {name ? `Congratulazioni, ${name}!` : 'Congratulazioni!'}
        </h2>
        
        <p className="mt-2 text-white/80">
          Sei ufficialmente un agente M1SSION. Abbiamo inviato un'email di conferma con tutte le informazioni.
        </p>
      </div>
      
      <div className="bg-gray-900/50 p-4 rounded-lg">
        <p className="text-sm text-white/70 mb-2">Il tuo codice referral:</p>
        <div className="flex items-center">
          <span className="flex-1 font-mono text-xl font-bold text-cyan-400 bg-gray-800/50 p-2 rounded">
            {referralCode}
          </span>
          <button 
            onClick={handleCopyCode}
            className="ml-2 p-2 rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            aria-label="Copia codice"
          >
            <CopyIcon className="h-5 w-5 text-cyan-400" />
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="text-white font-medium mb-3">Condividi con i tuoi amici</h3>
        <p className="text-sm text-white/70 mb-4">
          Per ogni amico che si iscrive con il tuo codice referral, entrambi riceverete 50 crediti bonus!
        </p>
        <button
          onClick={handleShareViaEmail}
          className="flex items-center justify-center w-full p-3 bg-gradient-to-r from-[#0077FF] to-[#00E5FF] text-black font-medium rounded-lg hover:shadow-[0_0_10px_rgba(0,119,255,0.4)] transition-all duration-300"
        >
          <Share className="h-5 w-5 mr-2" />
          Invita via Email
        </button>
      </div>
    </div>
  );
};

export default AgentRegistrationSuccess;
