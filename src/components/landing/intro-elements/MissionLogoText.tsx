
import React from "react";
import { motion } from "framer-motion";

interface MissionLogoTextProps {
  stage: number;
}

const MissionLogoText: React.FC<MissionLogoTextProps> = ({ stage }) => {
  if (stage < 3) return null;
  
  return (
    <div id="intro" className="z-10">
      <div className="glitch">M1SSION</div>
    </div>
  );
};

export default MissionLogoText;
