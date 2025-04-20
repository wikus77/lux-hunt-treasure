
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for Netflix style

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
    }`}>
      {/* Theme toggle button - fixed position */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* Main content area with Netflix-like design */}
      <main className={`flex-1 w-full mx-auto px-4 relative ${
        isDarkMode ? 'bg-[#141414]' : 'bg-white'
      }`}>
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-black/40 to-transparent' 
            : 'bg-gradient-to-b from-gray-50/50 to-transparent'
        } opacity-50 pointer-events-none`} />
        <Outlet />
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
