
import React, { ReactNode } from "react";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";

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
    <div className="min-h-screen bg-black text-white relative">
      <div className="w-full h-full min-h-screen flex flex-col">
        <main className="flex-1 w-full pt-[72px] pb-16 max-w-screen-xl mx-auto px-2 sm:px-4">
          {children}
        </main>
        
        {showFooter && <Footer />}
        
        {/* Bottom Navigation - conditionally rendered but included in DOM */}
        <div className={showBottomNav ? "" : "hidden"}>
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
