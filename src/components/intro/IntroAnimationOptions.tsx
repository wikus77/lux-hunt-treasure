
import React from "react";
import MatrixAnimation from "./animations/MatrixAnimation";
import GlitchAnimation from "./animations/GlitchAnimation";
import ParticleAnimation from "./animations/ParticleAnimation";
import ScannerAnimation from "./animations/ScannerAnimation";
import ThreeDAnimation from "./animations/ThreeDAnimation";
import BlackHoleRevealIntro from "./BlackHoleRevealIntro";

// Import CSS files for Framer Motion (they will be loaded globally)
import "./styles/base-intro-styles.css";

// Animation options selector component
interface IntroAnimationOptionsProps {
  onComplete: () => void;
  selectedOption?: number;
}

const IntroAnimationOptions: React.FC<IntroAnimationOptionsProps> = ({ 
  onComplete,
  selectedOption = 6 // Default to the new Black Hole animation
}) => {
  // Select animation based on option
  switch (selectedOption) {
    case 1:
      return <MatrixAnimation onComplete={onComplete} />;
    case 2:
      return <GlitchAnimation onComplete={onComplete} />;
    case 3:
      return <ParticleAnimation onComplete={onComplete} />;
    case 4:
      return <ScannerAnimation onComplete={onComplete} />;
    case 5:
      return <ThreeDAnimation onComplete={onComplete} />;
    case 6:
      return <BlackHoleRevealIntro onComplete={onComplete} />;
    default:
      return <BlackHoleRevealIntro onComplete={onComplete} />;
  }
};

export default IntroAnimationOptions;
