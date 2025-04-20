
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
    title: "Primo Indizio",
    description: "L'auto si trova in una città che inizia con la lettera 'M'.",
    week: 1,
    isLocked: false,
    subscriptionType: "Base"
  },
  {
    id: 2,
    title: "Colore e Dettagli",
    description: "L'auto è di colore rosso con dettagli in fibra di carbonio.",
    week: 1,
    isLocked: true,
    subscriptionType: "Silver"
  },
  {
    id: 3,
    title: "Localizzazione",
    description: "L'auto è parcheggiata vicino a un famoso monumento.",
    week: 1,
    isLocked: true,
    subscriptionType: "Gold"
  },
  {
    id: 4,
    title: "Coordinate Precise",
    description: "Coordinate GPS precise della posizione dell'auto.",
    week: 1,
    isLocked: true,
    subscriptionType: "Black"
  }
];

