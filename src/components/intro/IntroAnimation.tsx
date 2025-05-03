
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(3); // Ridotto ulteriormente per maggiore reattività
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    console.log("IntroAnimation montato, avvio timer");
    
    // Flag per indicare che l'animazione è iniziata
    setAnimationStarted(true);
    
    // Assicurati che il body sia visibile (per evitare problemi con flash di pagina bianca)
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.display = 'block';
    
    // Timer principale più rapido per completare l'animazione dopo 3 secondi
    const timer = setTimeout(() => {
      console.log("Timer dell'animazione intro scaduto, completando...");
      handleComplete();
    }, 3000);

    // Timer per il countdown più veloce
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer di sicurezza ancora più veloce
    const safetyTimer = setTimeout(() => {
      console.log("Timer di sicurezza attivato, forzando completamento intro...");
      handleComplete();
    }, 4000);

    // Timer extra di sicurezza per assicurarsi che l'interfaccia sia sempre visibile
    const visibilityTimer = setInterval(() => {
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      document.body.style.display = 'block';
    }, 500);

    // Funzione di pulizia
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      clearInterval(countdownInterval);
      clearInterval(visibilityTimer);
      
      // Assicuriamoci che l'app sia visibile quando l'intro viene smontato
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      console.log("IntroAnimation smontato, visibilità garantita");
    };
  }, []);

  // Funzione migliorata per gestire il completamento dell'animazione
  const handleComplete = () => {
    if (!isVisible) return; // Evita chiamate multiple
    
    console.log("Completamento intro in corso...");
    setIsVisible(false);
    
    // Confermiamo immediatamente che l'intro è stato mostrato
    localStorage.setItem('introShown', 'true');
    
    // Piccolo ritardo prima di chiamare onComplete per permettere l'animazione di uscita
    setTimeout(() => {
      try {
        console.log("Chiamata onComplete dopo animazione di uscita");
        onComplete();
        
        // Assicuriamoci che l'interfaccia utente sia visibile
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      } catch (error) {
        console.error("Errore durante il completamento dell'intro:", error);
        // Assicuriamoci che l'app rimanga visibile anche in caso di errore
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      }
    }, 300);
  };

  // Gestisce il clic manuale per saltare l'animazione
  const handleSkip = () => {
    console.log("Intro saltato manualmente");
    handleComplete();
  };

  // Verifichiamo se dobbiamo evitare completamente l'animazione
  useEffect(() => {
    const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true';
    if (wasRefreshed && animationStarted) {
      console.log("Rilevato refresh durante IntroAnimation, salto immediato");
      handleComplete();
    }
  }, [animationStarted]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        pointerEvents: isVisible ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden' 
      }}
      onAnimationComplete={() => {
        // Assicuriamo la visibilità dopo ogni animazione
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      }}
    >
      <div className="logo-container">
        <div className="scan-line" />
        <div className="mission-text">M1SSION</div>
      </div>
      
      {/* Pulsante più visibile e interattivo per saltare l'animazione */}
      <button 
        onClick={handleSkip}
        className="mt-16 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        style={{ zIndex: 60 }}
      >
        Salta intro ({timeRemaining}s)
      </button>
    </motion.div>
  );
};

export default IntroAnimation;
