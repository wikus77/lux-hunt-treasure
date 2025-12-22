// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Component: WelcomeBonusModal
// Modal di benvenuto con animazione e accredito 500 M1U

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWelcomeBonus } from '@/hooks/useWelcomeBonus';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Gift, Sparkles, ChevronRight, Coins } from 'lucide-react';

interface WelcomeBonusModalProps {
  isOpen?: boolean;
  onComplete?: () => void;
}

const WelcomeBonusModal: React.FC<WelcomeBonusModalProps> = ({ 
  isOpen: externalIsOpen,
  onComplete 
}) => {
  const { user } = useUnifiedAuth();
  const { 
    needsBonus, 
    isLoading, 
    isClaiming, 
    claimBonus, 
    WELCOME_BONUS_AMOUNT 
  } = useWelcomeBonus();

  const [showModal, setShowModal] = useState(false);
  const [phase, setPhase] = useState<'welcome' | 'crediting' | 'complete'>('welcome');
  const [displayedAmount, setDisplayedAmount] = useState(0);

  // Control modal visibility
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : (needsBonus && !isLoading);

  useEffect(() => {
    if (isModalOpen) {
      // Small delay for smoother entrance after onboarding
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isModalOpen]);

  // Slot machine animation for M1U amount
  const animateSlotMachine = () => {
    setPhase('crediting');
    const duration = 2500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing for slot machine effect
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      if (progress < 1) {
        // Random fluctuation during animation
        const randomOffset = Math.floor(Math.random() * 100) - 50;
        const current = Math.floor(WELCOME_BONUS_AMOUNT * easeOutQuart) + randomOffset;
        setDisplayedAmount(Math.max(0, Math.min(current, WELCOME_BONUS_AMOUNT + 50)));
        requestAnimationFrame(animate);
      } else {
        // Final value
        setDisplayedAmount(WELCOME_BONUS_AMOUNT);
        setPhase('complete');
        
        // Auto close after showing final amount
        setTimeout(() => {
          setShowModal(false);
          onComplete?.();
        }, 1500);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Handle claim button click
  const handleClaim = async () => {
    // 🎰 Avvia SEMPRE l'animazione slot machine (UX prioritaria)
    // Anche se il backend fallisce, l'utente vede comunque l'animazione
    animateSlotMachine();
    
    // Tenta il claim in background (non bloccante)
    try {
      const success = await claimBonus();
      if (!success) {
        console.warn('[WelcomeBonus] Claim failed, but animation shown');
      }
    } catch (err) {
      console.error('[WelcomeBonus] Claim error:', err);
    }
  };

  // Get agent name from user
  const agentName = user?.user_metadata?.full_name || 'Agente';

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Glass card */}
            <div 
              className="relative rounded-3xl p-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
                border: '1px solid rgba(0,229,255,0.2)',
                boxShadow: '0 0 60px rgba(0,229,255,0.15), 0 0 120px rgba(138,43,226,0.1), inset 0 0 60px rgba(0,0,0,0.5)'
              }}
            >
              {/* Neon edge glow */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, transparent 30%, transparent 70%, rgba(138,43,226,0.1) 100%)',
                }}
              />

              {/* Top decoration */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              {/* Content based on phase */}
              <div className="relative z-10 text-center">
                
                {/* PHASE: WELCOME */}
                {phase === 'welcome' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Icon */}
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(138,43,226,0.2) 100%)',
                        boxShadow: '0 0 30px rgba(0,229,255,0.3)'
                      }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 30px rgba(0,229,255,0.3)',
                          '0 0 50px rgba(0,229,255,0.5)',
                          '0 0 30px rgba(0,229,255,0.3)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Gift className="w-10 h-10 text-cyan-400" />
                    </motion.div>

                    {/* Welcome text */}
                    <motion.h2
                      className="text-2xl md:text-3xl font-bold mb-3 font-orbitron"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="text-cyan-400">BENVENUTO</span>{' '}
                      <span className="text-white">IN M1SSION</span>
                      <span className="text-cyan-400 text-lg">™</span>
                    </motion.h2>

                    <motion.p
                      className="text-gray-300 text-lg mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Ciao <span className="text-cyan-400 font-semibold">{agentName}</span>!<br />
                      La caccia al tesoro globale ti aspetta.
                    </motion.p>

                    {/* Bonus announcement */}
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl p-4 mb-6 border border-cyan-500/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-semibold">BONUS DI BENVENUTO</span>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-gray-300 text-sm">
                        Come regalo di benvenuto riceverai
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        <span 
                          className="text-3xl font-bold font-orbitron"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(255,215,0,0.5)'
                          }}
                        >
                          {WELCOME_BONUS_AMOUNT} M1U
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        per esplorare il gioco e iniziare la tua missione
                      </p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg text-black relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 50%, #00E5FF 100%)',
                        boxShadow: '0 0 30px rgba(0,229,255,0.4)'
                      }}
                      onClick={handleClaim}
                      disabled={isClaiming}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 font-orbitron">
                        {isClaiming ? (
                          <>
                            <motion.div
                              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            ATTIVAZIONE...
                          </>
                        ) : (
                          <>
                            BUONA CACCIA
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </span>
                      
                      {/* Button glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    </motion.button>
                  </motion.div>
                )}

                {/* PHASE: CREDITING (Slot Machine) */}
                {phase === 'crediting' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8"
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.2) 100%)',
                        boxShadow: '0 0 40px rgba(255,215,0,0.5)'
                      }}
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Coins className="w-12 h-12 text-yellow-400" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-4 font-orbitron">
                      ACCREDITO IN CORSO...
                    </h3>

                    {/* Slot machine display */}
                    <motion.div
                      className="text-5xl font-bold font-orbitron mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(255,215,0,0.6)'
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.1, repeat: Infinity }}
                    >
                      +{displayedAmount} M1U
                    </motion.div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* PHASE: COMPLETE */}
                {phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8"
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,255,127,0.2) 0%, rgba(0,200,100,0.2) 100%)',
                        boxShadow: '0 0 40px rgba(0,255,127,0.5)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.span
                        className="text-4xl"
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        ✓
                      </motion.span>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-green-400 mb-2 font-orbitron">
                      BONUS ATTIVATO!
                    </h3>

                    <div
                      className="text-4xl font-bold font-orbitron mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      +{WELCOME_BONUS_AMOUNT} M1U
                    </div>

                    <p className="text-gray-400">
                      Buona caccia, Agente!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBonusModal;

