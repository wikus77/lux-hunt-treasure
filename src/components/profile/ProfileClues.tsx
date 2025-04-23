import { BookOpen } from "lucide-react";
import ClueCard from "@/components/clues/ClueCard";
import React, { useState, useRef } from "react";
import CategoryBanner from "./CategoryBanner";
import { CATEGORY_STYLES, getClueCategory } from "./cluesCategories";
import groupCluesByCategory from "./groupCluesByCategory";

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

const MAX_CLUES = 100;

const ProfileClues = ({ unlockedClues, onClueUnlocked }: ProfileCluesProps) => {
  const groupedClues = groupCluesByCategory(unlockedClues);

  // Banner stato
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerCategory, setBannerCategory] = useState<null | string>(null);

  // Messaggio per le categorie
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
      case "Photo":
        return (
          <>
            Indizi fotografici: Raccogli e analizza le immagini per risolvere l’enigma!
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

  // Long press handler
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePressStart = (category: string) => {
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
    pressTimeout.current = setTimeout(() => {
      setBannerCategory(category);
      setBannerOpen(true);
    }, 500); // 500ms: long press
  };
  const handlePressEnd = () => {
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
  };

  // Click desktop
  const handleCategoryClick = (category: string) => {
    setBannerCategory(category);
    setBannerOpen(true);
  };

  // Chiudi banner
  const closeBanner = () => setBannerOpen(false);

  // Update the clue unlock logic to call the callback
  const handleClueUnlock = () => {
    if (onClueUnlocked) {
      onClueUnlocked();
    }
  };

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
              <div
                className={`flex items-center gap-2 mb-2 rounded-lg px-4 py-2 cursor-pointer select-none ${CATEGORY_STYLES[category]?.gradient || CATEGORY_STYLES["General"].gradient} hover:scale-105 transition-transform`}
                onPointerDown={e => handlePressStart(category)}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onTouchStart={e => handlePressStart(category)}
                onTouchEnd={handlePressEnd}
                onClick={() => handleCategoryClick(category)}
              >
                <Icon className="h-5 w-5 text-white drop-shadow" />
                <span className={`font-semibold ${CATEGORY_STYLES[category]?.textColor || "text-white"}`}>{category}</span>
                <span className="ml-2 text-xs opacity-80">{clues.length} indizi</span>
              </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileClues;
