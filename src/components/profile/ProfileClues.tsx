
import { BookOpen, MapPin, Car, Image, Folder } from "lucide-react";
import ClueCard from "@/components/clues/ClueCard";
import React, { useState, useRef } from "react";

// Categoria e gradienti associati
const CATEGORY_STYLES: Record<
  string,
  { gradient: string; textColor: string }
> = {
  Luoghi: {
    gradient:
      "bg-gradient-to-r from-[#00a3ff] via-[#1eaedb] to-[#8b5cf6]", // blue-violet
    textColor: "text-white",
  },
  Car: {
    gradient:
      "bg-gradient-to-r from-[#a855f7] via-[#00a3ff] to-[#ec4899]", // purple-pink
    textColor: "text-white",
  },
  Photo: {
    gradient:
      "bg-gradient-to-r from-[#8b5cf6] via-[#00a3ff] to-[#22d3ee]", // blue-cyan
    textColor: "text-white",
  },
  General: {
    gradient:
      "bg-gradient-to-r from-[#35346a] via-[#7e69ab] to-[#1a1f2c]", // minimal dark
    textColor: "text-white",
  },
};

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

// Banner visuale per la categoria
function CategoryBanner({
  open,
  category,
  style,
  onClose,
  children,
}: {
  open: boolean;
  category: string | null;
  style: { gradient: string; textColor: string };
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-400 pointer-events-none ${open ? "translate-y-0 opacity-100" : "-translate-y-36 opacity-0"}`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div
        className={`rounded-b-xl px-6 py-4 shadow-lg max-w-md w-full flex flex-col items-center ${style.gradient} ${style.textColor} pointer-events-auto animate-fade-in`}
      >
        <div className="flex items-center gap-2 text-xl mb-2 font-orbitron font-bold uppercase">
          {category}
        </div>
        <div className="text-sm text-white opacity-90 text-center mb-2">
          {children}
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm mt-2 transition hover:bg-white/20 pointer-events-auto"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

const ProfileClues = ({ unlockedClues }: ProfileCluesProps) => {
  const groupedClues = groupCluesByCategory(unlockedClues);

  // Banner stato
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerCategory, setBannerCategory] = useState<null | string>(null);

  // Gestione messaggio della categoria (può essere personalizzato)
  const getBannerContent = (category: string) => {
    switch (category) {
      case "Luoghi":
        return (
          <>
            Indizi relativi ai LUOGHI: Trova tutte le località e posizioni che avvicineranno alla soluzione del mistero!<br />
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

  // Long press handler per categoria
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

  // Clic quick (desktop): mostro comunque il banner
  const handleCategoryClick = (category: string) => {
    setBannerCategory(category);
    setBannerOpen(true);
  };

  // Chiudi banner
  const closeBanner = () => setBannerOpen(false);

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
