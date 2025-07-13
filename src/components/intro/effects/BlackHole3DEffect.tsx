
import React from "react";
import BackgroundStars from "./blackhole/BackgroundStars";
import BlackHoleCenter from "./blackhole/BlackHoleCenter";
import ParticleSystem from "./blackhole/ParticleSystem";
import { motion } from "framer-motion";

interface BlackHole3DEffectProps {
  stage: number;
  visible: boolean;
}

const BlackHole3DEffect: React.FC<BlackHole3DEffectProps> = ({ stage, visible }) => {
  if (!visible) return null;

  return (
    <motion.div 
      className="black-hole-3d-effect"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        perspective: '1000px'
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: stage >= 6 ? [1, 0] : 1,
        scale: stage >= 6 ? [1, 1.1] : 1
      }}
      transition={{ 
        duration: stage >= 6 ? 2 : 0.5,
        ease: "easeInOut"
      }}
    >
      {/* Background stars with nebula effect */}
      <BackgroundStars stage={stage} />
      
      {/* Black hole center with accretion disk */}
      <BlackHoleCenter stage={stage} />
      
      {/* Enhanced particle system */}
      <ParticleSystem stage={stage} visible={visible} />
    </motion.div>
  );
};

export default BlackHole3DEffect;
