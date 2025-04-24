
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
    }, 7000); // Set to 7 seconds as requested

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
        <div className="neon-n"></div>
        <div className="neon-l"></div>
        <div className="neon-dot"></div>
        <div className="logo-text">M1SSION</div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
