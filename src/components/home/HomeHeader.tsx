
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
  const isMobile = useIsMobile();
  
  // Target date from utility
  const targetDate = getMissionDeadline();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 py-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] touch-manipulation"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-white/20 bg-black hover:border-white/40 transition-colors">
                <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-transparent">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>

          <div className="text-xl sm:text-2xl font-bold">
            <M1ssionText />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="p-1.5 sm:p-2 relative rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] touch-manipulation"
              onClick={onShowNotifications}
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 font-bold border border-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[10px] sm:text-xs bg-red-600 text-white ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] touch-manipulation"
              onClick={() => navigate("/settings")}
              aria-label="Impostazioni"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Countdown Timer - separated to avoid overlapping */}
      <div className="flex justify-center py-1.5 bg-gradient-to-r from-black/40 via-cyan-950/20 to-black/40">
        <CountdownTimer targetDate={targetDate} />
      </div>
    </header>
  );
};

export default HomeHeader;
