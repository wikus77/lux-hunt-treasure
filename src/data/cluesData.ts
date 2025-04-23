
export interface Clue {
  id: number;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType: "Base" | "Silver" | "Gold" | "Black";
}

export const clues: Clue[] = [
  {
    id: 1,
    title: "Posizione Attuale",
    description: "L'auto si trova in una città che inizia con la lettera 'M'.",
    week: 1,
    isLocked: false,
    subscriptionType: "Base"
  },
  {
    id: 2,
    title: "Specifiche Veicolo",
    description: "L'auto ha un motore V8 biturbo.",
    week: 1,
    isLocked: false,
    subscriptionType: "Silver"
  },
  {
    id: 3,
    title: "Dettagli Interni",
    description: "Gli interni sono in pelle nera con cuciture rosse.",
    week: 1,
    isLocked: false,
    subscriptionType: "Gold"
  },
  {
    id: 4,
    title: "Vista Esterna",
    description: "La carrozzeria presenta dettagli in fibra di carbonio.",
    week: 1,
    isLocked: false,
    subscriptionType: "Black"
  },
  {
    id: 5,
    title: "Optional Speciali",
    description: "L'auto è equipaggiata con un sistema audio premium.",
    week: 1,
    isLocked: false,
    subscriptionType: "Black"
  }
];
