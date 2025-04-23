
export interface MysteryPrize {
  imageUrl: string;
  description: string;
}

// User-provided car images for "Premi misteriosi dei prossimi eventi"
export const mysteryPrizes: MysteryPrize[] = [
  {
    imageUrl: "/lovable-uploads/32a96c45-2a5d-4579-bbb8-8bff4a195655.png",
    description: "Ferrari 488 GTB, eleganza italiana e prestazioni incredibili in pista."
  },
  {
    imageUrl: "/lovable-uploads/b9b5db19-1879-4050-866e-6cb044f50764.png",
    description: "Lamborghini Aventador, pura potenza e design mozzafiato."
  },
  {
    imageUrl: "/lovable-uploads/de89b561-2599-4f2c-a00c-d9cc1c2a0e81.png",
    description: "Lamborghini Aventador, lo stile italiano ai massimi livelli."
  }
];

// Use same car images for upcomingMysteryPrizes for consistent car-only theme
export const upcomingMysteryPrizes: MysteryPrize[] = [
  {
    imageUrl: "/lovable-uploads/32a96c45-2a5d-4579-bbb8-8bff4a195655.png",
    description: "Ferrari 488 GTB, l'eccellenza sportiva del Made in Italy."
  },
  {
    imageUrl: "/lovable-uploads/b9b5db19-1879-4050-866e-6cb044f50764.png",
    description: "Lamborghini Aventador, una leggenda su quattro ruote."
  },
  {
    imageUrl: "/lovable-uploads/de89b561-2599-4f2c-a00c-d9cc1c2a0e81.png",
    description: "Lamborghini Aventador, prestazioni e stile senza tempo."
  }
];
