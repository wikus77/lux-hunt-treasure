
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    
    // Load profile image from localStorage
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Load profile image whenever page changes (in case it was updated on profile page)
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, [location.pathname]);

  // Function to determine title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/home") return "M1ssion";
    if (path === "/profile") return "Profilo";
    if (path === "/settings") return "Impostazioni";
    if (path === "/subscriptions") return "Abbonamenti";
    if (path === "/events") return "Eventi";
    if (path === "/notifications") return "Notifiche";
    
    // Default fallback
    return "M1ssion";
  };

  return (
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        {location.pathname === "/home" && (
          <div className="absolute left-4">
            <button
              className="flex items-center"
              onClick={() => navigate("/profile")}
              aria-label="Go to profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-projectx-neon-blue" />
                )}
              </div>
            </button>
          </div>
        )}
        {/* Title with text shadow matching bottom nav icon colors */}
        <h1
          className="text-2xl font-bold neon-text flex-1 text-center select-none"
          style={{
            textShadow:
              "0 0 6px #39FF14, 0 0 15px #FFFF00" // Neon green to yellow glow same as gradient used in bottom nav icons
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

