
import React, { useState, useEffect } from 'react';
import './laser-reveal-styles.css';

interface LaserRevealIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete, onSkip }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    // Phase timing
    timeouts.push(setTimeout(() => setPhase(1), 500));   // Laser appears
    timeouts.push(setTimeout(() => setPhase(2), 1500));  // Cutting animation
    timeouts.push(setTimeout(() => setPhase(3), 3000));  // Logo reveal
    timeouts.push(setTimeout(() => setPhase(4), 4000));  // Text reveal
    timeouts.push(setTimeout(() => setPhase(5), 6000));  // Complete
    
    // Auto complete dopo 7 secondi
    timeouts.push(setTimeout(() => {
      onComplete();
    }, 7000));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [onComplete]);

  return (
    <div className="laser-intro-container">
      {/* Background */}
      <div className="laser-background" />
      
      {/* Laser effect */}
      <div className={`laser-beam ${phase >= 1 ? 'active' : ''}`} />
      
      {/* Metal plate effect */}
      <div className={`metal-plate ${phase >= 2 ? 'cutting' : ''}`} />
      
      {/* Logo reveal */}
      <div className={`logo-reveal ${phase >= 3 ? 'visible' : ''}`}>
        <h1 className="laser-logo font-orbitron">
          <span style={{ color: '#00F0FF', fontWeight: 700 }}>M1</span>
          <span style={{ color: '#FFFFFF', fontWeight: 700 }}>SSION</span>
        </h1>
      </div>
      
      {/* Text reveal */}
      <div className={`text-reveal ${phase >= 4 ? 'visible' : ''}`}>
        <p 
          className="laser-text font-orbitron" 
          style={{ 
            fontWeight: 700, 
            color: '#FFFFFF',
            fontFamily: 'Orbitron, sans-serif',
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.1em'
          }}
        >
          STARTS ON AUGUST 19
        </p>
      </div>
      
      {/* Skip button */}
      <button 
        className="laser-skip-button"
        onClick={onSkip}
        style={{ opacity: phase >= 2 ? 1 : 0 }}
      >
        Skip
      </button>
    </div>
  );
};

export default LaserRevealIntro;
