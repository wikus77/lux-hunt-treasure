
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import M1ssionText from "@/components/logo/M1ssionText";
import UserMenu from "./header/UserMenu";
import AgentCodeDisplay from "./header/AgentCodeDisplay";
import HeaderCountdown from "./header/HeaderCountdown";
import MobileMenuButton from "./header/MobileMenuButton";
import MobileMenu from "./header/MobileMenu";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [agentCode, setAgentCode] = useState("AG-X480");

  useEffect(() => {
    const savedAgentCode = localStorage.getItem('agentCode');
    if (savedAgentCode) {
      setAgentCode(savedAgentCode);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full glass-backdrop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            {leftComponent}
            <M1ssionText />
          </div>

          {/* Agent dossier code with typewriter effect */}
          <AgentCodeDisplay agentCode={agentCode} />

          {/* Desktop menu with countdown */}
          <HeaderCountdown />

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* User dropdown */}
              <UserMenu profileImage={profileImage} onSignOut={handleSignOut} />

              {/* Mobile menu button */}
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Mobile agent code - only visible on small screens */}
        <AgentCodeDisplay agentCode={agentCode} isMobile={true} />

        {/* Mobile countdown - only visible on small screens */}
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
