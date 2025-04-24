
import { useLottie } from "lottie-react";
import neonLogoAnimation from "./neon-logo-animation.json";

const AnimatedLogo = () => {
  const options = {
    animationData: neonLogoAnimation,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div className="w-32 h-auto">
      {View}
    </div>
  );
};

export default AnimatedLogo;
