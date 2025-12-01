/**
 * ONBOARDING OVERLAY - With Celebration Animation
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useOnboarding } from './OnboardingProvider';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { hapticLight, hapticSuccess, hapticHeavy } from '@/utils/haptics';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

// Confetti component
const Confetti = () => {
  const colors = ['#00D1FF', '#FF59F8', '#FFD700', '#00FF88', '#FF6B6B', '#A855F7'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[10001] overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Celebration overlay
const CelebrationOverlay = ({ onComplete, userId }: { onComplete: () => void; userId?: string }) => {
  const [peAwarded, setPeAwarded] = useState(false);

  useEffect(() => {
    hapticHeavy();
    
    // Award PE bonus
    const awardPE = async () => {
      if (!userId || peAwarded) return;
      
      try {
        // Check if already awarded
        const alreadyAwarded = localStorage.getItem('m1ssion_onboarding_pe_awarded');
        if (alreadyAwarded) {
          setPeAwarded(true);
          return;
        }

        // Award 50 PE
        const { error } = await supabase
          .from('profiles')
          .update({ 
            pulse_energy: supabase.rpc('increment_pulse_energy', { amount: 50 })
          })
          .eq('id', userId);

        if (error) {
          // Fallback: direct increment
          const { data: profile } = await supabase
            .from('profiles')
            .select('pulse_energy')
            .eq('id', userId)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ pulse_energy: (profile.pulse_energy || 0) + 50 })
              .eq('id', userId);
          }
        }

        localStorage.setItem('m1ssion_onboarding_pe_awarded', 'true');
        setPeAwarded(true);
        toast.success('🎉 +50 PE accreditati per aver completato il tutorial!');
        console.log('[Onboarding] PE awarded successfully');
      } catch (err) {
        console.error('[Onboarding] Error awarding PE:', err);
      }
    };

    awardPE();
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete, userId, peAwarded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90"
    >
      <Confetti />
      
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="text-center relative z-10 px-4 max-w-md mx-auto"
      >
        {/* Big celebration emoji */}
        <motion.div
          className="text-6xl sm:text-8xl mb-4 sm:mb-6"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          🎉
        </motion.div>
        
        {/* Title with glow */}
        <motion.h1
          className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2"
          style={{
            background: 'linear-gradient(135deg, #00D1FF, #FF59F8, #FFD700)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 40px rgba(0, 209, 255, 0.5)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          TUTORIAL COMPLETATO!
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Benvenuto in M1SSION, Agente! 🕵️
        </motion.p>
        
        {/* Stats badges */}
        <motion.div
          className="flex justify-center gap-2 sm:gap-4 flex-wrap px-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-xs sm:text-sm">
            ⭐ +50 PE
          </div>
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs sm:text-sm">
            🏅 Rookie
          </div>
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs sm:text-sm">
            🎯 Ready
          </div>
        </motion.div>
        
        {/* Continue button */}
        <motion.button
          onClick={onComplete}
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all text-sm sm:text-base"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          INIZIA L'AVVENTURA! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export function OnboardingOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    progressPercent,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const { user } = useAuthContext();
  const userId = user?.id;

  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasScrolled = useRef(false);
  const skipAttempts = useRef(0);

  // Find target element
  const findTarget = useCallback(() => {
    if (!currentStep?.targetSelector) return null;
    
    // Support multiple selectors separated by comma
    const selectors = currentStep.targetSelector.split(', ');
    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector.trim()) as HTMLElement;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) return el;
      } catch (e) {
        console.log('[Onboarding] Selector error:', e);
      }
    }
    return null;
  }, [currentStep]);

  // Auto-skip step if element not found
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    const checkElement = () => {
      const el = findTarget();
      if (!el && currentStep.skipIfNotFound) {
        skipAttempts.current++;
        if (skipAttempts.current >= 3) {
          console.log('[Onboarding] Auto-skipping step:', currentStep.id);
          skipAttempts.current = 0;
          nextStep();
        }
      } else {
        skipAttempts.current = 0;
      }
    };

    const timeout = setTimeout(checkElement, 1500);
    return () => clearTimeout(timeout);
  }, [isActive, currentStep, currentStepIndex, findTarget, nextStep]);

  // Update rect and scroll to element
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetEl(null);
      setRect(null);
      return;
    }

    hasScrolled.current = false;

    const update = () => {
      const el = findTarget();
      setTargetEl(el);
      
      if (el) {
        if (!hasScrolled.current) {
          hasScrolled.current = true;
          setTimeout(() => {
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }, 100);
        }
        
        setTimeout(() => {
          setRect(el.getBoundingClientRect());
        }, hasScrolled.current ? 50 : 400);
      } else {
        setRect(null);
      }
    };

    update();
    const interval = setInterval(update, 500);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, currentStep, currentStepIndex, findTarget]);

  // Handle click on target
  useEffect(() => {
    if (!isActive || !targetEl) return;

    const handler = () => {
      hapticSuccess();
      setTimeout(() => {
        if (isLastStep && currentStep?.isFinalStep) {
          setShowCelebration(true);
        } else if (isLastStep) {
          completeOnboarding();
        } else {
          nextStep();
        }
      }, 400);
    };

    targetEl.addEventListener('click', handler);
    return () => targetEl.removeEventListener('click', handler);
  }, [isActive, targetEl, nextStep, completeOnboarding, isLastStep, currentStep]);

  const handleSkip = () => { hapticLight(); skipOnboarding(); };
  const handlePrev = () => { hapticLight(); prevStep(); };
  const handleNext = () => { 
    hapticLight(); 
    if (isLastStep && currentStep?.isFinalStep) {
      setShowCelebration(true);
    } else if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    completeOnboarding();
  };

  // Show celebration
  if (showCelebration) {
    return createPortal(
      <CelebrationOverlay onComplete={handleCelebrationComplete} userId={userId} />,
      document.body
    );
  }

  if (!isActive || !currentStep) return null;

  const padding = currentStep.spotlightPadding || 12;
  const hasTarget = rect !== null;
  
  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const tooltipWidth = isMobile ? Math.min(280, window.innerWidth - 32) : 320;

  // Tooltip position - FULLY RESPONSIVE
  const getTooltipStyle = (): React.CSSProperties => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safeMargin = 16;
    
    // Center if no target
    if (!rect) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
      };
    }

    const pos = currentStep.position || 'bottom';
    const gap = isMobile ? 12 : 20;
    
    // Calculate horizontal center, clamped to screen
    const centerX = rect.left + rect.width / 2;
    const halfTooltip = tooltipWidth / 2;
    const leftPos = Math.max(safeMargin, Math.min(centerX - halfTooltip, vw - tooltipWidth - safeMargin));

    // For mobile, prefer bottom or center positioning
    if (isMobile) {
      // Check if there's space below
      const spaceBelow = vh - rect.bottom - padding;
      const spaceAbove = rect.top - padding;
      
      if (spaceBelow > 200 || spaceBelow > spaceAbove) {
        return {
          top: Math.min(rect.bottom + gap + padding, vh - 220),
          left: safeMargin,
          right: safeMargin,
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      } else {
        return {
          bottom: vh - rect.top + gap + padding,
          left: safeMargin,
          right: safeMargin,
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      }
    }

    // Desktop positioning
    if (pos === 'top') {
      return {
        bottom: vh - rect.top + gap + padding,
        left: leftPos,
      };
    }
    if (pos === 'bottom') {
      return {
        top: Math.min(rect.bottom + gap + padding, vh - 250),
        left: leftPos,
      };
    }
    if (pos === 'left') {
      const rightSpace = vw - rect.left + gap + padding;
      return {
        top: Math.max(100, Math.min(rect.top + rect.height / 2 - 100, vh - 250)),
        right: Math.min(rightSpace, vw - tooltipWidth - safeMargin),
      };
    }
    if (pos === 'right') {
      return {
        top: Math.max(100, Math.min(rect.top + rect.height / 2 - 100, vh - 250)),
        left: Math.min(rect.right + gap + padding, vw - tooltipWidth - safeMargin),
      };
    }
    if (pos === 'center') {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
      };
    }
    
    return { 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
    };
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={`onboarding-${currentStepIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: 'none' }}
      >
        {/* OVERLAY SCURO */}
        {hasTarget ? (
          <>
            {/* Top */}
            <div className="fixed bg-black/85 pointer-events-auto" style={{
              top: 0, left: 0, right: 0,
              height: Math.max(0, rect.top - padding),
            }} />
            {/* Bottom */}
            <div className="fixed bg-black/85 pointer-events-auto" style={{
              top: rect.bottom + padding, left: 0, right: 0, bottom: 0,
            }} />
            {/* Left */}
            <div className="fixed bg-black/85 pointer-events-auto" style={{
              top: rect.top - padding, left: 0,
              width: Math.max(0, rect.left - padding),
              height: rect.height + padding * 2,
            }} />
            {/* Right */}
            <div className="fixed bg-black/85 pointer-events-auto" style={{
              top: rect.top - padding,
              left: rect.right + padding, right: 0,
              height: rect.height + padding * 2,
            }} />

            {/* GLOW BORDER - Extra special for final step */}
            <motion.div
              className="fixed rounded-xl pointer-events-none"
              style={{
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
                border: currentStep.isFinalStep ? '4px solid #FFD700' : '3px solid #00D1FF',
                boxShadow: currentStep.isFinalStep 
                  ? '0 0 50px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.2)'
                  : '0 0 30px rgba(0,209,255,0.5), inset 0 0 20px rgba(0,209,255,0.1)',
              }}
              animate={{
                boxShadow: currentStep.isFinalStep ? [
                  '0 0 50px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.2)',
                  '0 0 70px rgba(255,89,248,0.6), inset 0 0 40px rgba(255,89,248,0.2)',
                  '0 0 50px rgba(0,209,255,0.6), inset 0 0 30px rgba(0,209,255,0.2)',
                  '0 0 50px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.2)',
                ] : [
                  '0 0 30px rgba(0,209,255,0.5), inset 0 0 20px rgba(0,209,255,0.1)',
                  '0 0 40px rgba(255,89,248,0.5), inset 0 0 25px rgba(255,89,248,0.1)',
                  '0 0 30px rgba(0,209,255,0.5), inset 0 0 20px rgba(0,209,255,0.1)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* FRECCIA */}
            <motion.div
              className="fixed text-4xl pointer-events-none"
              style={{
                top: rect.top - padding - 50,
                left: rect.left + rect.width / 2 - 20,
                filter: currentStep.isFinalStep 
                  ? 'drop-shadow(0 0 15px rgba(255,215,0,0.9))'
                  : 'drop-shadow(0 0 10px rgba(0,209,255,0.8))',
              }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {currentStep.isFinalStep ? '🎉' : '👇'}
            </motion.div>
          </>
        ) : (
          <div className="fixed inset-0 bg-black/85 pointer-events-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* TOOLTIP - MOBILE OPTIMIZED */}
        <motion.div
          key={`tooltip-${currentStepIndex}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="fixed pointer-events-auto z-[10000]"
          style={{
            ...getTooltipStyle(),
            width: isMobile ? 'auto' : `${tooltipWidth}px`,
          }}
        >
          <div className={`bg-gray-900/98 backdrop-blur-xl rounded-xl border-2 shadow-[0_0_30px_rgba(0,209,255,0.3)] p-3 ${
            currentStep.isFinalStep ? 'border-yellow-500/60' : 'border-cyan-500/60'
          }`}>
            {/* Header - Compact */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-[10px] font-bold ${currentStep.isFinalStep ? 'text-yellow-400' : 'text-cyan-400'}`}>
                {currentStepIndex + 1}/{totalSteps}
              </span>
              <button onClick={handleSkip} className="p-0.5 hover:bg-white/10 rounded-full">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            {/* Title - Compact */}
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <span className="text-lg">{currentStep.icon}</span>
              {currentStep.title}
            </h3>

            {/* Description - Compact */}
            <p className="text-xs text-gray-300 mb-2 leading-snug">
              {currentStep.description}
            </p>

            {/* Progress - Thinner */}
            <div className="h-1 bg-gray-700 rounded-full mb-2 overflow-hidden">
              <motion.div
                className={`h-full ${currentStep.isFinalStep 
                  ? 'bg-gradient-to-r from-yellow-500 to-pink-500' 
                  : 'bg-gradient-to-r from-cyan-500 to-pink-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Buttons - Always visible */}
            <div className="flex justify-between items-center gap-2">
              <button onClick={handleSkip} className="text-[10px] text-gray-400 hover:text-white">
                Salta
              </button>

              <div className="flex gap-1.5">
                {!isFirstStep && (
                  <button onClick={handlePrev} className="px-2 py-1 bg-gray-700/50 text-white text-[10px] rounded-md">
                    ← 
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`px-3 py-1.5 text-white text-[11px] font-bold rounded-md flex items-center shadow-md ${
                    currentStep.isFinalStep 
                      ? 'bg-gradient-to-r from-yellow-500 to-pink-500'
                      : 'bg-gradient-to-r from-cyan-600 to-purple-600'
                  }`}
                >
                  {currentStep.isFinalStep ? '🎉 Fine' : 'Avanti →'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default OnboardingOverlay;
