// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FirstAccessLandingProps {
  onComplete: () => void;
}

export function FirstAccessLanding({ onComplete }: FirstAccessLandingProps) {
  const handleStartMission = () => {
    // Mark as seen and call completion handler
    localStorage.setItem('hasSeenLandingPage', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4" role="main">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        {/* Logo/Title */}
        <motion.h1 
          className="text-6xl md:text-8xl font-orbitron font-bold mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-[#00D1FF]" style={{
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl mb-12 text-[#BFA342]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ textShadow: "0 0 8px rgba(191, 163, 66, 0.4)" }}
        >
          IT IS POSSIBLE
        </motion.p>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glass-card p-6 rounded-xl border border-cyan-500/30">
            <h3 className="text-xl font-orbitron font-bold mb-3 text-cyan-400">🎯 Missioni</h3>
            <p className="text-white/80">Completa cacce al tesoro complesse nel mondo reale</p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-cyan-500/30">
            <h3 className="text-xl font-orbitron font-bold mb-3 text-cyan-400">🗺️ Esplorazione</h3>
            <p className="text-white/80">Scopri indizi nascosti con geolocalizzazione avanzata</p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-cyan-500/30">
            <h3 className="text-xl font-orbitron font-bold mb-3 text-cyan-400">🏆 Competizione</h3>
            <p className="text-white/80">Compete con agenti di tutto il mondo</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleStartMission}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xl font-orbitron font-bold py-4 px-12 rounded-xl neon-button-cyan"
            size="lg"
            aria-label="Inizia la tua missione in M1SSION"
          >
            🚀 INIZIA LA MISSIONE
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-16 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™</p>
        </motion.div>
      </motion.div>
    </div>
  );
}