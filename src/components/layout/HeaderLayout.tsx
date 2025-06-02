
import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import M1ssionText from "@/components/logo/M1ssionText";
import HeaderCountdown from "@/components/layout/header/HeaderCountdown";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  
  // Don't show countdown on map page
  const isMapPage = location.pathname === "/map";
  const shouldShowCountdown = showCountdown && !isMapPage;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/50 border-b border-white/10 ${className}`}
      style={{
        // CRITICAL FIX: Position below safe zone
        top: '47px',
        paddingTop: '0px',
        marginTop: '0px'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            {leftContent}
            {!leftContent && <M1ssionText />}
          </div>
          
          {/* Center section - removed M1-AGENT badge */}
          <div className="flex items-center justify-center">
            {/* Empty center area */}
          </div>

          {/* Right side content */}
          {rightContent && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {rightContent}
            </div>
          )}
        </div>
        
        {/* Countdown Timer - only show if not on map page */}
        {shouldShowCountdown && <HeaderCountdown isMobile={isMobile} />}
        
        {/* Children content - for additional elements */}
        {children}
      </div>
      
      {/* Horizontal line with animation */}
      <div className="line-glow"></div>
    </header>
  );
};

export default HeaderLayout;
