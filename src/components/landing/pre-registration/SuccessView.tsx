
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface SuccessViewProps {
  referralCode: string;
  agentCode?: string;
  needsEmailVerification?: boolean;
  userCredentials?: {email: string, password: string} | null;
  onReset: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  referralCode,
  agentCode,
  needsEmailVerification = false,
  userCredentials,
  onReset
}) => {
  console.log('🎊 SuccessView rendered with props:', {
    referralCode,
    agentCode,
    needsEmailVerification,
    userCredentials
  });
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
      
      {needsEmailVerification ? (
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg mb-6">
          <p className="text-cyan-400 font-semibold mb-2">📧 Verifica la tua email</p>
          <p className="text-white/70 text-sm">
            Controlla la tua email per completare la verifica, poi usa le credenziali qui sotto per accedere.
          </p>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-6">
          <p className="text-green-400 font-semibold mb-2">✅ Account creato con successo!</p>
          <p className="text-white/70 text-sm">
            Hai ricevuto <span className="text-yellow-300">100 crediti</span> e puoi ora accedere per scegliere il tuo piano.
          </p>
        </div>
      )}
      
      {/* Credenziali di accesso */}
      {userCredentials && (
        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg mb-4">
          <p className="text-purple-400 font-semibold mb-3">🔑 Le tue credenziali di accesso:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/70 text-sm">Email:</span>
              <span className="text-cyan-400 font-mono">{userCredentials.email}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userCredentials.email);
                  toast.success("Email copiata!");
                }} 
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Copia email"
              >
                <Copy size={16} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/70 text-sm">Password:</span>
              <span className="text-cyan-400 font-mono">{userCredentials.password}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userCredentials.password);
                  toast.success("Password copiata!");
                }} 
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Copia password"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          <p className="text-yellow-300 text-xs mt-3 text-center">
            ⚠️ Salva queste credenziali! Le userai per accedere all'app.
          </p>
        </div>
      )}
      
      {agentCode && (
        <div className="bg-black/30 p-4 rounded-lg mb-4">
          <p className="text-white/70 text-sm">Il tuo Codice Agente:</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xl font-mono text-cyan-400">{agentCode}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(agentCode);
                toast.success("Codice Agente copiato!");
              }} 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Copia codice"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      )}
      
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
      
      <div className="space-y-3">
        {!needsEmailVerification && userCredentials && (
          <Button 
            onClick={() => {
              console.log('🚀 ACCEDI E SCEGLI PIANO clicked');
              const url = `/login?email=${encodeURIComponent(userCredentials.email)}&redirect=choose-plan&agent_code=${agentCode}`;
              console.log('🚀 Redirecting to:', url);
              window.location.href = url;
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            🚀 Accedi e Scegli Piano
          </Button>
        )}
        
        {needsEmailVerification && (
          <Button 
            onClick={() => {
              console.log('🔑 VAI AL LOGIN clicked');
              const url = `/login?email=${encodeURIComponent(userCredentials?.email || '')}&agent_code=${agentCode}`;
              console.log('🔑 Redirecting to:', url);
              window.location.href = url;
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            🔑 Vai al Login (dopo verifica email)
          </Button>
        )}
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full border-white/20 text-white/80 hover:text-white hover:bg-white/10"
        >
          Registra un altro utente
        </Button>
      </div>
    </motion.div>
  );
};

export default SuccessView;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™