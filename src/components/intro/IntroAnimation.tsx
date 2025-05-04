
import React from "react";
import AnimationContainer from "./components/AnimationContainer";
import EyeAnimation from "./components/EyeAnimation";
import LogoTransition from "./components/LogoTransition";
import useAnimationSequence from "./hooks/useAnimationSequence";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const { animationStage, hasError } = useAnimationSequence({ onComplete });

  // If there's an error, don't render anything to avoid blocking the rest of the page
  if (hasError) {
    return null;
  }

  // Rendering the animation components
  return (
    <AnimationContainer>
      <EyeAnimation animationStage={animationStage} />
      <LogoTransition visible={animationStage >= 3} />
    </AnimationContainer>
  );
};

export default IntroAnimation;
