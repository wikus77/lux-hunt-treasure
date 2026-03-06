/**
 * AGENT LAB™ - Full-screen Modal
 * Coming Soon: 3D Agent Shop/Preview disabled; GLB assets removed.
 * Same modal shell (full-page, above M1SSION Agent). No logic/Buzz/Map/IAP/Push changes.
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface AgentLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentLabModal({ isOpen, onClose }: AgentLabModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            className="relative w-full h-[92vh] bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] rounded-t-[32px] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  animation: 'slideGlow 3s ease-in-out infinite',
                  width: '200%',
                  left: '-50%'
                }}
              />
            </div>

            <style>{`
              @keyframes slideGlow {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(25%); }
              }
            `}</style>

            <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
              <div className="text-center pr-12">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                    AGENT LAB™
                  </h2>
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-xs text-white/50 font-medium">
                  Select your field agent
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(92vh-120px)] px-6 py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-sm"
              >
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    border: '2px solid rgba(0, 209, 255, 0.4)',
                    boxShadow: '0 0 30px rgba(0, 209, 255, 0.2)'
                  }}
                >
                  <Sparkles className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
                  Coming Soon
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Agent Lab is under development. You will soon be able to choose and customize your field agent here.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
