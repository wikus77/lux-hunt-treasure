
import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import M1ssionText from "@/components/logo/M1ssionText";
import HeaderCountdown from "@/components/layout/header/HeaderCountdown";
import AgentBadge from "@/components/AgentBadge";

interface HeaderLayoutProps {
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  showCountdown?: boolean;
  className?: string;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  children,
  rightContent,
  leftContent,
  showCountdown = true,
  className = "",
}) => {
  const isMobile = useIsMobile();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/50 border-b border-white/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            {leftContent}
            {!leftContent && <M1ssionText />}
          </div>
          
          {/* Center section with agent badge */}
          <div className="hidden md:flex items-center justify-center">
            <AgentBadge />
          </div>

          {/* Right side content */}
          {rightContent && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {rightContent}
            </div>
          )}
        </div>
        
        {/* Countdown Timer */}
        {showCountdown && <HeaderCountdown isMobile={isMobile} />}
        
        {/* Children content - for additional elements */}
        {children}
      </div>
      
      {/* Horizontal line with animation */}
      <div className="line-glow"></div>
    </header>
  );
};

export default HeaderLayout;
