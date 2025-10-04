// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Target, Zap, Gift } from 'lucide-react';

const TUTORIAL_KEY = 'm1_landing_tutorial_seen';

interface LandingTutorialProps {
  onComplete: () => void;
}

const LandingTutorial: React.FC<LandingTutorialProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tutorial has been seen AND if user has accepted legal terms
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY);
    const hasAcceptedTerms = localStorage.getItem('hasAcceptedTerms');
    
    // Show tutorial only after legal terms are accepted and tutorial hasn't been seen
    if (!hasSeenTutorial && hasAcceptedTerms === 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slides = [
    {
      icon: Target,
      title: "Benvenuto in M1SSION™",
      description: "La caccia al tesoro più innovativa del mondo. Unisci mondo digitale e reale per conquistare premi di lusso esclusivi.",
      gradient: "from-m1ssion-blue to-m1ssion-purple"
    },
    {
      icon: Zap,
      title: "200 Indizi per il Tesoro",
      description: "Raccogli 200 BUZZ per ottenere tutti gli indizi necessari. Ogni indizio ti avvicina al premio finale: Lamborghini, Rolex, Hermès e molto altro.",
      gradient: "from-m1ssion-purple to-m1ssion-pink"
    },
    {
      icon: Gift,
      title: "Registrati e Inizia",
      description: "Crea il tuo account ora e ricevi il tuo primo BUZZ gratuito. L'avventura che cambierà tutto ti aspetta.",
      gradient: "from-m1ssion-pink to-m1ssion-blue"
    }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Tutorial Card */}
        <motion.div
          className="relative w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Card Container - M1SSION Glass Style */}
          <div 
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(19, 21, 36, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 209, 255, 0.2)',
              boxShadow: '0 0 40px rgba(0, 209, 255, 0.15), inset 0 0 20px rgba(0, 209, 255, 0.05)'
            }}
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-m1ssion-blue/20 via-m1ssion-purple/20 to-m1ssion-pink/20 animate-pulse-animation" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Slide Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Icon with Gradient */}
                  <div className="mb-6 flex justify-center">
                    <div 
                      className={`p-4 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient}`}
                      style={{
                        boxShadow: '0 0 30px rgba(0, 209, 255, 0.4)'
                      }}
                    >
                      {React.createElement(slides[currentSlide].icon, {
                        className: "w-12 h-12 text-white"
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 
                    className="text-2xl md:text-3xl font-orbitron font-bold mb-4 bg-gradient-to-r from-m1ssion-blue via-m1ssion-purple to-m1ssion-pink text-transparent bg-clip-text"
                    style={{
                      textShadow: '0 0 20px rgba(0, 209, 255, 0.3)'
                    }}
                  >
                    {slides[currentSlide].title}
                  </h2>

                  {/* Description */}
                  <p className="text-white/80 text-base md:text-lg leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-8 mb-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-gradient-to-r from-m1ssion-blue to-m1ssion-purple' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    currentSlide === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Indietro</span>
                </button>

                {/* Next/Finish Button */}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all bg-gradient-to-r from-m1ssion-blue to-m1ssion-purple hover:shadow-[0_0_20px_rgba(0,209,255,0.5)] hover:scale-105"
                >
                  <span>{currentSlide === slides.length - 1 ? 'Inizia' : 'Avanti'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Skip Button */}
              {currentSlide < slides.length - 1 && (
                <button
                  onClick={handleClose}
                  className="w-full mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Salta tutorial
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LandingTutorial;
