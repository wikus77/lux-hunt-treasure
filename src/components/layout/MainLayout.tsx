
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main content area with Apple-like blur effect */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-projectx-blue/10 to-transparent opacity-50 pointer-events-none" />
        <Outlet />
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
