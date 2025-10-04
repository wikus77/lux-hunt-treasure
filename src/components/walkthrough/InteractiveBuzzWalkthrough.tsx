// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalkthroughState } from '@/hooks/useWalkthroughState';

interface InteractiveBuzzWalkthroughProps {
  onComplete: () => void;
  onDemoTrigger: () => void;
}

const WALKTHROUGH_STEPS = [
  {
    id: 0,
    title: "Benvenuto nel BUZZ!",
    description: "BUZZ ti permette di generare indizi testuali per trovare il premio M1SSION™. Scopri come funziona!",
    icon: Zap,
    action: null,
  },
  {
    id: 1,
    title: "Prova BUZZ GRATIS",
    description: "Premi il tasto BUZZ per ricevere il tuo primo indizio gratuito. Nessun pagamento richiesto per questa demo!",
    icon: Gift,
    action: "demo_buzz",
  },
  {
    id: 2,
    title: "Indizio Ricevuto!",
    description: "Perfetto! Gli indizi BUZZ ti guidano verso il premio. Più BUZZ usi, più ti avvicini al tesoro!",
    icon: Target,
    action: null,
  },
  {
    id: 3,
    title: "Come Funziona",
    description: "Ogni BUZZ ha un costo progressivo. Il primo costa €1.99, poi aumenta gradualmente. Più indizi raccogli, più precisa diventa la tua ricerca!",
    icon: Zap,
    action: null,
  },
  {
    id: 4,
    title: "Sei Pronto!",
    description: "Hai completato il tutorial BUZZ! Ora puoi iniziare la tua caccia al tesoro M1SSION™.",
    icon: ArrowRight,
    action: "complete",
  },
];

export function InteractiveBuzzWalkthrough({ onComplete, onDemoTrigger }: InteractiveBuzzWalkthroughProps) {
  const { buzzStep, updateStep, completeWalkthrough, skipWalkthrough } = useWalkthroughState();
  const [currentStep, setCurrentStep] = useState(buzzStep);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setCurrentStep(buzzStep);
  }, [buzzStep]);

  const handleNext = async () => {
    const nextStep = currentStep + 1;
    
    if (WALKTHROUGH_STEPS[currentStep].action === 'demo_buzz') {
      setShowParticles(true);
      onDemoTrigger();
      setTimeout(async () => {
        await updateStep('buzz', nextStep);
        setCurrentStep(nextStep);
        setShowParticles(false);
      }, 1500);
    } else if (WALKTHROUGH_STEPS[currentStep].action === 'complete') {
      await completeWalkthrough('buzz');
      onComplete();
    } else {
      await updateStep('buzz', nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handleSkip = async () => {
    await skipWalkthrough('buzz');
    onComplete();
  };

  const step = WALKTHROUGH_STEPS[currentStep] || WALKTHROUGH_STEPS[0];
  const Icon = step?.icon || Zap;
  const progress = ((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100;

  // Safety check: if step is invalid, reset to 0
  useEffect(() => {
    if (!WALKTHROUGH_STEPS[currentStep]) {
      setCurrentStep(0);
    }
  }, [currentStep]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      >
        {/* Particles Effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%', 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: Math.random() * 2,
                  opacity: 0,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute w-2 h-2 bg-[#00D1FF] rounded-full"
                style={{
                  boxShadow: '0 0 10px #00D1FF',
                }}
              />
            ))}
          </div>
        )}

        {/* Walkthrough Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#131524] to-black border border-[#00D1FF]/30 rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 40px rgba(0, 209, 255, 0.3)',
          }}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-[#00D1FF] to-[#FF1CF7]"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>

          {/* Content */}
          <div className="p-8 pt-12">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#FF1CF7] mx-auto"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-orbitron font-bold text-white">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-white/80 leading-relaxed">
                {step.description}
              </p>

              {/* Step Counter */}
              <div className="flex items-center justify-center gap-2 pt-4">
                {WALKTHROUGH_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-[#00D1FF] w-6'
                        : index < currentStep
                        ? 'bg-[#00D1FF]/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
                >
                  Salta
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1CF7] hover:opacity-90 text-white font-medium"
                >
                  {step.action === 'demo_buzz' ? 'Prova BUZZ' : step.action === 'complete' ? 'Completa' : 'Avanti'}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
