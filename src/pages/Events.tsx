
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";
import { FileSearch } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";

const Events = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { unlockedClues, incrementUnlockedCluesAndAddClue } = useBuzzClues();
  
  useEffect(() => {
    // Get profile image on mount
    setProfileImage(localStorage.getItem('profileImage'));
    
    // Only add test clues if we have none yet - check localStorage directly
    const currentUnlockedClues = localStorage.getItem('unlockedCluesCount');
    
    if (!currentUnlockedClues || currentUnlockedClues === '0') {
      console.log("Adding initial test clues");
      // Add only 3 test clues in total, not one per render
      incrementUnlockedCluesAndAddClue();
      incrementUnlockedCluesAndAddClue();
      incrementUnlockedCluesAndAddClue();
    } else {
      console.log("Not adding test clues, current count:", currentUnlockedClues);
    }
  }, []); // Empty dependency array to run only once

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-projectx-blue" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
              I miei indizi
            </h1>
          </div>
          <div className="text-sm px-3 py-1 rounded-full bg-projectx-deep-blue/50 backdrop-blur-sm border border-projectx-blue/20">
            <span className="text-projectx-blue font-mono">
              {unlockedClues} / {MAX_CLUES} 
            </span>
            <span className="text-gray-400 ml-1">sbloccati</span>
          </div>
        </div>

        <div className="glass-card p-4 backdrop-blur-md border border-projectx-blue/10 rounded-xl">
          <ProfileClues 
            unlockedClues={clues.map(clue => ({
              id: clue.id.toString(),
              title: clue.title,
              description: clue.description,
              week: clue.week,
              isLocked: clue.isLocked,
              subscriptionType: clue.subscriptionType
            }))}
            onClueUnlocked={incrementUnlockedCluesAndAddClue}
          />
        </div>
      </div>
    </div>
  );
};

// Add the MAX_CLUES constant to the file
const MAX_CLUES = 1000;

export default Events;
