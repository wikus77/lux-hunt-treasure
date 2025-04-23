
import { BookOpen } from "lucide-react";
import ClueCard from "@/components/clues/ClueCard";
import React, { useState } from "react";
import CategoryBanner from "./CategoryBanner";
import { CATEGORY_STYLES, getClueCategory } from "./cluesCategories";
import groupCluesByCategory from "./groupCluesByCategory";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

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
  onClueUnlocked?: () => void;
}

const ProfileClues = ({ unlockedClues, onClueUnlocked }: ProfileCluesProps) => {
  const groupedClues = groupCluesByCategory(unlockedClues);
  const { unlockedClues: totalUnlockedClues, MAX_CLUES } = useBuzzClues();

  // Banner state
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerCategory, setBannerCategory] = useState<null | string>(null);

  // Message for categories
  const getBannerContent = (category: string) => {
    switch (category) {
      case "Luoghi":
        return (
          <>
            Indizi relativi ai LUOGHI: Trova tutte le località e posizioni che avvicineranno alla soluzione del mistero!
            <br />
            Tocca "Chiudi" per tornare indietro.
          </>
        );
      case "Car":
        return (
          <>
            Indizi sulla vettura: Scopri dettagli tecnici e curiosità sulla macchina misteriosa!
          </>
        );
      case "Foto Interni":
        return (
          <>
            Indizi fotografici interni: Scopri dettagli degli interni del veicolo!
          </>
        );
      case "Foto Esterni":
        return (
          <>
            Indizi fotografici esterni: Esamina la carrozzeria e l'aspetto esterno!
          </>
        );
      case "Equipaggiamento":
        return (
          <>
            Indizi sulla configurazione: Analizza le specifiche tecniche del veicolo!
          </>
        );
      case "General":
        return (
          <>
            Altri indizi utili: Qui trovi tutti gli indizi che non rientrano in altre categorie!
          </>
        );
      default:
        return "Categoria";
    }
  };

  // Close banner
  const closeBanner = () => setBannerOpen(false);

  // Update the clue unlock logic to call the callback
  const handleClueUnlock = () => {
    if (onClueUnlocked) {
      onClueUnlocked();
    }
  };

  // Log for debugging
  console.log("Grouped Clues:", groupedClues);
  console.log("Available Categories:", Object.keys(groupedClues));

  return (
    <div className="glass-card mt-4 relative">
      <CategoryBanner
        open={bannerOpen}
        category={bannerCategory}
        style={
          bannerCategory
            ? CATEGORY_STYLES[bannerCategory] || CATEGORY_STYLES["General"]
            : CATEGORY_STYLES["General"]
        }
        onClose={closeBanner}
      >
        {bannerCategory ? getBannerContent(bannerCategory) : null}
      </CategoryBanner>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" /> Indizi
        </h3>
        <span className="text-sm text-muted-foreground">
          {totalUnlockedClues} / {MAX_CLUES} sbloccati
        </span>
      </div>

      {unlockedClues.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Non hai ancora sbloccato nessun indizio.</p>
          <p>Esplora gli eventi o usa il pulsante Buzz per ottenerne di nuovi!</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {Object.entries(groupedClues).map(([category, { icon, clues }]) => {
            // Properly handle the dynamic icon component
            const IconComponent = icon;
            
            return (
              <AccordionItem 
                key={category} 
                value={category}
                className="border border-projectx-blue/20 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className={`px-4 py-2 ${CATEGORY_STYLES[category]?.gradient || CATEGORY_STYLES["General"].gradient}`}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-white drop-shadow" />
                    <span className={`font-semibold ${CATEGORY_STYLES[category]?.textColor || "text-white"}`}>
                      {category}
                    </span>
                    <span className="ml-2 text-xs opacity-80">{clues.length} indizi</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-black/40 backdrop-blur-sm p-4">
                  <div className="space-y-4">
                    {clues.map((clue: Clue) => (
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
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default ProfileClues;
