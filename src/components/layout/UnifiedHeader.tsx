
import React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import M1ssionText from "@/components/logo/M1ssionText";
import HeaderCountdown from "@/components/layout/header/HeaderCountdown";
import { useLocation } from "react-router-dom";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  className?: string;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage,
  className = "",
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const isMapPage = location.pathname === "/map";
  const shouldShowCountdown = !isMapPage;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/50 border-b border-white/10 ${className}`}
      style={{
        top: '47px',
        paddingTop: '0px',
        marginTop: '0px'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <M1ssionText />
          </div>
          
          <div className="flex items-center justify-center">
            {/* Center content */}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            {profileImage && (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
        
        {shouldShowCountdown && <HeaderCountdown isMobile={isMobile} />}
      </div>
      
      <div className="line-glow"></div>
    </header>
  );
};

export default UnifiedHeader;
