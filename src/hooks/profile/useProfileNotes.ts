
import { useState } from "react";

export const useProfileNotes = () => {
  // Personal notes
  const [personalNotes, setPersonNotes] = useState("Indizi sulla localizzazione del premio sembrano puntare a Nord...");

  const setPersonalNotes = (notes: string) => {
    setPersonNotes(notes);
  };

  return {
    personalNotes,
    setPersonalNotes
  };
};
