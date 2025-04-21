
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
    <div className="min-h-screen w-full bg-black transition-colors duration-300 text-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        {/* La header principale viene gestita dalle singole pagine */}
      </header>
      <main className="flex-1 w-full relative pt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;

