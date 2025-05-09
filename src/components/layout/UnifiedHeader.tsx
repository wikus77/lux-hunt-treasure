
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import M1ssionText from "@/components/logo/M1ssionText";
import UserMenu from "./header/UserMenu";
import HeaderCountdown from "./header/HeaderCountdown";
import MobileMenuButton from "./header/MobileMenuButton";
import MobileMenu from "./header/MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  setProfileImage?: React.Dispatch<React.SetStateAction<string | null>>;
  onClickMail?: () => void;
  enableAvatarUpload?: boolean;
  leftComponent?: React.ReactNode;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage,
  setProfileImage,
  onClickMail,
  enableAvatarUpload,
  leftComponent,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDisabled, setIsProfileDisabled] = useState(false);

  useEffect(() => {
    // Check if current date is before July 19, 2025
    const launchDate = new Date('2025-07-19T00:00:00');
    const currentDate = new Date();
    
    setIsProfileDisabled(currentDate < launchDate);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full glass-backdrop">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16">
          <div className="flex items-center">
            {leftComponent}
            <M1ssionText />
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* User dropdown with disabled prop */}
              <UserMenu 
                profileImage={profileImage} 
                onSignOut={handleSignOut} 
                disabled={isProfileDisabled}
              />

              {/* Mobile menu button */}
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Countdown Timer - Moved to standalone component with mobile-specific rendering */}
        <HeaderCountdown isMobile={true} />
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onSignOut={handleSignOut}
      />

      {/* Horizontal line with animation */}
      <div className="line-glow"></div>
    </header>
  );
};

export default UnifiedHeader;
