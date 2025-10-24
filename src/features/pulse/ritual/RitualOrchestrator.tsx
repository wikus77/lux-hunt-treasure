/**
 * The Pulse™ — Ritual Orchestrator
 * Manages fullscreen ritual FX: precharge → blackout → interference → reveal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualChannel } from './useRitualChannel';
import { OpenButton } from './OpenButton';

export function RitualOrchestrator() {
  const { phase, ritualId } = useRitualChannel();
  const [rewardData, setRewardData] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Update CSS variables based on phase for synchronized animations
  useEffect(() => {
    const root = document.documentElement;
    
    switch (phase) {
      case 'precharge':
        root.style.setProperty('--glow-mult', '1.5');
        root.style.setProperty('--flow-mult', '0.7');
        break;
      case 'blackout':
      case 'interference':
        root.style.setProperty('--glow-mult', '2.0');
        root.style.setProperty('--flow-mult', '0.5');
        break;
      case 'reveal':
        root.style.setProperty('--glow-mult', '1.8');
        root.style.setProperty('--flow-mult', '0.6');
        break;
      default:
        root.style.setProperty('--glow-mult', '1');
        root.style.setProperty('--flow-mult', '1');
    }
  }, [phase]);

  const handleClaimed = (reward: any) => {
    setRewardData(reward);
    setShowReward(true);
  };

  if (phase === 'idle' || phase === 'closed') {
    return null;
  }

  return (
    <AnimatePresence>
      {/* Ritual Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.15 : 0.4 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
        style={{ isolation: 'isolate' }}
      >
        {/* Phase: Precharge (0.8s) */}
        {phase === 'precharge' && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-pulse-ritual-precharge">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-primary/50 animate-spin" />
            </div>
          </div>
        )}

        {/* Phase: Blackout (1.6s) */}
        {phase === 'blackout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
            {!prefersReducedMotion && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-[300px] h-[300px] rounded-full 
                           bg-[radial-gradient(circle,rgba(255,77,240,0.3),rgba(0,231,255,0.3),transparent_70%)]
                           blur-xl"
              />
            )}
          </motion.div>
        )}

        {/* Phase: Interference (1.2s) */}
        {phase === 'interference' && (
          <div className="absolute inset-0 bg-black ritual-interference">
            <div className="absolute inset-0 ritual-scanlines opacity-30" />
            <div className="absolute inset-0 ritual-chromatic" />
            <div className="absolute inset-0 ritual-noise animate-pulse" />
          </div>
        )}

        {/* Phase: Reveal */}
        {phase === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.5, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/90 to-black/95 
                       flex items-center justify-center backdrop-blur-md"
          >
            <OpenButton ritualId={ritualId} onClaimed={handleClaimed} />
          </motion.div>
        )}

        {/* Reward Sheet (after claim) */}
        {showReward && rewardData && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto
                       bg-gradient-to-b from-background/95 to-background
                       border-t border-border/50 backdrop-blur-lg
                       rounded-t-3xl p-6 shadow-2xl"
          >
            <div className="max-w-md mx-auto space-y-4">
              {/* Reward Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-technovier text-primary tracking-wide">
                  Echo Revealed
                </h2>
                <p className="text-sm text-muted-foreground font-technovier">
                  {rewardData.copy || 'The world listened. The echo answered.'}
                </p>
              </div>

              {/* Reward Items */}
              <div className="space-y-3">
                {rewardData.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-card/50 border border-border/30
                               backdrop-blur-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-technovier text-foreground">
                        {item.title}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-technovier">
                        {item.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type}
                    </p>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowReward(false)}
                className="w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20
                           border border-primary/30 text-primary font-technovier
                           tracking-wide transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
