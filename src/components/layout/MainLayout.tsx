
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
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

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Utente");
  const [profileSubscription, setProfileSubscription] = useState<string>("Base");

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

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/home") return "M1";
    if (path === "/profile") return "M1";
    if (path === "/settings") return "M1";
    if (path === "/subscriptions") return "M1";
    if (path === "/events") return "M1";
    if (path === "/notifications") return "M1";
    if (path === "/buzz") return "M1";
    if (path === "/map") return "M1";
    return "M1";
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
                  <span className="instagram-story-ring">
                    <Avatar className="w-8 h-8 border-2 border-projectx-neon-blue bg-black">
                      <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
                      <AvatarFallback className="bg-transparent">
                        <User className="w-5 h-5 text-projectx-neon-blue" />
                      </AvatarFallback>
                    </Avatar>
                  </span>
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
            "text-2xl font-bold neon-text flex-1 text-center select-none gradient-white-text"
          }
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
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
