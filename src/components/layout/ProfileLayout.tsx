
import { ReactNode } from "react";
import UnifiedHeader from "./UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "./BottomNavigation";
import { motion } from "framer-motion";

interface ProfileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const ProfileLayout = ({ children, showBottomNav = true }: ProfileLayoutProps) => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
      
      <main className={`pb-20 ${isMobile ? "px-3" : "px-6"} max-w-screen-xl mx-auto`}>
        {children}
      </main>
      
      {/* Bottom Navigation - conditionally rendered */}
      {showBottomNav && (
        <BottomNavigation />
      )}
      
      {/* Subtle gradient overlay at bottom for visual depth */}
      <div className="fixed bottom-0 left-0 w-full h-[150px] pointer-events-none bg-gradient-to-t from-black to-transparent opacity-70 z-10" />
    </motion.div>
  );
};

export default ProfileLayout;
