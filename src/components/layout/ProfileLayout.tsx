
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      {/* Header space reservation */}
      <div className="h-[72px] w-full" />
      
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center border-b border-projectx-deep-blue bg-black py-2">
        <h1 className="text-xl font-bold gradient-white-text">M1SSION</h1>
        <p className="text-xs text-projectx-neon-blue">it is possible</p>
      </div>
      
      {children}
      
      <BottomNavigation />
    </div>
  );
};

export default ProfileLayout;
