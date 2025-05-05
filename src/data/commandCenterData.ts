
export interface Mission {
  id: string;
  name: string;
  status: 'active' | 'danger' | 'completed';
  description: string;
  location: string;
  coordinates: [number, number]; // [lat, lng]
  objectives: Objective[];
  timeRemaining?: number; // in seconds, optional for timed missions
  threatLevel: 1 | 2 | 3; // 1: low, 2: medium, 3: high
  activeArea: string;
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface IntelFeed {
  id: string;
  message: string;
  timestamp: number;
  type: 'map' | 'buzz' | 'notification' | 'general';
  location?: string;
  urgency: 'standard' | 'urgent' | 'critical';
  read: boolean;
}

export interface AnalysisItem {
  id: string;
  type: 'clue' | 'location' | 'person' | 'object';
  title: string;
  description: string;
  imageUrl?: string;
  connections: string[]; // IDs of connected items
}

// Sample data for the active mission
export const activeMission: Mission = {
  id: "mission-001",
  name: "Operazione Fantasma",
  status: 'active',
  description: "Identificare e neutralizzare la minaccia emergente nella zona urbana di Milano.",
  location: "Milano, Italia",
  coordinates: [45.4642, 9.1900],
  threatLevel: 2,
  activeArea: "Centro Città",
  objectives: [
    {
      id: "obj-001",
      description: "Localizzare i 3 indizi nascosti nella piazza centrale",
      completed: true,
      priority: 'high'
    },
    {
      id: "obj-002",
      description: "Decifrare il messaggio criptato dal terminale",
      completed: false,
      priority: 'medium'
    },
    {
      id: "obj-003",
      description: "Identificare l'agente infiltrato",
      completed: false,
      priority: 'high'
    }
  ],
  timeRemaining: 86400 // 24 hours in seconds
};

// Sample intelligence feed data
export const intelFeed: IntelFeed[] = [
  {
    id: "intel-001",
    message: "Nuova attività sospetta rilevata a Milano",
    timestamp: Date.now() - 300000, // 5 minutes ago
    type: 'map',
    location: "Milano, Via Montenapoleone",
    urgency: 'urgent',
    read: false
  },
  {
    id: "intel-002",
    message: "HQ: File cifrato in arrivo",
    timestamp: Date.now() - 1200000, // 20 minutes ago
    type: 'notification',
    urgency: 'standard',
    read: false
  },
  {
    id: "intel-003",
    message: "Nuovo indizio sbloccato: Chiave Enigmatica",
    timestamp: Date.now() - 3600000, // 1 hour ago
    type: 'buzz',
    urgency: 'standard',
    read: true
  },
  {
    id: "intel-004",
    message: "Attività nemica aumentata del 27% nell'ultima ora",
    timestamp: Date.now() - 7200000, // 2 hours ago
    type: 'general',
    urgency: 'critical',
    read: true
  }
];

// Sample analysis board items
export const analysisItems: AnalysisItem[] = [
  {
    id: "analysis-001",
    type: 'clue',
    title: "Chiave Enigmatica",
    description: "Una chiave con strani simboli trovata vicino alla fontana",
    imageUrl: "/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png",
    connections: ["analysis-003"]
  },
  {
    id: "analysis-002",
    type: 'location',
    title: "Duomo di Milano",
    description: "Punto di incontro sospetto, diverse segnalazioni",
    imageUrl: "/lovable-uploads/d6dc12b2-928f-4448-b728-f5e59b6175a8.png",
    connections: ["analysis-004"]
  },
  {
    id: "analysis-003",
    type: 'person',
    title: "Contatto Misterioso",
    description: "Persona avvistata più volte in zone sospette",
    imageUrl: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png",
    connections: ["analysis-001", "analysis-002"]
  },
  {
    id: "analysis-004",
    type: 'object',
    title: "Dispositivo Sconosciuto",
    description: "Apparato elettronico di origine sconosciuta",
    imageUrl: "/lovable-uploads/49a73ae5-c836-4c5d-8e07-0555edac931d.png",
    connections: ["analysis-002"]
  }
];
