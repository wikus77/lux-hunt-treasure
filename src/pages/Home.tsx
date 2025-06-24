
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import HeroSection from "@/components/home/HeroSection";
import MissionStatusBox from "@/components/home/MissionStatusBox";
import MissionConsole from "@/components/home/MissionConsole";
import MissionAgent from "@/components/home/MissionAgent";

const Home: React.FC = () => {
  const isMobile = useIsMobile();
  const { profileImage } = useProfileImage();

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader profileImage={profileImage} />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <HeroSection />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MissionStatusBox />
          <div className="space-y-6">
            <MissionConsole />
            <MissionAgent />
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Home;
