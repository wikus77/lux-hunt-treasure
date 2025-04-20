
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="pb-20 min-h-screen bg-black">
      {children}
      <BottomNavigation />
    </div>
  );
};

export default ProfileLayout;
