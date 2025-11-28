// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Dev-only mock data provider for /map-3d-tiler
 * Controlled by VITE_MAP3D_DEV_MOCKS env var
 * Provides: agents, rewards, notes seed, user areas, search areas
 */

import type { AgentDTO } from '@/features/living-map/adapters/readOnlyData';

type RewardMarker = { 
  id: string; 
  lat: number; 
  lng: number; 
  type: 'M1U' | 'PULSE' | 'PRIZE';
  title: string;
};

type Note = { 
  id: string; 
  lat: number; 
  lng: number; 
  title: string; 
  note: string;
};

type Area = { 
  id: string; 
  lat: number; 
  lng: number; 
  radius: number;
};

const DEV = import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true';

// Generate stable UUID-like IDs for dev (deterministic)
const generateId = (prefix: string, index: number) => 
  `${prefix}-${String(index).padStart(4, '0')}-dev-mock-${Date.now().toString(36)}`;

export function use3DDevMocks() {
  if (!DEV) {
    return {
      agents: [] as AgentDTO[],
      rewards: [] as RewardMarker[],
      notesSeed: [] as Note[],
      userAreas: [] as Area[],
      searchAreas: [] as Area[],
    };
  }

  // 1) AGENTS (red dots) - 10 GLOBAL mock agents for battle testing
  // Scattered around the world for long-distance attack testing
  const globalLocations = [
    { name: 'USA', lat: 40.7128, lng: -74.0060, code: 'AG-USA' },      // New York
    { name: 'RUSSIA', lat: 55.7558, lng: 37.6173, code: 'AG-RUSSIA' }, // Moscow
    { name: 'CHINA', lat: 39.9042, lng: 116.4074, code: 'AG-CHINA' },  // Beijing
    { name: 'AUSTRALIA', lat: -33.8688, lng: 151.2093, code: 'AG-AUSSIE' }, // Sydney
    { name: 'BRAZIL', lat: -23.5505, lng: -46.6333, code: 'AG-BRAZIL' }, // Sao Paulo
    { name: 'JAPAN', lat: 35.6762, lng: 139.6503, code: 'AG-JAPAN' },  // Tokyo
    { name: 'UK', lat: 51.5074, lng: -0.1278, code: 'AG-UK' },         // London
    { name: 'EGYPT', lat: 30.0444, lng: 31.2357, code: 'AG-EGYPT' },   // Cairo
    { name: 'INDIA', lat: 28.6139, lng: 77.2090, code: 'AG-INDIA' },   // Delhi
    { name: 'SOUTH_AFRICA', lat: -33.9249, lng: 18.4241, code: 'AG-SAFRICA' }, // Cape Town
  ];
  
  const agents: AgentDTO[] = globalLocations.map((loc, i) => ({
    id: `fake-agent-${i}`, // IMPORTANT: Must start with "fake-agent-" for battle detection!
    username: loc.code,
    agent_code: loc.code,
    status: (i % 3 === 0 ? 'idle' : 'online') as 'online' | 'idle' | 'offline',
    lat: loc.lat + (Math.random() * 0.01 - 0.005), // Small random offset
    lng: loc.lng + (Math.random() * 0.01 - 0.005),
    avatar_url: undefined,
    lastSeen: new Date().toISOString()
  }));

  // 2) REWARDS - 3 mock markers with valid structure
  const rewards: RewardMarker[] = [
    { 
      id: generateId('reward', 0), 
      lat: 43.811, 
      lng: 7.634, 
      type: 'M1U',
      title: 'Bonus +50 M1U' 
    },
    { 
      id: generateId('reward', 1), 
      lat: 43.806, 
      lng: 7.645, 
      type: 'PRIZE',
      title: 'Prize Hint Chest' 
    },
    { 
      id: generateId('reward', 2), 
      lat: 43.799, 
      lng: 7.651, 
      type: 'PULSE',
      title: 'Pulse Energy +5' 
    },
  ];

  // 3) NOTES - seed for localStorage
  const notesSeed: Note[] = [
    { 
      id: generateId('note', 0), 
      lat: 43.803, 
      lng: 7.642, 
      title: 'Checkpoint Alpha', 
      note: 'Vista panoramica mare - verifica POI iniziale' 
    },
    { 
      id: generateId('note', 1), 
      lat: 43.809, 
      lng: 7.637, 
      title: 'Idea Porto', 
      note: 'Dock neon lights - area di interesse' 
    },
  ];

  // 4) USER AREAS - visible from zoom >= 13
  const userAreas: Area[] = [
    { 
      id: generateId('area', 0), 
      lat: 43.805, 
      lng: 7.640, 
      radius: 600 
    },
    { 
      id: generateId('area', 1), 
      lat: 43.800, 
      lng: 7.647, 
      radius: 500 
    },
  ];

  // 5) SEARCH AREAS
  const searchAreas: Area[] = [
    { 
      id: generateId('search', 0), 
      lat: 43.812, 
      lng: 7.633, 
      radius: 450 
    },
  ];

  console.log('[use3DDevMocks] 🎨 Mock data loaded:', {
    agents: agents.length,
    rewards: rewards.length,
    notesSeed: notesSeed.length,
    userAreas: userAreas.length,
    searchAreas: searchAreas.length
  });

  return { agents, rewards, notesSeed, userAreas, searchAreas };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
