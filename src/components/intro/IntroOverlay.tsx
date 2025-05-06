
import React, { useEffect, useState } from 'react';
import './intro-overlay.css';

interface IntroOverlayProps {
  onComplete: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide overlay after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // After animation completes, call onComplete
      setTimeout(onComplete, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`intro-overlay ${!isVisible ? 'fade-out' : ''}`}>
      <div className="intro-overlay-content">
        <h1 className="intro-logo">
          <span className="m1">M1</span><span className="ssion">SSION</span>
        </h1>
        <p className="intro-slogan glitch" data-text="IT IS POSSIBLE">IT IS POSSIBLE</p>
        <p className="intro-date">Inizio: 19-06-25</p>
      </div>
    </div>
  );
};

export default IntroOverlay;
