
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Menu, Mail, MoreVertical } from "lucide-react";
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

// Nuova importazione per la voce "Come Funziona"
import HowItWorksModal from "../modals/HowItWorksModal";
import { useNotifications } from "@/hooks/useNotifications";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [profileSubscription, setProfileSubscription] = useState<string>("Base");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Notifiche centralizzate
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    reloadNotifications
  } = useNotifications();

  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);

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
    setProfileSubscription("Base");
  }, []);

  // Rende il banner immediatamente up-to-date ad apertura
  const handleShowNotifications = () => {
    reloadNotifications();
    setShowNotificationsBanner(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

  return (
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        <div className="flex items-center gap-2">
          {/* Cornice custom intorno all'avatar */}
          <span className="profile-custom-ring">
            <Avatar className="w-8 h-8 border-2 border-projectx-neon-blue bg-black">
              <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-transparent">
                <User className="w-5 h-5 text-projectx-neon-blue" />
              </AvatarFallback>
            </Avatar>
          </span>
          {/* Menu dropdown del profilo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-projectx-neon-blue ml-2"
                aria-label="Apri menu profilo"
              >
                <Menu className="w-5 h-5 text-projectx-neon-blue" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[110] bg-[#131a14]/90 min-w-[220px] backdrop-blur-lg border-projectx-neon-blue text-white shadow-lg">
              <DropdownMenuLabel className="font-bold text-projectx-neon-blue">Menu profilo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-projectx-neon-blue hover:text-black hover:bg-projectx-neon-blue font-semibold justify-center"
              >
                Vai al profilo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowHowItWorks(true)}
                className="cursor-pointer text-white hover:text-black hover:bg-projectx-neon-blue font-semibold justify-center"
              >
                Come Funziona
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h1
          className="text-2xl font-bold text-center select-none"
          style={{
            background: "linear-gradient(to right, #4361ee, #7209b7)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundClip: "text",
          }}
        >
          M1SSION
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 relative rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors cursor-pointer"
            onClick={handleShowNotifications}
          >
            <Mail className="w-5 h-5" />
            <span className={`absolute -top-1 -right-1 font-bold border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs ${
              unreadCount > 0
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}>
              {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : ""}
            </span>
          </button>
          <button
            className="p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
            onClick={() => navigate("/settings")}
            aria-label="Impostazioni"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 w-full relative pt-[72px] pb-16">
        <Outlet />
      </main>
      {/* Modal "Come Funziona" */}
      {showHowItWorks && (
        <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      )}
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
