
import React from "react";
import { User, Mail, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import M1ssionText from "@/components/logo/M1ssionText";

interface HomeHeaderProps {
  profileImage: string | null;
  unreadCount: number;
  onShowNotifications: () => void;
}

const HomeHeader = ({ profileImage, unreadCount, onShowNotifications }: HomeHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-projectx-card/40 border-b border-white/10 transition-all duration-300">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="w-8 h-8 border border-white/20 bg-black hover:border-white/40 transition-colors">
              <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-transparent">
                <User className="w-5 h-5 text-white/70" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>

        <div className="text-2xl font-bold">
          <M1ssionText />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 relative rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
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
            className="p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors"
            onClick={() => navigate("/settings")}
            aria-label="Impostazioni"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
