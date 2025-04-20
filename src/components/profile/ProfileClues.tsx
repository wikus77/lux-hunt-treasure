
import { BookOpen } from "lucide-react";
import ClueCard from "@/components/clues/ClueCard";

interface Clue {
  id: string;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType?: "Base" | "Silver" | "Gold" | "Black";
}

interface ProfileCluesProps {
  unlockedClues: Clue[];
}

const ProfileClues = ({ unlockedClues }: ProfileCluesProps) => {
  return (
    <div className="glass-card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" /> Indizi
        </h3>
        <span className="text-sm text-muted-foreground">
          {unlockedClues.length} / 10 sbloccati
        </span>
      </div>
      
      {unlockedClues.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Non hai ancora sbloccato nessun indizio.</p>
          <p>Esplora gli eventi o usa il pulsante Buzz per ottenerne di nuovi!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unlockedClues.map((clue) => (
            <ClueCard
              key={clue.id}
              title={clue.title}
              description={clue.description}
              week={clue.week}
              isLocked={false}
              subscriptionType={clue.subscriptionType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileClues;
