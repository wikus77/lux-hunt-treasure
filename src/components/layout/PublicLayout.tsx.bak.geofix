
import React, { ReactNode } from "react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { motion } from "framer-motion";

interface PublicLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showBottomNav?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showFooter = true,
  showBottomNav = false // Default to hidden for the public pages
}) => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full h-full min-h-screen flex flex-col">
        <main className="flex-1 w-full pt-[72px] pb-16 max-w-screen-xl mx-auto px-3 sm:px-6">
          {children}
        </main>
        
        {showFooter && <Footer />}
        
        {/* Bottom Navigation - conditionally rendered but included in DOM */}
        <div className={showBottomNav ? "" : "hidden"}>
          <BottomNavigation />
        </div>
        
        {/* Subtle gradient overlay at bottom for visual depth */}
        <div className="fixed bottom-0 left-0 w-full h-[150px] pointer-events-none bg-gradient-to-t from-black to-transparent opacity-70 z-10" />
      </div>
    </motion.div>
  );
};

export default PublicLayout;
