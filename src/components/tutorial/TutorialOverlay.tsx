import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Brain, Target, Search, Zap, Trophy, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import { useOnboardingTutorial } from '@/hooks/useOnboardingTutorial';

interface TutorialSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: 1,
    title: "Benvenuto in M1SSION™",
    description: "L'unica app dove ogni missione può diventare un premio reale.",
    icon: (
      <div className="flex items-center gap-3 text-6xl">
        <Brain className="w-16 h-16 text-cyan-400" />
        <Target className="w-16 h-16 text-yellow-400" />
      </div>
    )
  },
  {
    id: 2,
    title: "Scopri gli indizi",
    description: "Ogni giorno ricevi nuovi indizi in base al tuo abbonamento. Leggili con attenzione: ogni parola conta.",
    icon: <Search className="w-16 h-16 text-cyan-400" />
  },
  {
    id: 3,
    title: "Usa il BUZZ per trovare le zone",
    description: "Esplora la mappa. Sblocca aree misteriose usando il tuo BUZZ.",
    icon: <Zap className="w-16 h-16 text-yellow-400" />
  },
  {
    id: 4,
    title: "Scala la classifica e vinci premi reali",
    description: "Più giochi, più indizi sblocchi, più ti avvicini ai premi veri.",
    icon: (
      <div className="flex items-center gap-3 text-6xl">
        <Trophy className="w-16 h-16 text-yellow-400" />
        <Gift className="w-16 h-16 text-cyan-400" />
      </div>
    )
  },
  {
    id: 5,
    title: "È il momento di iniziare",
    description: "Hai una sola M1SSION. Falla tua.",
    icon: <Target className="w-16 h-16 text-cyan-400 animate-pulse" />
  }
];

const TutorialOverlay: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { showTutorial: showFromHook, isLoading, hideTutorialForever } = useOnboardingTutorial();

  useEffect(() => {
    if (!isLoading) {
      setShowTutorial(showFromHook);
    }
  }, [isLoading, showFromHook]);

  const handleSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    hideTutorialForever();
    setShowTutorial(false);
  };

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleStart = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    hideTutorialForever();
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  const isLastSlide = currentSlide === tutorialSlides.length - 1;
  const currentSlideData = tutorialSlides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
      <SafeAreaWrapper>
        {/* Header with Skip Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleSkip}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {tutorialSlides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentSlide ? "bg-cyan-400" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center max-w-sm mx-auto"
            >
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                {currentSlideData.icon}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4 gradient-text">
                {currentSlideData.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-300 leading-relaxed">
                {currentSlideData.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={cn(
                "p-3 rounded-full transition-all",
                currentSlide === 0 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                  : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
              )}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Action Button */}
            {isLastSlide ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-yellow-500 text-black font-bold rounded-full hover:from-cyan-400 hover:to-yellow-400 transition-all transform hover:scale-105 neon-button"
              >
                INIZIA ORA
              </button>
            ) : (
              <div className="text-sm text-gray-400">
                {currentSlide + 1} / {tutorialSlides.length}
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={isLastSlide}
              className={cn(
                "p-3 rounded-full transition-all",
                isLastSlide 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                  : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
              )}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </SafeAreaWrapper>
    </div>
  );
};

export default TutorialOverlay;