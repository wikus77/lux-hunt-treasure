
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import UnifiedHeader from "./UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { profileImage } = useProfileImage();

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader 
        profileImage={profileImage}
        enableAvatarUpload={true}
        onClickMail={() => {}}
      />
      <div className="h-[72px] w-full" />
      <main className="pb-20 max-w-screen-xl mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProfileLayout;
