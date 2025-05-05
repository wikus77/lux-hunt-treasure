
import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import M1ssionText from "@/components/logo/M1ssionText";
import AgentCodeDisplay from "@/components/layout/header/AgentCodeDisplay";
import HeaderCountdown from "@/components/layout/header/HeaderCountdown";

interface HeaderLayoutProps {
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  showAgentCode?: boolean;
  showCountdown?: boolean;
  agentCode?: string;
  className?: string;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  children,
  rightContent,
  leftContent,
  showAgentCode = true,
  showCountdown = true,
  agentCode = "AG-X480",
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
            
            {/* Agent dossier code - desktop only */}
            {showAgentCode && !isMobile && <AgentCodeDisplay agentCode={agentCode} />}
          </div>

          {/* Right side content */}
          {rightContent && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {rightContent}
            </div>
          )}
        </div>

        {/* Mobile agent code - only visible on small screens */}
        {showAgentCode && isMobile && <AgentCodeDisplay agentCode={agentCode} isMobile={true} />}
        
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
