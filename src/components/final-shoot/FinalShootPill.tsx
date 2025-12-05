// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT PILL - IDENTICAL to other pills, 1 cyan orbiting dot
// NOTA: Componente COMPLETAMENTE INDIPENDENTE dalla logica Buzz Map

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Target, Trophy, AlertCircle, Lock, X, Zap } from 'lucide-react';
import { useFinalShootContext } from './FinalShootContext';
import '@/features/m1u/m1u-ui.css';
import './FinalShootPill.css';

const FinalShootPill: React.FC = () => {
  const {
    isAvailable,
    isActive,
    isLocked,
    remainingAttempts,
    daysRemaining,
    totalMissionDays,
    hasWon,
    isLoading,
    isTestMode,
    activateFinalShoot,
    deactivateFinalShoot,
  } = useFinalShootContext();

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Don't render while loading
  if (isLoading) {
    return null;
  }

  // Calculate days until Final Shoot is available
  const daysUntilAvailable = Math.max(0, daysRemaining - 7);

  // Determine state
  const getState = () => {
    if (hasWon) return 'won';
    if (isAvailable && remainingAttempts <= 0) return 'exhausted';
    if (isActive) return 'active';
    if (isLocked) return 'locked';
    return 'available';
  };

  const state = getState();

  // Icon based on state
  const getIcon = () => {
    switch (state) {
      case 'won': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'exhausted': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'active': return <Target className="w-5 h-5 text-red-400" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <Crosshair className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleClick = () => {
    if (state === 'won' || state === 'exhausted') return;
    if (state === 'active') {
      deactivateFinalShoot();
    } else if (state === 'locked') {
      setShowInfoModal(true);
    } else {
      activateFinalShoot();
    }
  };

  return (
    <>
      {/* Final Shoot Pill - IDENTICAL to other pills (pill-orb class) */}
      <motion.button
        className={`pill-orb final-shoot-pill final-shoot-pill--${state}`}
        onClick={handleClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label="Final Shoot"
      >
        {/* Main Icon */}
        {getIcon()}
        
        {/* Single orbiting dot - SAME as other pills */}
        <span className="dot" />

        {/* TEST badge */}
        {isTestMode && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] bg-yellow-500 rounded-full text-black font-bold">
            TEST
          </span>
        )}

        {/* Won crown */}
        {state === 'won' && (
          <span className="absolute -top-3 text-sm">👑</span>
        )}
      </motion.button>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative max-w-md w-full p-6 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <Crosshair className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-orbitron">
                    FINAL SHOOT
                  </h2>
                  <p className="text-sm text-cyan-400">La Mossa Finale</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-pink-400" />
                    Cos'è Final Shoot?
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    È la tua ultima possibilità di vincere! Negli <span className="text-cyan-400 font-bold">ultimi 7 giorni</span> della missione, 
                    puoi indicare sulla mappa dove pensi si trovi il premio.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Come Funziona
                  </h3>
                  <ul className="text-sm text-white/70 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      Attiva Final Shoot toccando questo pulsante
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      Tocca sulla mappa dove pensi sia il premio
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      Ricevi feedback sulla distanza dal premio
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/20">
                  <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Attenzione
                  </h3>
                  <p className="text-sm text-white/70">
                    Hai solo <span className="text-red-400 font-bold">3 tentativi</span> per l'intera missione. 
                    Usa gli indizi raccolti per aumentare le tue probabilità!
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Si attiva tra</div>
                    <div className="text-2xl font-bold text-cyan-400 font-orbitron">
                      {daysUntilAvailable} GIORNI
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">Giorni missione</div>
                    <div className="text-lg font-bold text-white">
                      {totalMissionDays - daysRemaining}/{totalMissionDays}
                    </div>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-white font-bold hover:border-cyan-400/50 transition-colors"
              >
                Ho Capito
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FinalShootPill;
