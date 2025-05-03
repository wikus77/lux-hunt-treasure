
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [skipTimeout, setSkipTimeout] = useState(3);

  useEffect(() => {
    // Verifica se dobbiamo mostrare l'animazione
    const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true';
    
    if (wasRefreshed) {
      // Skip immediato in caso di refresh
      console.log("Refresh rilevato, salto intro");
      handleComplete();
      return;
    }
    
    // Timer principale per l'animazione (3 secondi)
    const timer = setTimeout(() => {
      handleComplete();
    }, 3000);
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setSkipTimeout(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    
    // Timer di sicurezza (4 secondi max)
    const safetyTimer = setTimeout(() => {
      handleComplete();
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleComplete = () => {
    if (!isVisible) return;
    
    setIsVisible(false);
    localStorage.setItem('introShown', 'true');
    
    // Piccolo ritardo per l'animazione di uscita
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
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
      
      <button 
        onClick={handleSkip}
        className="mt-16 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white/90 hover:text-white"
      >
        Salta intro ({skipTimeout}s)
      </button>
    </motion.div>
  );
};

export default IntroAnimation;
