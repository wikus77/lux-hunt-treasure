
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
      <h1 className="absolute text-2xl font-bold select-none drop-shadow-[0_1.5px_12px_rgba(0,229,255,0.51)] whitespace-nowrap">
        <span className="text-[#00E5FF] font-extrabold">M1</span>
        <span className="text-white font-extrabold">SSION</span>
      </h1>
    </div>
  );
};

export default AnimatedLogo;
