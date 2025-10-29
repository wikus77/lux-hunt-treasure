// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ARCHETYPE_CONFIGS, type Archetype } from './dnaTypes';

interface DNAEvolutionSceneProps {
  isOpen: boolean;
  archetype: Archetype;
  onComplete: () => void;
}

/**
 * DNA Evolution Cinematic Scene
 * 
 * Plays when DNA archetype changes or evolution is triggered.
 * Features:
 * - Cinematic fade-in/out
 * - Archetype icon animation
 * - Norah AI voice-over text
 * - Pulsing energy effects
 */
export const DNAEvolutionScene: React.FC<DNAEvolutionSceneProps> = ({
  isOpen,
  archetype,
  onComplete
}) => {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'outro'>('intro');
  const archetypeConfig = ARCHETYPE_CONFIGS[archetype];

  useEffect(() => {
    if (!isOpen) {
      setPhase('intro');
      return;
    }

    // Sequence: intro (1s) → reveal (3s) → outro (1s) → close
    const introTimer = setTimeout(() => setPhase('reveal'), 1000);
    const revealTimer = setTimeout(() => setPhase('outro'), 4000);
    const closeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(revealTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-full bg-black border-none p-0 flex items-center justify-center"
        style={{ maxWidth: '100vw', maxHeight: '100vh' }}
      >
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />
          )}

          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center justify-center gap-8"
            >
              {/* Pulsing Background */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div
                  className="w-[600px] h-[600px] rounded-full blur-[120px]"
                  style={{
                    background: `radial-gradient(circle, ${archetypeConfig.color}, transparent 70%)`
                  }}
                />
              </motion.div>

              {/* Archetype Icon */}
              <motion.div
                className="text-[120px] md:text-[200px] relative z-10"
                style={{
                  filter: `drop-shadow(0 0 40px ${archetypeConfig.color})`
                }}
                animate={{
                  scale: [0.9, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                {archetypeConfig.icon}
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center space-y-4 max-w-2xl px-6"
              >
                <motion.div
                  className="text-4xl md:text-6xl font-black"
                  style={{
                    color: archetypeConfig.color,
                    textShadow: `0 0 30px ${archetypeConfig.color}80`
                  }}
                >
                  {archetypeConfig.nameIt}
                </motion.div>
                <motion.div
                  className="text-base md:text-xl text-white/80 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Sequenza M1-HEX riscritta.
                  <br />
                  Il tuo codice vibra con una nuova frequenza.
                </motion.div>
              </motion.div>

              {/* Energy Particles - Increased from 12 to 18 */}
              {[...Array(18)].map((_, i) => {
                const isOuter = i >= 12;
                const angle = ((i % 12) / 12) * Math.PI * 2;
                const distance = isOuter ? 350 : 300;
                
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: isOuter ? '3px' : '2px',
                      height: isOuter ? '3px' : '2px',
                      backgroundColor: archetypeConfig.color,
                      left: '50%',
                      top: '50%'
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * distance],
                      y: [0, Math.sin(angle) * distance],
                      opacity: [1, 0],
                      scale: [1, 0]
                    }}
                    transition={{
                      duration: isOuter ? 2.3 : 2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: isOuter ? 0.3 : 0.5,
                      delay: isOuter ? 0.2 : 0
                    }}
                  />
                );
              })}
            </motion.div>
          )}

          {phase === 'outro' && (
            <motion.div
              key="outro"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
