
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// Menu a tendina Shadcn
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [profileSubscription, setProfileSubscription] = useState<string>("Base");

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');

    // Carica immagine profilo da localStorage
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
    // Carica nome
    const savedProfileName = localStorage.getItem('profileName');
    if (savedProfileName) {
      setProfileName(savedProfileName);
    }
    // Carica tipo abbonamento (nel tuo esempio: sempre Base, altrimenti aggiungi logica)
    setProfileSubscription("Base");
  }, []);

  // Determina la title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/home") return "M1ssion";
    if (path === "/profile") return "Profilo";
    if (path === "/settings") return "Impostazioni";
    if (path === "/subscriptions") return "Abbonamenti";
    if (path === "/events") return "Eventi";
    if (path === "/notifications") return "Notifiche";
    return "M1ssion";
  };

  return (
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        {location.pathname === "/home" && (
          <div className="absolute left-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-projectx-neon-blue"
                  aria-label="Apri menu profilo"
                >
                  <Avatar className="w-8 h-8 border-2 border-projectx-neon-blue bg-black">
                    <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-transparent">
                      <User className="w-5 h-5 text-projectx-neon-blue" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="z-[110] bg-[#131a14]/90 min-w-[220px] backdrop-blur-lg border-projectx-neon-blue text-white shadow-lg">
                <DropdownMenuLabel className="font-bold text-projectx-neon-blue">Informazioni profilo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col items-center gap-2 py-2">
                  <Avatar className="w-14 h-14 border-2 border-projectx-neon-blue bg-black">
                    <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-transparent">
                      <User className="w-8 h-8 text-projectx-neon-blue" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base font-semibold">{profileName}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-0 select-text cursor-default">
                  <span className="text-muted-foreground text-sm">Abbonamento</span>
                  <span className="text-projectx-neon-blue text-base">{profileSubscription}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-0 select-text cursor-default">
                  <span className="text-muted-foreground text-sm">Account</span>
                  <span className="text-white text-base">{profileName}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer text-projectx-neon-blue hover:text-black hover:bg-projectx-neon-blue font-semibold justify-center"
                >
                  Vai al profilo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <h1
          className={
            "text-2xl font-bold neon-text flex-1 text-center select-none"
          }
          style={{
            background: "linear-gradient(90deg, #faff00 20%, #39FF14 60%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundClip: "text",
            textShadow:
              "0 0 12px #faff00, 0 0 24px #39FF14, 0 0 7px #39FF14, 0 0 21px #FFFF00",
          }}
        >
          {getPageTitle()}
        </h1>
      </header>
      <main className="flex-1 w-full relative pt-[72px] pb-16">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
