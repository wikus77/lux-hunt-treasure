
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
    <div className="w-32 h-auto flex items-center justify-center">
      {View}
      <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent font-extrabold select-none drop-shadow-[0_1.5px_12px_rgba(98,115,255,0.51)]">
        M1SSION
      </h1>
    </div>
  );
};

export default AnimatedLogo;
