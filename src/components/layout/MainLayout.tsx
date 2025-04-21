
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Menu } from "lucide-react";
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

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [profileSubscription, setProfileSubscription] = useState<string>("Base");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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

  // Logo testuale sempre "M1"
  const getPageTitle = () => "M1";

  return (
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        <div className="absolute left-4 flex items-center gap-2">
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
          className="text-2xl font-bold neon-text flex-1 text-center select-none gradient-white-text"
          style={{
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundClip: "text",
          }}
        >
          {getPageTitle()}
        </h1>
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
