
export interface LuxuryCar {
  id: string;
  brand: string;
  name: string;
  description: string;
  shortDescription: string;
  engine: string;
  acceleration: string;
  prize: string;
  logo: string;
  imageUrl: string;
  color: string;
}

export const luxuryCarsData: LuxuryCar[] = [
  { 
    id: "ferrari",
    brand: 'Ferrari', 
    name: 'Ferrari 296 GTB',
    description: 'Potenza estrema, eleganza pura. La Ferrari 296 GTB rappresenta il perfetto equilibrio tra potenza ed efficienza, grazie alla tecnologia ibrida combinata con il leggendario design italiano.',
    shortDescription: 'L\'emblema del cavallino rampante, simbolo di potenza ed eccellenza italiana.',
    engine: 'V6 Ibrido, 830 CV',
    acceleration: '0-100 km/h in 2,9s',
    prize: 'In palio per il vincitore assoluto della competizione.',
    logo: '/lovable-uploads/c980c927-8cb1-4825-adf5-781f4d8118b9.png',
    imageUrl: '/lovable-uploads/fef309b6-b056-46ef-bb7f-b2ccacdb5ce3.png',
    color: '#FF0000', 
  },
  { 
    id: "mercedes",
    brand: 'Mercedes', 
    name: 'Mercedes AMG GT Black Series',
    description: 'Precisione ingegneristica tedesca al suo massimo. La AMG GT Black Series rappresenta l\'apice della tecnologia automobilistica Mercedes, con prestazioni da supercar e comfort di lusso.',
    shortDescription: 'La stella a tre punte, simbolo di lusso ed innovazione tedesca.',
    engine: 'V8 Biturbo, 730 CV',
    acceleration: '0-100 km/h in 3,2s',
    prize: 'Premio speciale per il secondo classificato nella competizione nazionale.',
    logo: '/lovable-uploads/b96df1db-6d05-4203-8811-d6770bd46b6d.png',
    imageUrl: '/lovable-uploads/f6925d8d-955c-4883-be54-6e6165691443.png',
    color: '#00D2FF', 
  },
  { 
    id: "porsche",
    brand: 'Porsche', 
    name: 'Porsche 911 GT3 RS',
    description: 'L\'iconica 911 nella sua forma più pura e potente. La GT3 RS è progettata per offrire sensazioni da pista in un\'auto omologata per strada, rappresentando la massima espressione della filosofia Porsche.',
    shortDescription: 'Lo stemma di Stoccarda, sinonimo di prestazioni e precisione tedesca.',
    engine: '4.0L Boxer 6 cilindri, 525 CV',
    acceleration: '0-100 km/h in 3,4s',
    prize: 'Premio esclusivo per i finalisti regionali della competizione.',
    logo: '/lovable-uploads/54cd25b0-fa7b-44c9-b7b6-d69dcc09df92.png',
    imageUrl: '/public/events/porsche-911.jpg',
    color: '#FFDA00', 
  },
  { 
    id: "lamborghini",
    brand: 'Lamborghini', 
    name: 'Lamborghini Huracán STO',
    description: 'Ispirata alle auto da corsa, la Huracán STO porta l\'esperienza delle competizioni su strada. Prestazioni estreme, design aggressivo e tecnologia all\'avanguardia in una delle supercar più desiderate al mondo.',
    shortDescription: 'Il toro, simbolo di forza e audacia del marchio di Sant\'Agata Bolognese.',
    engine: 'V10 5.2L, 640 CV',
    acceleration: '0-100 km/h in 3,0s',
    prize: 'Premio speciale per i vincitori delle sfide di abilità.',
    logo: '/lovable-uploads/794fb55d-30c8-462e-81e7-e72cc89815d4.png',
    imageUrl: '/public/events/lamborghini-huracan.jpg',
    color: '#FFC107', 
  },
  { 
    id: "mclaren",
    brand: 'McLaren', 
    name: 'McLaren 765LT Spider',
    description: 'La versione scoperta della straordinaria 765LT, con prestazioni da Formula 1 e un\'esperienza di guida a cielo aperto. La leggerezza e l\'aerodinamica perfetta la rendono un capolavoro di ingegneria.',
    shortDescription: 'L\'eredità della Formula 1 in una supercar stradale di lusso britannica.',
    engine: 'V8 4.0L Twin-Turbo, 765 CV',
    acceleration: '0-100 km/h in 2,8s',
    prize: 'Premio esclusivo per i vincitori delle sfide tecniche a tempo.',
    logo: '/lovable-uploads/6df12de9-c68f-493b-ac32-4dd934ed79a2.png',
    imageUrl: '/public/events/tesla-model-s.jpg', // Placeholder
    color: '#FF5500', 
  },
  { 
    id: "astonmartin",
    brand: 'Aston Martin', 
    name: 'Aston Martin Valkyrie',
    description: 'La collaborazione tra Aston Martin e Red Bull Racing ha creato questa hypercar estrema, progettata per essere la più vicina esperienza di guida di Formula 1 su strada. Tecnologia d\'avanguardia e prestazioni senza compromessi.',
    shortDescription: 'Le ali leggendarie, emblema di lusso ed eleganza britannica dal 1913.',
    engine: 'V12 6.5L + sistema ibrido, 1160 CV',
    acceleration: '0-100 km/h in 2,5s',
    prize: 'Premio speciale limitato per i vincitori della competizione internazionale.',
    logo: '/lovable-uploads/c52a635b-2c3c-4c4c-8dcf-c83776fea9d8.png',
    imageUrl: '/public/events/ferrari-sf90.jpg', // Placeholder
    color: '#FFD700', 
  }
];
