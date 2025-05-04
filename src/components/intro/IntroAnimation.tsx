
import React from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  // Use simple useEffect instead of complex animations
  React.useEffect(() => {
    // Skip animation entirely and complete immediately
    onComplete();
    
    // Optional: If you still want some animation but more reliable:
    // const timer = setTimeout(() => {
    //   onComplete();
    // }, 2000);
    // 
    // return () => clearTimeout(timer);
  }, [onComplete]);

  // Return null to prevent any rendering issues
  return null;
};

export default IntroAnimation;
