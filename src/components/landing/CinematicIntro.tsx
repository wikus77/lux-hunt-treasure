
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./glitch-intro.css";

// Import refactored components
import ElectricalCrackle from "./intro-elements/ElectricalCrackle";
import SystemLightUp from "./intro-elements/SystemLightUp";
import CircuitLines from "./intro-elements/CircuitLines";
import MissionLogoText from "./intro-elements/MissionLogoText";
import SloganText from "./intro-elements/SloganText";
import IntroAnimationLogic from "./intro-elements/IntroAnimationLogic";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [stage, setStage] = useState<number>(0);
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5 } }}
    >
      {/* Animation logic control - no visual output */}
      <IntroAnimationLogic onComplete={onComplete} setStage={setStage} />
      
      {/* Visual elements */}
      <AnimatePresence>
        <ElectricalCrackle stage={stage} />
      </AnimatePresence>
      
      <AnimatePresence>
        <SystemLightUp stage={stage} />
      </AnimatePresence>
      
      <AnimatePresence>
        <MissionLogoText stage={stage} />
      </AnimatePresence>
      
      <AnimatePresence>
        <SloganText stage={stage} />
      </AnimatePresence>
      
      {/* Circuit-like thin lines across screen */}
      <div className="absolute inset-0 pointer-events-none">
        <CircuitLines stage={stage} />
      </div>
    </motion.div>
  );
};

export default CinematicIntro;
