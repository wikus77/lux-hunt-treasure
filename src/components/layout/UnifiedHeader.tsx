
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, X, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import M1ssionText from "@/components/logo/M1ssionText";
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";

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
  const [showCodeText, setShowCodeText] = useState(false);

  // Target date from utility
  const targetDate = getMissionDeadline();

  useEffect(() => {
    const savedAgentCode = localStorage.getItem('agentCode');
    if (savedAgentCode) {
      setAgentCode(savedAgentCode);
    }
    
    // Typewriter effect for agent dossier
    const timer = setTimeout(() => {
      setShowCodeText(true);
    }, 300);
    
    return () => clearTimeout(timer);
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:flex items-center mr-2"
          >
            <span className="text-cyan-400 font-mono text-xs mr-1">DOSSIER AGENTE:</span>
            <motion.span 
              className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded text-xs"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {agentCode}
            </motion.span>
          </motion.div>

          {/* Desktop menu with countdown */}
          <div className="hidden md:flex items-center">
            <CountdownTimer targetDate={targetDate} />
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border border-cyan-400/30 hover:border-cyan-400/70 transition-colors">
                      {profileImage ? (
                        <AvatarImage src={profileImage} alt="Profile" />
                      ) : (
                        <AvatarFallback className="bg-black">
                          <User className="h-4 w-4 text-cyan-400" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-cyan-400/30">
                  <DropdownMenuLabel className="text-white">Il mio profilo</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="mr-2 h-4 w-4 text-cyan-400" />
                    Profilo
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4 text-cyan-400" />
                    Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4 text-pink-500" />
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile agent code - only visible on small screens */}
        <motion.div 
          className="md:hidden flex justify-center items-center pb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-cyan-400 font-mono text-[10px] mr-1">DOSSIER:</span>
          <motion.span 
            className="font-mono text-white bg-cyan-900/30 px-1.5 py-0.5 rounded text-[10px]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {agentCode}
          </motion.span>
        </motion.div>

        {/* Mobile countdown - only visible on small screens */}
        <div className="md:hidden flex justify-center pb-2">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden glass-card border-t border-white/5 shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-5 space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/5"
              onClick={() => { navigate('/home'); setIsMobileMenuOpen(false); }}
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/5"
              onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
            >
              Profilo
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/5"
              onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}
            >
              Impostazioni
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/5"
              onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
            >
              Esci
            </Button>
          </div>
        </motion.div>
      )}

      {/* Horizontal line with animation */}
      <div className="line-glow"></div>
    </header>
  );
};

export default UnifiedHeader;
