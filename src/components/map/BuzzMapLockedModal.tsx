// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// CLONE ESATTO del modal BUZZ da BuzzPage.tsx - NESSUNA MODIFICA STRUTTURALE

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Rocket, AlertCircle } from 'lucide-react';

interface BuzzMapLockedModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const BuzzMapLockedModal: React.FC<BuzzMapLockedModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleGoHome = () => {
    window.location.href = '/home';
  };

  // Don't render anything until mounted (client-side only)
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ 
            paddingTop: 'calc(119px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          }}
        >
          <motion.div 
            className="text-center p-8 mx-4 rounded-3xl max-w-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0,30,60,0.95) 0%, rgba(0,15,30,0.98) 100%)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              boxShadow: '0 0 60px rgba(0, 209, 255, 0.2), inset 0 0 30px rgba(0, 209, 255, 0.05)',
            }}
          >
            {/* Lock Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,100,100,0.2) 0%, rgba(255,50,50,0.1) 100%)',
                  border: '2px solid rgba(255,100,100,0.4)',
                }}
              >
                <Lock className="w-10 h-10 text-red-400" />
              </div>
            </motion.div>
            
            {/* Title */}
            <h2 className="text-2xl font-orbitron font-bold text-white mb-3">
              MISSIONE NON AVVIATA
            </h2>
            
            {/* Description */}
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Per utilizzare <span className="text-cyan-400 font-semibold">BUZZ</span> devi prima avviare la missione del mese.
              <br />
              Torna alla Home e premi <span className="text-cyan-400 font-semibold">START M1SSION</span>.
            </p>
            
            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                boxShadow: '0 0 30px rgba(0, 209, 255, 0.4)',
              }}
            >
              <Rocket className="w-5 h-5" />
              VAI ALLA HOME
            </motion.button>
            
            {/* Info */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Il BUZZ sarà disponibile dopo l'avvio</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal to document.body
  return createPortal(modalContent, document.body);
};

export default BuzzMapLockedModal;
