
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GradientBox from "@/components/ui/gradient-box";

const Games: React.FC = () => {
  const isMobile = useIsMobile();
  const { profileImage } = useProfileImage();

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader profileImage={profileImage} />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] mb-4">
            MINI GAMES
          </h1>
          <p className="text-white/60">Giochi e sfide per guadagnare crediti extra</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GradientBox className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-[#00D1FF] mb-2">Target Rush</h3>
              <p className="text-white/60 mb-4">Colpisci i bersagli in movimento</p>
              <div className="text-[#FACC15] font-bold">+50 crediti</div>
            </div>
          </GradientBox>

          <GradientBox className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="text-xl font-bold text-[#00D1FF] mb-2">Puzzle Master</h3>
              <p className="text-white/60 mb-4">Risolvi enigmi complessi</p>
              <div className="text-[#FACC15] font-bold">+75 crediti</div>
            </div>
          </GradientBox>

          <GradientBox className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-[#00D1FF] mb-2">Speed Challenge</h3>
              <p className="text-white/60 mb-4">Velocità e precisione</p>
              <div className="text-[#FACC15] font-bold">+100 crediti</div>
            </div>
          </GradientBox>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Games;
