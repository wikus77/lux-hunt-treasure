import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Mail, MoreVertical } from "lucide-react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NeonButton } from "@/components/ui/neon-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import HowItWorksModal from "../modals/HowItWorksModal";
import NotificationsDrawer from "../notifications/NotificationsDrawer";
import { Badge } from "@/components/ui/badge";
import AnimatedLogo from "../logo/AnimatedLogo";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const updateUnreadCount = () => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const count = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(count);
      }
    } catch (e) {
      console.error("Error updating unread count:", e);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');

    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
    const savedProfileName = localStorage.getItem('profileName');
    if (savedProfileName) {
      setProfileName(savedProfileName);
    }
    
    updateUnreadCount();
    
    const interval = setInterval(updateUnreadCount, 5000);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        updateUnreadCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  const handleShowNotifications = () => {
    setShowNotifications(true);
  };

  return (
    <div className="min-h-screen w-full bg-projectx-dark transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-projectx-card/40 border-b border-white/10 transition-all duration-300">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <NeonButton onClick={() => navigate("/home")}>
              M1SSION
            </NeonButton>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 relative rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              onClick={handleShowNotifications}
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

          <div className="line-glow"></div>
        </div>
      </header>
      
      <main className="flex-1 w-full relative pt-[72px] pb-16 max-w-screen-xl mx-auto">
        <div className="flex justify-center mb-8">
          <AnimatedLogo size="lg" />
        </div>
        <Outlet />
      </main>
      
      {showHowItWorks && (
        <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      )}
      
      <NotificationsDrawer
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
