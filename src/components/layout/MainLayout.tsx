
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white">
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;

