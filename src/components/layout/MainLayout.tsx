
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  const location = useLocation();
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

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
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">{getPageTitle()}</h1>
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
