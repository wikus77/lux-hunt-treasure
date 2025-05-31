import React from "react";
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

  const isMapPage = location.pathname === "/map";
  const shouldShowCountdown = showCountdown && !isMapPage;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] min-h-[calc(44px+env(safe-area-inset-top))] w-full backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70 border-b border-white/10 header-safe-area ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Left logo o contenuto */}
          <div className="flex items-center">
            {leftContent || <M1ssionText />}
          </div>

          {/* Center (vuoto per ora) */}
          <div className="flex items-center justify-center" />

          {/* Right actions */}
          {rightContent && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {rightContent}
            </div>
          )}
        </div>

        {/* Countdown opzionale */}
        {shouldShowCountdown && <HeaderCountdown isMobile={isMobile} />}

        {/* Extra contenuto (eventuale) */}
        {children}
      </div>

      {/* Glow line inferiore */}
      <div className="line-glow" />
    </header>
  );
};

export default HeaderLayout;
