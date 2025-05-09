
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface SuccessViewProps {
  userReferralCode: string;
  showInviteOptions: boolean;
  showReferralInput: boolean;
  inviteCode: string;
  isSubmitting: boolean;
  onInviteCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyReferralCode: () => void;
  onInviteOptionToggle: () => void;
  onShowReferralInput: () => void;
  onShareViaEmail: () => void;
  onInviteCodeSubmit: (e: React.FormEvent) => void;
  onInviteOptionsBack: () => void;
  onReferralInputCancel: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  userReferralCode,
  showInviteOptions,
  showReferralInput,
  inviteCode,
  isSubmitting,
  onInviteCodeChange,
  onCopyReferralCode,
  onInviteOptionToggle,
  onShowReferralInput,
  onShareViaEmail,
  onInviteCodeSubmit,
  onInviteOptionsBack,
  onReferralInputCancel
}) => {
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
          <span className="text-xl font-mono text-yellow-300">{userReferralCode}</span>
          <button 
            onClick={onCopyReferralCode} 
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Copia codice"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
      
      {!showInviteOptions ? (
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onInviteOptionToggle} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2 rounded-full flex items-center gap-2 mx-auto"
          >
            <UserPlus size={18} />
            Invita un amico
          </Button>
          
          <Button
            onClick={onShowReferralInput}
            variant="outline"
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          >
            Hai un codice invito?
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-white text-sm mb-2">Condividi il tuo codice:</h4>
          <Button 
            onClick={onShareViaEmail} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2 rounded-full flex items-center gap-2 w-full"
          >
            <Mail size={18} />
            Invita via Email
          </Button>
          
          <Button
            onClick={onInviteOptionsBack}
            variant="outline"
            className="w-full border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          >
            Torna indietro
          </Button>
        </div>
      )}
      
      {/* Referral code input - shown only after clicking "Hai un codice invito?" */}
      {showReferralInput && (
        <motion.form 
          onSubmit={onInviteCodeSubmit}
          className="mt-6 space-y-4 border-t border-white/10 pt-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-white text-sm mb-2">Inserisci il codice invito:</h4>
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={onInviteCodeChange}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
              placeholder="Codice invito"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
              ) : (
                "Applica codice"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
              onClick={onReferralInputCancel}
            >
              Annulla
            </Button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default SuccessView;
