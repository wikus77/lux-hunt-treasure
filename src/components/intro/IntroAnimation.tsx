
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(7); // Secondi rimanenti per lo skip automatico

  useEffect(() => {
    console.log("IntroAnimation montato, avvio timer");
    
    // Timer principale per completare l'animazione dopo 7 secondi
    const timer = setTimeout(() => {
      console.log("Timer dell'animazione intro scaduto, completando...");
      handleComplete();
    }, 7000);

    // Timer per il countdown
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer di sicurezza che si attiva comunque dopo 8 secondi
    const safetyTimer = setTimeout(() => {
      console.log("Timer di sicurezza attivato, forzando completamento...");
      handleComplete();
    }, 8000);

    // Funzione di pulizia
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  // Funzione per gestire il completamento dell'animazione
  const handleComplete = () => {
    if (!isVisible) return; // Evita chiamate multiple
    
    console.log("Completamento intro in corso...");
    setIsVisible(false);
    
    // Piccolo ritardo prima di chiamare onComplete per permettere l'animazione di uscita
    setTimeout(() => {
      try {
        console.log("Chiamata onComplete dopo animazione di uscita");
        onComplete();
      } catch (error) {
        console.error("Errore durante il completamento dell'intro:", error);
      }
    }, 300);
  };

  // Gestisce il clic manuale per saltare l'animazione
  const handleSkip = () => {
    console.log("Intro saltato manualmente");
    handleComplete();
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo-container">
        <div className="scan-line" />
        <div className="mission-text">M1SSION</div>
      </div>
      
      {/* Pulsante più visibile per saltare l'animazione */}
      <button 
        onClick={handleSkip}
        className="mt-16 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white/90 hover:text-white"
      >
        Salta intro ({timeRemaining}s)
      </button>
    </motion.div>
  );
};

export default IntroAnimation;
