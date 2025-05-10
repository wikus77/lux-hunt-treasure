
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./laser-reveal-styles.css";
import "./styles/base-intro-styles.css";

interface LaserRevealIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete, onSkip }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; xDirection: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoImageUrl = "/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png";

  // Controllo delle fasi di animazione
  useEffect(() => {
    const stageTimers = [
      setTimeout(() => setStage(1), 100),    // Inizia laser orizzontale
      setTimeout(() => setStage(2), 2000),   // Mostra logo
      setTimeout(() => setStage(3), 3000),   // Rivela testo
      setTimeout(() => setStage(4), 5500),   // Avvia transizione finale
      setTimeout(() => onComplete(), 6500)   // Completamento animazione
    ];

    return () => stageTimers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  // Creazione effetto particelle quando il laser "brucia" il contenuto
  useEffect(() => {
    if (stage >= 2) {
      const interval = setInterval(() => {
        if (containerRef.current) {
          const newParticle = {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            xDirection: (Math.random() - 0.5) * 40
          };
          
          setParticles(prev => [...prev, newParticle]);
          
          // Rimuovi particelle vecchie per mantenere le prestazioni
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== newParticle.id));
          }, 1000);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="laser-reveal-container" ref={containerRef}>
      {/* Sfondo con effetto stellare */}
      <div className="star-background">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={`star-${i}`}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`
            }}
          />
        ))}
      </div>
      
      {/* Linea laser che si muove */}
      <motion.div 
        className="laser-line"
        initial={{ top: "-10px", opacity: 0 }}
        animate={{ 
          top: stage >= 1 ? ["0%", "100%"] : "-10px",
          opacity: stage >= 1 ? [0, 1, 1, 0] : 0
        }}
        transition={{ 
          duration: 2,
          times: [0, 0.1, 0.9, 1],
          ease: "easeInOut" 
        }}
      />
      
      {/* Contenuto nascosto che verrà rivelato */}
      <div className={`laser-hidden-content ${stage >= 2 ? "laser-glow" : ""}`}>
        {stage >= 2 && (
          <div className="laser-revealed-content">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="laser-logo"
            >
              <motion.img 
                src={logoImageUrl} 
                alt="M1SSION Logo" 
                className="w-full"
                initial={{ filter: "brightness(0) invert(1)" }}
                animate={{ filter: "brightness(1) invert(0)" }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </motion.div>
            
            {stage >= 3 && (
              <>
                <motion.div 
                  className="laser-text"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    BENVENUTO A M1SSION
                  </motion.h1>
                </motion.div>
                
                <motion.div 
                  className="laser-text"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                  >
                    LA CACCIA AL TESORO STA PER INIZIARE
                  </motion.h2>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Particelle per effetto "bruciatura" */}
      <div className="laser-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              '--x-direction': `${particle.xDirection}px`
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Effetto di transizione finale */}
      {stage >= 4 && (
        <motion.div 
          className="laser-final-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.2, times: [0, 0.5, 1] }}
        />
      )}
      
      {/* Pulsante skip */}
      <motion.button
        className="skip-button"
        onClick={onSkip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        SALTA
      </motion.button>
    </div>
  );
};

export default LaserRevealIntro;
