
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
    <div 
      className={cn("relative m1ssion-glass-card overflow-hidden shadow-lg", className)}
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      {/* The top gradient is now handled by the m1ssion-glass-card class */}
      {children}
    </div>
  );
};

export default GradientBox;
