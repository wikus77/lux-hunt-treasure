// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import './qrwin.css';

interface VictoryModalProps {
  onEnterHunt: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ onEnterHunt }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop with particles */}
      <motion.div
        className="absolute inset-0 qrwin-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Floating particles */}
      <div className="qrwin-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="qrwin-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Card - M1SSION Glass Style */}
      <motion.div
        className="relative w-full max-w-md z-10"
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: 'spring', 
          duration: 0.6,
          delay: 0.2
        }}
      >
        {/* Glow effect behind card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-pulse" />
        
        {/* Card Container */}
        <div 
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(19, 21, 36, 0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: `
              0 0 60px rgba(255, 215, 0, 0.2),
              0 0 100px rgba(0, 255, 255, 0.1),
              inset 0 0 30px rgba(255, 215, 0, 0.05)
            `
          }}
        >
          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 qrwin-corner-accent" />
          <div className="absolute top-0 right-0 w-16 h-16 qrwin-corner-accent" style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute bottom-0 left-0 w-16 h-16 qrwin-corner-accent" style={{ transform: 'scaleY(-1)' }} />
          <div className="absolute bottom-0 right-0 w-16 h-16 qrwin-corner-accent" style={{ transform: 'scale(-1)' }} />

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Trophy Icon with Glow */}
            <motion.div 
              className="mb-6 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                delay: 0.4
              }}
            >
              <div className="qrwin-trophy-container">
                <div className="qrwin-trophy-glow" />
                <Trophy className="w-16 h-16 text-yellow-400 relative z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-3 qrwin-modal-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              SEI DENTRO
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              className="text-lg text-cyan-400 font-semibold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
              }}
            >
              Accesso M1SSION™ Attivo
            </motion.p>

            {/* Description */}
            <motion.p 
              className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Il tuo gratta e vinci è stato verificato. 
              Ora puoi partecipare alla caccia e competere per i premi esclusivi.
            </motion.p>

            {/* Prize Hint */}
            <motion.div
              className="mb-8 py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-yellow-400 text-xs font-medium">
                🏆 PREMI IN PALIO: Rolex, Lamborghini, Hermès e molto altro
              </p>
            </motion.div>

            {/* CTA Button - ENTER THE HUNT */}
            <motion.button
              onClick={onEnterHunt}
              className="qrwin-enter-button group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-bold">
                ENTER THE HUNT
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="qrwin-button-shine" />
            </motion.button>

            {/* Legal Note */}
            <motion.p 
              className="mt-6 text-[10px] text-white/30 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Non è un gioco d'azzardo. Nessun premio in denaro.
              <br />
              Accesso digitale gratuito e temporaneo.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VictoryModal;

