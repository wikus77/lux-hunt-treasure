
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#141414] text-white' 
        : 'bg-[#F2FCE2] text-gray-800'
    }`}>
      <main className={`flex-1 w-full mx-auto px-4 relative ${
        isDarkMode 
          ? 'bg-[#141414]' 
          : 'bg-[#F2FCE2]'
      }`}>
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-black/40 to-transparent' 
            : 'bg-gradient-to-b from-[#FEF7CD]/30 to-transparent'
        } opacity-40 pointer-events-none`} />
        <Outlet />
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
