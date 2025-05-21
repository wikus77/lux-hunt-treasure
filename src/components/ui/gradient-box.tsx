
import React from 'react';
import { cn } from "@/lib/utils";

interface GradientBoxProps {
  children: React.ReactNode;
  className?: string;
  showTopGradient?: boolean;
}

const GradientBox = ({ 
  children, 
  className,
  showTopGradient = true
}: GradientBoxProps) => {
  return (
    <div className={cn(
      "relative glass-card overflow-hidden",
      className
    )}>
      {/* Gradient border at the top */}
      {showTopGradient && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-80" />
      )}
      {children}
    </div>
  );
};

export default GradientBox;
