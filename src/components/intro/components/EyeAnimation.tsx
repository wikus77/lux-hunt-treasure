
import React from "react";
import "../styles/intro-base.css";
import "../styles/intro-animations.css";
import "../styles/intro-effects.css";

interface EyeAnimationProps {
  animationStage: number;
}

const EyeAnimation = ({ animationStage }: EyeAnimationProps) => {
  return (
    <div className="eye-container">
      {/* The mechanical eye */}
      <div className={`mechanical-eye ${animationStage >= 2 ? 'opening' : ''}`}>
        <div className="eye-outer-ring"></div>
        <div className="eye-middle-ring"></div>
        <div className="eye-inner-ring"></div>
        
        {/* Iris segments */}
        <div className="iris-segments">
          <div className="iris-segment"></div>
          <div className="iris-segment"></div>
          <div className="iris-segment"></div>
          <div className="iris-segment"></div>
        </div>
        
        <div className="eye-pupil"></div>
      </div>
      
      {/* Center pulsation */}
      {animationStage >= 1 && (
        <div className="center-pulse"></div>
      )}
    </div>
  );
};

export default EyeAnimation;
