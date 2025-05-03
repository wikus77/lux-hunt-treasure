
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./animated-logo-reveal.css";

interface AnimatedLogoRevealProps {
  onComplete: () => void;
}

const AnimatedLogoReveal: React.FC<AnimatedLogoRevealProps> = ({ onComplete }) => {
  const [showTyping, setShowTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const textToType = "SSION";
  const [showTagline, setShowTagline] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    // Start M1 animation and then show typing effect
    const timer1 = setTimeout(() => {
      setShowTyping(true);
      typeText();
    }, 1500);

    // Function to simulate typing animation
    const typeText = () => {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < textToType.length) {
          setTypedText((prev) => prev + textToType.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          // Show tagline after typing completes
          setTimeout(() => {
            setShowTagline(true);
            // Show continue button after tagline
            setTimeout(() => {
              setShowContinueButton(true);
            }, 1000);
          }, 500);
        }
      }, 150); // Speed of typing
    };

    // Auto-complete after 8 seconds total
    const autoCompleteTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(autoCompleteTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Particles background */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay" />

      {/* Scanning line */}
      <div className="scan-line" />

      {/* Logo reveal content */}
      <div className="logo-reveal-container">
        <div className="logo-reveal-content">
          <span className="text-m1-cyan animate-neon-pulse">M1</span>
          {showTyping && (
            <div className="mission-text-typing">
              {typedText}
            </div>
          )}
        </div>
      </div>

      {/* Tagline */}
      {showTagline && (
        <motion.p
          className="mt-6 text-xl text-yellow-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          IT IS POSSIBLE
        </motion.p>
      )}

      {/* Continue button */}
      {showContinueButton && (
        <motion.button
          onClick={onComplete}
          className="mt-12 px-6 py-2 rounded-full bg-cyan-600 text-black font-bold hover:bg-cyan-700 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          CONTINUE
        </motion.button>
      )}
    </motion.div>
  );
};

export default AnimatedLogoReveal;
