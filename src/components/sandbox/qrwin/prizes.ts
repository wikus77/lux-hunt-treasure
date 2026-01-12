// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * PRIZE DATA - Dati premi REALI per la missione M1SSION
 */

export interface Prize {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value?: string;
}

// Carousel principale - queste 4 immagini si alternano automaticamente
export const CAROUSEL_PRIZES: Prize[] = [
  {
    id: 'porsche-911-cabrio',
    title: 'Porsche 911 Cabrio',
    subtitle: 'La leggenda su quattro ruote',
    tag: 'SUPERCAR',
    imageUrl: '/assets/prizes/auto-reali/PORSCHE 911_CABRIO.png',
    rarity: 'legendary',
    value: '€150,000+',
  },
  {
    id: 'tudor',
    title: 'Tudor',
    subtitle: 'Eleganza senza tempo',
    tag: 'LUXURY WATCH',
    imageUrl: '/assets/prizes/orologi-reali/TUDOR.png',
    rarity: 'legendary',
    value: '€4,500+',
  },
  {
    id: 'chanel',
    title: 'Chanel',
    subtitle: 'Icona della haute couture',
    tag: 'FASHION',
    imageUrl: '/assets/prizes/borse-reali/CHANEL.png',
    rarity: 'legendary',
    value: '€8,000+',
  },
  {
    id: 'iphone-01',
    title: 'iPhone',
    subtitle: 'Il meglio della tecnologia',
    tag: 'TECH',
    imageUrl: '/assets/prizes/99premi/IPHONE_01.png',
    rarity: 'epic',
    value: '€1,200+',
  },
];

// Premi mini per la griglia - immagini random dalle cartelle reali
export const MINI_PRIZES_POOL: Prize[] = [
  // Auto
  {
    id: 'ferrari-purosangue',
    title: 'Ferrari Purosangue',
    subtitle: '',
    tag: 'AUTO',
    imageUrl: '/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png',
    rarity: 'legendary',
    value: '€400,000+',
  },
  {
    id: 'lamborghini',
    title: 'Lamborghini',
    subtitle: '',
    tag: 'AUTO',
    imageUrl: '/assets/prizes/auto-reali/LAMBORGHINI.png',
    rarity: 'legendary',
    value: '€300,000+',
  },
  {
    id: 'aston-martin',
    title: 'Aston Martin',
    subtitle: '',
    tag: 'AUTO',
    imageUrl: '/assets/prizes/auto-reali/ASTON_MARTIN.png',
    rarity: 'legendary',
    value: '€200,000+',
  },
  // Orologi
  {
    id: 'rolex-submariner',
    title: 'Rolex Submariner',
    subtitle: '',
    tag: 'OROLOGI',
    imageUrl: '/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png',
    rarity: 'legendary',
    value: '€40,000+',
  },
  {
    id: 'patek-philippe',
    title: 'Patek Philippe',
    subtitle: '',
    tag: 'OROLOGI',
    imageUrl: '/assets/prizes/orologi-reali/PATEK PHILIPPE.png',
    rarity: 'legendary',
    value: '€80,000+',
  },
  {
    id: 'omega',
    title: 'Omega',
    subtitle: '',
    tag: 'OROLOGI',
    imageUrl: '/assets/prizes/orologi-reali/OMEGA.png',
    rarity: 'epic',
    value: '€8,000+',
  },
  // Borse
  {
    id: 'hermes-birkin',
    title: 'Hermès Birkin',
    subtitle: '',
    tag: 'BORSE',
    imageUrl: '/assets/prizes/borse-reali/HERMES_BIRKIN.png',
    rarity: 'legendary',
    value: '€15,000+',
  },
  {
    id: 'louis-vuitton',
    title: 'Louis Vuitton',
    subtitle: '',
    tag: 'BORSE',
    imageUrl: '/assets/prizes/borse-reali/LOUIS VUITTON_CLASSIC.png',
    rarity: 'epic',
    value: '€3,500+',
  },
  {
    id: 'ysl',
    title: 'YSL',
    subtitle: '',
    tag: 'BORSE',
    imageUrl: '/assets/prizes/borse-reali/YLS.png',
    rarity: 'epic',
    value: '€2,800+',
  },
  // Gioielli
  {
    id: 'lingotto-oro',
    title: 'Lingotto d\'Oro',
    subtitle: '',
    tag: 'GIOIELLI',
    imageUrl: '/assets/prizes/gioielli-reali/LINGOTTO-ORO.png',
    rarity: 'legendary',
    value: '€50,000+',
  },
  {
    id: 'diamanti',
    title: 'Diamanti',
    subtitle: '',
    tag: 'GIOIELLI',
    imageUrl: '/assets/prizes/gioielli-reali/DIAMANTI.png',
    rarity: 'legendary',
    value: '€30,000+',
  },
  {
    id: 'bracciale-tennis',
    title: 'Bracciale Tennis',
    subtitle: '',
    tag: 'GIOIELLI',
    imageUrl: '/assets/prizes/gioielli-reali/BRACCIOALE TENNIS.png',
    rarity: 'epic',
    value: '€12,000+',
  },
  // Tech
  {
    id: 'macbook',
    title: 'MacBook Pro',
    subtitle: '',
    tag: 'TECH',
    imageUrl: '/assets/prizes/99premi/MACBOOK.png',
    rarity: 'rare',
    value: '€3,500+',
  },
  {
    id: 'apple-watch-ultra',
    title: 'Apple Watch Ultra',
    subtitle: '',
    tag: 'TECH',
    imageUrl: '/assets/prizes/99premi/APPLE WATCH_ULTRA.png',
    rarity: 'rare',
    value: '€900+',
  },
  {
    id: 'ipad-pro',
    title: 'iPad Pro',
    subtitle: '',
    tag: 'TECH',
    imageUrl: '/assets/prizes/99premi/IPAD_PRO.png',
    rarity: 'rare',
    value: '€1,500+',
  },
];

// Funzione per ottenere premi random
export function getRandomMiniPrizes(count: number = 6): Prize[] {
  const shuffled = [...MINI_PRIZES_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Export per compatibilità con codice esistente
export const HERO_PRIZE = CAROUSEL_PRIZES[0];
export const MINI_PRIZES = MINI_PRIZES_POOL.slice(0, 4);
