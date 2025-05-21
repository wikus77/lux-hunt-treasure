import { Button } from "@/components/ui/button";
import ClueCard from "@/components/clues/ClueCard";
import { clues } from "@/data/cluesData";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";

export const CluesSection = () => {
  const { unlockedClues, incrementUnlockedCluesAndAddClue, MAX_CLUES } = useBuzzClues();
  
  return (
    <section className="p-4 w-full">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-xl font-bold">Indizi Disponibili</h2>
        <div className="text-xs px-2 py-1 rounded-full bg-projectx-deep-blue">
          <span className="text-projectx-blue font-mono">{unlockedClues} / {MAX_CLUES}</span>
          <span className="text-gray-400 ml-1">sbloccati</span>
        </div>
      </div>
      
      {clues.map((clue) => (
        <ClueCard 
          key={clue.id} 
          title={clue.title} 
          description={clue.description} 
          week={clue.week} 
          isLocked={clue.isLocked} 
          subscriptionType={clue.subscriptionType}
        />
      ))}
      
      <div className="mt-6">
        <Button 
          className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
          onClick={incrementUnlockedCluesAndAddClue}
        >
          Sblocca Tutti gli Indizi
        </Button>
      </div>
    </section>
  );
};

export default CluesSection;
