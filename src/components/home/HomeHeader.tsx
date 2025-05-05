
import React, { useState, useEffect } from "react";
import { User, Mail, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import M1ssionText from "@/components/logo/M1ssionText";
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface HomeHeaderProps {
  profileImage: string | null;
  unreadCount: number;
  onShowNotifications: () => void;
}

const HomeHeader = ({ profileImage, unreadCount, onShowNotifications }: HomeHeaderProps) => {
  const navigate = useNavigate();
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [showCodeText, setShowCodeText] = useState(false);
  const isMobile = useIsMobile();
  
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
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10 transition-all duration-300">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="p-2 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="w-8 h-8 border border-white/20 bg-black hover:border-white/40 transition-colors">
                <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-transparent">
                  <User className="w-5 h-5 text-white/70" />
                </AvatarFallback>
              </Avatar>
            </Button>
            
            {/* Agent dossier code with typewriter effect - desktop only */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden sm:flex items-center ml-2"
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
          </div>

          <div className="text-2xl font-bold">
            <M1ssionText />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 relative rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation"
              onClick={onShowNotifications}
            >
              <Mail className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 font-bold border border-black w-5 h-5 flex items-center justify-center rounded-full text-xs bg-red-600 text-white ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
              onClick={() => navigate("/settings")}
              aria-label="Impostazioni"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile agent code - only visible on small screens */}
        <motion.div 
          className="sm:hidden flex justify-center items-center mt-1 mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-cyan-400 font-mono text-[10px] mr-1">DOSSIER AGENTE:</span>
          <motion.span 
            className="font-mono text-white bg-cyan-900/30 px-1.5 py-0.5 rounded text-[10px]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {agentCode}
          </motion.span>
        </motion.div>
        
        {/* Countdown Timer */}
        <div className="flex justify-center mt-1 sm:mt-2">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
