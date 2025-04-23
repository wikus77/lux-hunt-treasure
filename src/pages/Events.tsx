
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";

const Events = () => {
  // For updating profileImage
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <div className="h-[72px] w-full" />
      
      {/* Using the existing ProfileClues component with our clues data */}
      <div className="max-w-4xl mx-auto px-4">
        <ProfileClues unlockedClues={clues.map(clue => ({
          id: clue.id.toString(),
          title: clue.title,
          description: clue.description,
          week: clue.week,
          isLocked: clue.isLocked,
          subscriptionType: clue.subscriptionType
        }))} />
      </div>
    </div>
  );
};

export default Events;
