
import React from "react";
import { useLottie } from "lottie-react";
import neonLogoAnimation from "./neon-logo-animation.json";

const AnimatedLogo = () => {
  const options = {
    animationData: neonLogoAnimation,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      className: "lottie-svg-class"
    }
  };

  const { View } = useLottie(options);

  return (
    <div className="relative w-32 h-10 flex items-center justify-center">
      {View}
    </div>
  );
};

export default AnimatedLogo;
