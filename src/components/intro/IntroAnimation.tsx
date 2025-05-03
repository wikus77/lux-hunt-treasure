
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timer normale per completare l'animazione dopo 7 secondi
    const timer = setTimeout(() => {
      console.log("Timer dell'animazione intro scaduto, completando...");
      handleComplete();
    }, 7000);

    // Timer di sicurezza che si attiva comunque dopo 10 secondi
    const safetyTimer = setTimeout(() => {
      console.log("Timer di sicurezza attivato, forzando completamento...");
      handleComplete();
    }, 10000);

    // Funzione di pulizia
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  // Funzione per gestire il completamento dell'animazione
  const handleComplete = () => {
    if (!isVisible) return; // Evita chiamate multiple
    
    setIsVisible(false);
    
    // Piccolo ritardo prima di chiamare onComplete per permettere l'animazione di uscita
    setTimeout(() => {
      try {
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
      
      {/* Pulsante per saltare l'animazione */}
      <button 
        onClick={handleSkip}
        className="mt-20 px-4 py-2 text-sm text-white/70 hover:text-white/100 transition-colors"
      >
        Salta
      </button>
    </motion.div>
  );
};

export default IntroAnimation;
