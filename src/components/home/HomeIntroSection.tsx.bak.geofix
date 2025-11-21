
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedIntroSection from "./AnimatedIntroSection";

interface HomeIntroSectionProps {
  onIntroEnd: () => void;
  step: number;
}

export const HomeIntroSection = ({ onIntroEnd, step }: HomeIntroSectionProps) => {
  return (
    <AnimatePresence>
      {step === 0 && (
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto"}}>
          <AnimatedIntroSection onEnd={onIntroEnd} />
        </div>
      )}
    </AnimatePresence>
  );
};

export default HomeIntroSection;
