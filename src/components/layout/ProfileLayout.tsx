
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      {/* Header sticky, glass */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text gradient-white-text">Profilo</h1>
        {/* esempio di avatar profilo con contorno story (solo header profilo) */}
        <span className="instagram-story-ring">
          <Avatar className="w-10 h-10 border-2 border-projectx-neon-blue bg-black">
            <AvatarImage src={localStorage.getItem('profileImage') || ""} alt="Profilo" />
            <AvatarFallback className="bg-transparent">
              <User className="w-6 h-6 text-projectx-neon-blue" />
            </AvatarFallback>
          </Avatar>
        </span>
      </header>
      <div className="h-[72px] w-full" />
      {children}
      <BottomNavigation />
    </div>
  );
};

export default ProfileLayout;

