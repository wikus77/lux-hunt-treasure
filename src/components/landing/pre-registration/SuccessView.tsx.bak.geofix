
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface SuccessViewProps {
  referralCode: string;
  onReset: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  referralCode,
  onReset
}) => {
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Codice referral copiato!");
  };

  return (
    <motion.div 
      className="bg-white/5 border border-[#00E5FF]/30 p-6 rounded-lg text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 mx-auto bg-[#00E5FF]/10 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="text-[#00E5FF] h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Pre-registrazione completata!</h3>
      <p className="text-white/70 mb-6">
        Hai ricevuto <span className="text-yellow-300">100 crediti</span> da utilizzare per le missioni al lancio.
        Invita i tuoi amici per guadagnare crediti extra!
      </p>
      
      <div className="bg-black/30 p-4 rounded-lg mb-6">
        <p className="text-white/70 text-sm">Il tuo codice di invito:</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xl font-mono text-yellow-300">{referralCode}</span>
          <button 
            onClick={handleCopyReferralCode} 
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Copia codice"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
      
      <Button 
        onClick={onReset}
        variant="outline"
        className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
      >
        Registra un altro utente
      </Button>
    </motion.div>
  );
};

export default SuccessView;
