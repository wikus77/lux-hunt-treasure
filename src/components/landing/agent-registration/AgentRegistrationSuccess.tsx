
import React from "react";
import { Copy, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentRegistrationSuccessProps {
  referralCode: string;
}

const AgentRegistrationSuccess: React.FC<AgentRegistrationSuccessProps> = ({ referralCode }) => {
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
      toast.info("Codice copiato", {
        description: "Il codice è stato copiato negli appunti"
      });
    }
  };
  
  const handleShareInvite = () => {
    const shareText = `Hey, unisciti a me su M1SSION! Usa il mio codice invito: ${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Invito a M1SSION',
        text: shareText,
        url: window.location.origin
      })
      .catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(shareText);
      toast.info("Testo di invito copiato", {
        description: "Condividi il messaggio con i tuoi amici"
      });
    }
  };
  
  // Il toast di successo è già mostrato dal componente parent (AgentRegistrationContainer)
  // Ho rimosso qualsiasi duplicazione di toast qui
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Registrazione Completata
      </h3>
      
      <p className="text-gray-300 mb-6">
        Benvenuto in M1SSION. Controlla la tua email per confermare la registrazione.
      </p>
      
      <div className="bg-gray-800/60 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-400 mb-1">Il tuo codice invito:</div>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xl text-cyan-400">{referralCode}</span>
          <button 
            onClick={handleCopyCode}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
      
      <Button
        onClick={handleShareInvite}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        <Share2 size={16} className="mr-2" />
        Invita i tuoi amici
      </Button>
    </motion.div>
  );
};

export default AgentRegistrationSuccess;
