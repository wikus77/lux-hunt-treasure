// Dati per le aree della mappa BUZZ
export interface MapArea {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in metri
  buzzCost: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  rewards: string[];
  isActive: boolean;
  discoveredAt?: string;
  completedAt?: string;
  hints: string[];
}

export const mapAreasData: MapArea[] = [
  // Zone Facili (1-2 BUZZ)
  {
    id: 'area_001',
    name: 'Porta Garibaldi',
    description: 'Zona commerciale con alta densità di telecamere di sorveglianza.',
    coordinates: { lat: 45.4853, lng: 9.1877 },
    radius: 500,
    buzzCost: 1,
    difficulty: 'easy',
    rewards: ['Indizio Base', '+50 XP'],
    isActive: true,
    hints: [
      'Guarda verso i grattacieli',
      'Le telecamere registrano tutto',
      'Orario di punta: 18:00-20:00'
    ]
  },
  {
    id: 'area_002',
    name: 'Navigli',
    description: 'Canali storici di Milano, zona di ritrovo serale.',
    coordinates: { lat: 45.4517, lng: 9.1782 },
    radius: 800,
    buzzCost: 2,
    difficulty: 'easy',
    rewards: ['Documento Cifrato', '+75 XP'],
    isActive: true,
    hints: [
      'I riflessi sull\'acqua nascondono segreti',
      'Ascolta le conversazioni nei bar',
      'Le barche partono ogni 30 minuti'
    ]
  },
  {
    id: 'area_003',
    name: 'Corso Buenos Aires',
    description: 'Via dello shopping con traffico intenso.',
    coordinates: { lat: 45.4781, lng: 9.2072 },
    radius: 600,
    buzzCost: 2,
    difficulty: 'easy',
    rewards: ['Traccia GPS', '+60 XP'],
    isActive: true,
    hints: [
      'Il rumore nasconde altri suoni',
      'Vetrine come specchi',
      'Metro Porta Venezia è il punto di riferimento'
    ]
  },

  // Zone Medie (3-4 BUZZ)
  {
    id: 'area_004',
    name: 'Quadrilatero della Moda',
    description: 'Zona esclusiva con boutique di lusso e sicurezza privata.',
    coordinates: { lat: 45.4676, lng: 9.1926 },
    radius: 400,
    buzzCost: 3,
    difficulty: 'medium',
    rewards: ['Chiave Digitale', 'Accesso VIP', '+100 XP'],
    isActive: true,
    hints: [
      'Lusso significa sicurezza avanzata',
      'Le guardie cambiano turno ogni 4 ore',
      'Via Montenapoleone è il cuore'
    ]
  },
  {
    id: 'area_005',
    name: 'Porta Nuova',
    description: 'Distretto finanziario con architettura moderna.',
    coordinates: { lat: 45.4854, lng: 9.1897 },
    radius: 1000,
    buzzCost: 4,
    difficulty: 'medium',
    rewards: ['Codice di Accesso', 'Mappa Segreta', '+125 XP'],
    isActive: true,
    hints: [
      'I grattacieli hanno occhi elettronici',
      'Bosco Verticale nasconde antenne',
      'Piazza Gae Aulenti è sotto sorveglianza 24/7'
    ]
  },

  // Zone Difficili (5-6 BUZZ)
  {
    id: 'area_006',
    name: 'Castello Sforzesco',
    description: 'Fortezza storica con sistemi di sicurezza all\'avanguardia.',
    coordinates: { lat: 45.4706, lng: 9.1795 },
    radius: 700,
    buzzCost: 5,
    difficulty: 'hard',
    rewards: ['Documento Storico', 'Passaggio Segreto', '+150 XP'],
    isActive: true,
    hints: [
      'La storia si ripete in digitale',
      'Torri medievali con tecnologia moderna',
      'Parco Sempione è la via di fuga'
    ]
  },
  {
    id: 'area_007',
    name: 'Teatro alla Scala',
    description: 'Tempio dell\'opera con protocolli di sicurezza rigidi.',
    coordinates: { lat: 45.4678, lng: 9.1895 },
    radius: 300,
    buzzCost: 6,
    difficulty: 'hard',
    rewards: ['Invito Esclusivo', 'Codice Artistico', '+175 XP'],
    isActive: true,
    hints: [
      'La musica maschera le comunicazioni',
      'Palchi reali hanno accessi privati',
      'Galleria Vittorio Emanuele è collegata'
    ]
  },

  // Zone Estreme (7-10 BUZZ)
  {
    id: 'area_008',
    name: 'Aeroporto Malpensa',
    description: 'Hub internazionale con sicurezza di livello militare.',
    coordinates: { lat: 45.6306, lng: 8.7281 },
    radius: 2000,
    buzzCost: 8,
    difficulty: 'extreme',
    rewards: ['Manifesto di Volo', 'Codice Doganale', 'Accesso Hangar', '+250 XP'],
    isActive: false, // Bloccata inizialmente
    hints: [
      'Terminal 1 ha una sezione riservata',
      'Radar tracking 24/7',
      'Gate privati per jet personali'
    ]
  },
  {
    id: 'area_009',
    name: 'Monza Circuit',
    description: 'Autodromo leggendario con garage privati.',
    coordinates: { lat: 45.6156, lng: 9.2811 },
    radius: 1500,
    buzzCost: 10,
    difficulty: 'extreme',
    rewards: ['Chiave del Garage', 'Documento di Gara', 'Premio Finale', '+300 XP'],
    isActive: false, // Bloccata inizialmente
    hints: [
      'Curve leggendarie nascondono segreti',
      'Box privati hanno accessi speciali',
      'Parabolica è il punto chiave'
    ]
  }
];

// Utility per ottenere aree per difficoltà
export const getAreasByDifficulty = (difficulty: MapArea['difficulty']) => {
  return mapAreasData.filter(area => area.difficulty === difficulty);
};

// Utility per ottenere aree attive
export const getActiveAreas = () => {
  return mapAreasData.filter(area => area.isActive);
};

// Utility per calcolare distanza tra due punti
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Radio terrestre in metri
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distanza in metri
};

// Utility per verificare se un punto è dentro un'area
export const isPointInArea = (
  userLat: number,
  userLng: number,
  area: MapArea
): boolean => {
  const distance = calculateDistance(
    userLat,
    userLng,
    area.coordinates.lat,
    area.coordinates.lng
  );
  return distance <= area.radius;
};

// Colori per difficoltà
export const difficultyColors = {
  easy: 'hsl(120, 100%, 40%)',    // Verde
  medium: 'hsl(45, 100%, 50%)',   // Giallo
  hard: 'hsl(30, 100%, 50%)',     // Arancione
  extreme: 'hsl(0, 100%, 50%)'    // Rosso
};

// Icone per difficoltà
export const difficultyIcons = {
  easy: '🟢',
  medium: '🟡',
  hard: '🟠',
  extreme: '🔴'
};