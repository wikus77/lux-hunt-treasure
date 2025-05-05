
import { useState } from "react";

export const useProfileBadges = () => {
  // Achievements
  const [badges, setBadges] = useState([
    { id: "b1", name: "Primo Contatto", description: "Hai completato la tua prima missione", unlocked: true, pinned: true },
    { id: "b2", name: "Segugio", description: "Hai trovato 10 indizi", unlocked: true, pinned: false },
    { id: "b3", name: "Viaggiatore", description: "Hai esplorato 5 location diverse", unlocked: true, pinned: false },
    { id: "b4", name: "Decifratore", description: "Hai risolto un enigma di livello difficile", unlocked: false, pinned: false }
  ]);

  const togglePinBadge = (id: string) => {
    setBadges(badges.map(badge => 
      badge.id === id 
        ? {...badge, pinned: !badge.pinned} 
        : badge.id !== id && badge.pinned 
          ? {...badge, pinned: false} 
          : badge
    ));
  };

  return {
    badges,
    togglePinBadge
  };
};
