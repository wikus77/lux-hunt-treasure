import React, { useState } from "react";
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

interface UnifiedHeaderProps {
  profileImage?: string | null;
  setProfileImage?: React.Dispatch<React.SetStateAction<string | null>>;
  onClickMail?: () => void;
  enableAvatarUpload?: boolean;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage,
  setProfileImage,
  onClickMail,
  enableAvatarUpload,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full glass-backdrop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <M1ssionText />

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="text-xs text-yellow-400 font-orbitron">
              IT IS POSSIBLE
            </div>
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
              className="w-full justify-start text-pink-500 hover:bg-white/5"
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
