// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Modal onboarding interattivo (max 5 step)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Benvenuto in M1SSION™',
    content: 'Sei pronto a vivere un\'esperienza unica? Ogni mese una nuova missione, premi esclusivi e sfide mozzafiato ti aspettano.',
  },
  {
    title: 'Come funziona?',
    content: 'Esplora indizi sulla mappa, risolvi enigmi e partecipa alle missioni. Più progressi fai, più premi sbloccherai.',
  },
  {
    title: 'Premi straordinari',
    content: 'Orologi di lusso, auto sportive, viaggi esclusivi. Il M1SSION Prize può essere tuo se completi la missione.',
  },
  {
    title: 'Inizia subito',
    content: 'Clicca su "INIZIA MISSIONE" nella Home per iscriverti alla missione corrente e iniziare la tua avventura.',
  },
  {
    title: 'Sei pronto?',
    content: 'Ogni tocco, ogni indizio, ogni scelta conta. Benvenuto nel mondo M1SSION™. L\'avventura inizia ora.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismissForever = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100dvh',
          }}
        >
          {/* Close button (top-right) */}
          <button
            onClick={handleDismissForever}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-[10001]"
            aria-label="Chiudi tutorial"
          >
            <X size={32} />
          </button>

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-md mx-4 bg-gradient-to-br from-[#0A0F1C] to-[#1A1F2E] rounded-2xl shadow-2xl border border-white/10 p-6"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-[#00D1FF] w-8'
                      : index < currentStep
                      ? 'bg-[#00D1FF]/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-orbitron font-bold mb-4 gradient-text-cyan">
                  {step.title}
                </h2>
                <p className="text-white/80 text-base leading-relaxed mb-8">
                  {step.content}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  ← Indietro
                </button>
              )}

              <div className="flex-1" />

              {currentStep < TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-[#00D1FF] to-[#00A3CC] rounded-full text-white font-semibold hover:shadow-lg hover:shadow-[#00D1FF]/30 transition-all"
                >
                  Avanti →
                </button>
              ) : (
                <button
                  onClick={handleDismissForever}
                  className="px-6 py-3 bg-gradient-to-r from-[#00D1FF] to-[#00A3CC] rounded-full text-white font-semibold hover:shadow-lg hover:shadow-[#00D1FF]/30 transition-all"
                >
                  Non visualizzare più
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
