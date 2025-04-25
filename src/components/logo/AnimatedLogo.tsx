
import { useLottie } from "lottie-react";
import neonLogoAnimation from "./neon-logo-animation.json";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const AnimatedLogo = ({ className, size = "md", withText = true }: AnimatedLogoProps) => {
  const sizeClasses = {
    sm: "w-24 h-8",
    md: "w-32 h-10",
    lg: "w-40 h-12"
  };

  const options = {
    animationData: neonLogoAnimation,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      className: cn("lottie-svg-class", sizeClasses[size])
    }
  };

  const { View } = useLottie(options);

  return (
    <div className={cn(
      "relative flex items-center justify-center group",
      sizeClasses[size],
      className
    )}>
      {View}
      {withText && (
        <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent font-extrabold select-none transition-all duration-300 group-hover:from-[#7209b7] group-hover:to-[#4361ee] drop-shadow-[0_1.5px_12px_rgba(98,115,255,0.51)]">
          M1SSION
        </h1>
      )}
    </div>
  );
};

export default AnimatedLogo;
