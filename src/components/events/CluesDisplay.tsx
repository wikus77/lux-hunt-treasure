
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";

interface CluesDisplayProps {
  onClueUnlocked: (clueId: string) => void;
}

const CluesDisplay = ({ onClueUnlocked }: CluesDisplayProps) => {
  // Create a wrapper function that calls onClueUnlocked with the clueId
  const handleClueUnlocked = () => {
    // Generate a random clue ID if needed, or use a default one
    const randomClueId = Math.random().toString(36).substring(2, 15);
    onClueUnlocked(randomClueId);
  };

  return (
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
        onClueUnlocked={handleClueUnlocked}
      />
    </div>
  );
};

export default CluesDisplay;
