
import React from "react";
import { motion } from "framer-motion";
import "../styles/intro-base.css";
import "../styles/intro-animations.css";
import "../styles/intro-effects.css";

interface AnimationContainerProps {
  children: React.ReactNode;
}

const AnimationContainer = ({ children }: AnimationContainerProps) => {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {children}
    </motion.div>
  );
};

export default AnimationContainer;
