
import { BookOpen, MapPin, Car, Image, Folder } from "lucide-react";
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

// Funzione di categorizzazione: keywords facilmente aggiornabili
const clueCategories = [
  {
    name: "Luoghi",
    icon: MapPin,
    matcher: (clue: Clue) =>
      /città|luogo|parcheggi|parcheggiata|monumento|posizion|localizz|place|location|indirizzo|dove|map|via/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Car",
    icon: Car,
    matcher: (clue: Clue) =>
      /auto|car|modello|marca|veicolo|interno|esterno|motore|carrozzeria|carrozzerie|motori/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Photo",
    icon: Image,
    matcher: (clue: Clue) =>
      /foto|immagine|immagini|scatto|phot|picture|jpg|png|selfie/i.test(
        clue.title + " " + clue.description
      ),
  },
];

// Categoria Generica per indizi che non combaciano con le altre
const getClueCategory = (clue: Clue) => {
  for (const cat of clueCategories) {
    if (cat.matcher(clue)) return cat;
  }
  return { name: "General", icon: Folder };
};

// Organizza gli indizi per categoria
const groupCluesByCategory = (clues: Clue[]) => {
  const grouped: Record<string, { icon: any; clues: Clue[] }> = {};
  for (const clue of clues) {
    const cat = getClueCategory(clue);
    if (!grouped[cat.name]) grouped[cat.name] = { icon: cat.icon, clues: [] };
    grouped[cat.name].clues.push(clue);
  }
  return grouped;
};

const MAX_CLUES = 100;

const ProfileClues = ({ unlockedClues }: ProfileCluesProps) => {
  const groupedClues = groupCluesByCategory(unlockedClues);
  
  console.log("Unlocked clues:", unlockedClues);
  console.log("Grouped clues:", groupedClues);

  return (
    <div className="glass-card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" /> Indizi
        </h3>
        <span className="text-sm text-muted-foreground">
          {unlockedClues.length} / {MAX_CLUES} sbloccati
        </span>
      </div>
      
      {unlockedClues.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Non hai ancora sbloccato nessun indizio.</p>
          <p>Esplora gli eventi o usa il pulsante Buzz per ottenerne di nuovi!</p>
        </div>
      ) : (
        <div className="space-y-7">
          {Object.entries(groupedClues).map(([category, { icon: Icon, clues }]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-5 w-5 text-projectx-neon-blue" />
                <span className="font-semibold">{category}</span>
                <span className="ml-2 text-xs text-muted-foreground font-medium">{clues.length} indizi</span>
              </div>
              <div className="space-y-4">
                {clues.map((clue) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileClues;
