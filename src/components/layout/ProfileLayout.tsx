
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import UnifiedHeader from "./UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNavigate } from "react-router-dom";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      <main className="pb-20 max-w-screen-xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default ProfileLayout;
