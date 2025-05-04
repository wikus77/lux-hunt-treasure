
import React from "react";
import "../styles/intro-base.css";
import "../styles/intro-animations.css";
import "../styles/intro-effects.css";

interface LogoTransitionProps {
  visible: boolean;
}

const LogoTransition = ({ visible }: LogoTransitionProps) => {
  if (!visible) return null;
  
  return (
    <div className="logo-container">
      <div className="mission-text">
        <span className="text-[#00E5FF]">M1</span>
        <span className="text-white">SSION</span>
      </div>
    </div>
  );
};

export default LogoTransition;
