
import { useLottie } from "lottie-react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const AnimatedLogo = ({ className, size = "md", withText = true }: AnimatedLogoProps) => {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <img 
        src="/lovable-uploads/1fa307f8-c441-4f10-b335-6d843e7172f8.png"
        alt="M1SSION Logo"
        className={cn(
          "w-full h-full object-contain animate-neon-pulse",
          "transition-all duration-300 group-hover:scale-105"
        )}
      />
    </div>
  );
};

export default AnimatedLogo;
