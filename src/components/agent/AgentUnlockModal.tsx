/**
 * AGENT UNLOCK MODAL - Full-Screen Reveal (no 3D/GLB)
 * Shows agent name and "Unlocked!" message. Same UX, no model loading.
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { AgentDefinition, RARITY_STYLES } from './agentCatalog';

interface AgentUnlockModalProps {
  isOpen: boolean;
  agent: AgentDefinition | null;
  agentCode: string;
  onClose: () => void;
  onConfirmSetActive: () => void;
}

export function AgentUnlockModal({
  isOpen,
  agent,
  agentCode,
  onClose,
  onConfirmSetActive,
}: AgentUnlockModalProps) {
  const handleClose = () => {
    onConfirmSetActive();
    onClose();
  };

  if (!agent) return null;

  const rarityStyle = RARITY_STYLES[agent.rarity];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-[#0a0c14]" />

          <motion.button
            onClick={handleClose}
            className="fixed z-[10010] p-3 rounded-full bg-black/60 border border-white/20 hover:bg-white/10 active:scale-95 transition-all"
            style={{
              top: 'max(16px, env(safe-area-inset-top))',
              right: '16px',
              minWidth: '48px',
              minHeight: '48px',
              touchAction: 'manipulation',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          <div
            className="relative w-full h-full flex flex-col"
            style={{
              paddingTop: 'max(16px, env(safe-area-inset-top))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            <motion.div
              className="w-full px-4 pt-2 pb-3"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div
                className="w-full rounded-2xl py-3 px-4 text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(30, 40, 60, 0.9) 0%, rgba(20, 30, 50, 0.95) 100%)',
                  border: '1px solid rgba(100, 120, 150, 0.3)',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white/60 font-medium tracking-widest uppercase">CODE</span>
                </div>
                <p className="text-xl font-orbitron font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 200, 255, 0.5)' }}>
                  {agentCode}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 px-4 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 20 }}
            >
              <div
                className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col items-center justify-center py-12 px-6"
                style={{
                  background: 'linear-gradient(180deg, #0d1525 0%, #080d18 50%, #050810 100%)',
                  border: '3px solid rgba(234, 179, 8, 0.5)',
                  boxShadow: '0 0 40px rgba(234, 179, 8, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(234, 179, 8, 0.15)', border: '2px solid rgba(234, 179, 8, 0.4)' }}>
                  <Sparkles className="w-10 h-10 text-yellow-400" />
                </div>
                <p className="text-lg font-orbitron font-bold text-yellow-400 mb-1" style={{ textShadow: '0 0 20px rgba(234, 179, 8, 0.5)' }}>
                  Agent Unlocked!
                </p>
                <p className="text-sm text-white/70">Your new agent is ready.</p>
              </div>
            </motion.div>

            <motion.div
              className="w-full px-4 pt-4 pb-2 text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-yellow-400 mb-3" style={{ textShadow: '0 0 30px rgba(234, 179, 8, 0.6)' }}>
                {agent.name}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className={`text-sm px-4 py-1.5 rounded-full font-medium ${rarityStyle.text}`} style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                  {agent.rarity}
                </span>
                <span className="text-sm px-4 py-1.5 rounded-full font-medium text-white/60" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  {agent.gender}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/40 mb-1 tracking-wider">Operator Code</p>
                <p className="text-xl font-orbitron font-bold text-yellow-400" style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}>
                  {agentCode}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
