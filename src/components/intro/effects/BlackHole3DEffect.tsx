
import React from "react";
import BackgroundStars from "./blackhole/BackgroundStars";
import BlackHoleCenter from "./blackhole/BlackHoleCenter";
import ParticleSystem from "./blackhole/ParticleSystem";

interface BlackHole3DEffectProps {
  stage: number;
  visible: boolean;
}

const BlackHole3DEffect: React.FC<BlackHole3DEffectProps> = ({ stage, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="black-hole-3d-effect"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: stage >= 5 ? 0 : 1,
        transition: 'opacity 1.5s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* Background stars with nebula effect */}
      <BackgroundStars />
      
      {/* Black hole center with accretion disk */}
      <BlackHoleCenter stage={stage} />
      
      {/* Enhanced particle system */}
      <ParticleSystem stage={stage} visible={visible} />
    </div>
  );
};

export default BlackHole3DEffect;
