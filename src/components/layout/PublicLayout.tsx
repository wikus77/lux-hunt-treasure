
import React, { ReactNode } from "react";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showFooter = true
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="w-full h-full min-h-screen flex flex-col">
        <main className="flex-1 w-full pt-[72px] pb-16 max-w-screen-xl mx-auto px-2 sm:px-4">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default PublicLayout;
