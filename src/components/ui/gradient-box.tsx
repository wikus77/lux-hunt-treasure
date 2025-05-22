
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
      "relative m1ssion-glass-card overflow-hidden bg-black/60 backdrop-blur-xl shadow-lg",
      className
    )}>
      {/* The top gradient is now handled by the m1ssion-glass-card class */}
      {children}
    </div>
  );
};

export default GradientBox;
