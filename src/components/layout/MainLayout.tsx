
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#ffffff] text-[#1d1d1f]'}`}>
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

      {/* Main content area with Apple-like minimal design */}
      <main className={`flex-1 max-w-[1200px] w-full mx-auto px-4 font-['Inter'] relative ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}>
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-projectx-blue/5 to-transparent' 
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
