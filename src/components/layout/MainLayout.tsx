import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Mail, MoreVertical } from "lucide-react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import HowItWorksModal from "../modals/HowItWorksModal";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsDrawer from "../notifications/NotificationsDrawer";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use try/catch to prevent crashes with notifications
  let notifications = [];
  let unreadCount = 0;
  let markAllAsRead = () => {};
  let reloadNotifications = () => {};

  try {
    const notificationsData = useNotifications();
    notifications = notificationsData.notifications || [];
    unreadCount = notificationsData.unreadCount || 0;
    markAllAsRead = notificationsData.markAllAsRead || (() => {});
    reloadNotifications = notificationsData.reloadNotifications || (() => {});
  } catch (e) {
    console.error("Error loading notifications in MainLayout:", e);
  }

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
  }, []);

  const handleShowNotifications = () => {
    try {
      reloadNotifications();
      setShowNotifications(true);
    } catch (e) {
      console.error("Error showing notifications:", e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-projectx-dark transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-projectx-card/40 border-b border-white/10 transition-all duration-300">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none focus-visible:ring-2 focus-visible:ring-white/30" aria-label="Menu profilo">
                  <span className="profile-custom-ring">
                    <Avatar className="w-8 h-8 border border-white/20 bg-black hover:border-white/40 transition-colors cursor-pointer">
                      <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                      <AvatarFallback className="bg-transparent">
                        <User className="w-5 h-5 text-white/70" />
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[110] bg-black/90 backdrop-blur-lg border-white/10 text-white">
                <DropdownMenuLabel className="font-bold text-white/90">Menu profilo</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                  Vai al profilo
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setShowHowItWorks(true)}
                  className="cursor-pointer text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                  Come Funziona
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
            M1SSION
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 relative rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              onClick={handleShowNotifications}
            >
              <Mail className="w-5 h-5" />
              <span className={`absolute -top-1 -right-1 font-bold border border-black w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                unreadCount > 0
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}>
                {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : ""}
              </span>
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
      
      <main className="flex-1 w-full relative pt-[72px] pb-16 max-w-screen-xl mx-auto">
        <Outlet />
      </main>
      
      {showHowItWorks && (
        <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      )}
      
      {showNotifications && (
        <NotificationsDrawer
          open={showNotifications}
          onOpenChange={setShowNotifications}
        />
      )}
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
