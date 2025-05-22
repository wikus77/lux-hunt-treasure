
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
      "relative glass-card overflow-hidden bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg",
      className
    )}>
      {/* Gradient border at the top - matching exactly the reference image */}
      {showTopGradient && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
      )}
      {children}
    </div>
  );
};

export default GradientBox;
