
import { useEffect } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="logo-container">
        <div className="scan-line" />
        <div className="logo-symbols">
          <div className="neon-n" />
          <div className="neon-l" />
          <div className="neon-dot" />
        </div>
        <div className="mission-text">M1SSION</div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
