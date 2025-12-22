// @ts-nocheck
// Living Map™ Read-Only Data Adapter
// No DB writes - only reads and subscriptions

import { FICTITIOUS_AGENTS, CITY_AGENTS, TOTAL_NPC_COUNT } from '@/data/fictitious-agents.seed';

// Combined NPC agents (original + city-specific)
const ALL_NPC_AGENTS = [...FICTITIOUS_AGENTS, ...CITY_AGENTS];

export interface PortalDTO {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  intensity: number; // 0-100
  lastUpdate: string;
}

export interface EventDTO {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'success' | 'warning' | 'rare';
  timestamp: string;
  radius: number;
}

export interface AgentDTO {
  id: string;
  lat: number;
  lng: number;
  username: string;
  status: 'online' | 'idle' | 'offline';
  lastSeen: string;
  agent_code?: string;
  rank_id?: number;
}

export interface ZoneDTO {
  id: string;
  polygon: [number, number][]; // [lat, lng][]
  label: string;
  team: string;
  color: string;
  control: number; // 0-100
}

// Feature flag for dev mode (read once at module init)
const USE_MOCK = import.meta.env.VITE_LIVING_MAP_USE_MOCK === 'true';

console.debug('[LiveMap] Adapter initialized:', { USE_MOCK, ENV: import.meta.env.MODE });

// Mock data generators for DEV
function generateMockPortals(): PortalDTO[] {
  return [
    { id: 'p1', lat: 43.7874, lng: 7.6326, name: 'Portal Alpha', status: 'active', intensity: 85, lastUpdate: new Date().toISOString() },
    { id: 'p2', lat: 43.7894, lng: 7.6356, name: 'Portal Beta', status: 'active', intensity: 92, lastUpdate: new Date().toISOString() },
    { id: 'p3', lat: 43.7854, lng: 7.6296, name: 'Portal Gamma', status: 'pending', intensity: 45, lastUpdate: new Date().toISOString() },
    { id: 'p4', lat: 43.7914, lng: 7.6386, name: 'Portal Delta', status: 'inactive', intensity: 12, lastUpdate: new Date().toISOString() }
  ];
}

function generateMockEvents(): EventDTO[] {
  return [
    { id: 'e1', lat: 43.7884, lng: 7.6336, title: 'Rare Drop', type: 'rare', timestamp: new Date().toISOString(), radius: 150 },
    { id: 'e2', lat: 43.7904, lng: 7.6366, title: 'Mission Complete', type: 'success', timestamp: new Date().toISOString(), radius: 100 },
    { id: 'e3', lat: 43.7864, lng: 7.6306, title: 'Alert Zone', type: 'warning', timestamp: new Date().toISOString(), radius: 200 }
  ];
}

function generateMockAgents(): AgentDTO[] {
  const agents: AgentDTO[] = [];
  const basePositions = [
    { lat: 43.7874, lng: 7.6326 },
    { lat: 43.7884, lng: 7.6336 },
    { lat: 43.7894, lng: 7.6346 },
    { lat: 43.7904, lng: 7.6356 },
    { lat: 43.7914, lng: 7.6366 }
  ];
  
  for (let i = 0; i < 18; i++) {
    const base = basePositions[i % basePositions.length];
    agents.push({
      id: `agent${i + 1}`,
      lat: base.lat + (Math.random() - 0.5) * 0.002,
      lng: base.lng + (Math.random() - 0.5) * 0.002,
      username: `Agent${i + 1}`,
      status: i % 3 === 0 ? 'online' : i % 3 === 1 ? 'idle' : 'offline',
      lastSeen: new Date().toISOString()
    });
  }
  
  return agents;
}

function generateMockZones(): ZoneDTO[] {
  return [
    {
      id: 'z1',
      polygon: [
        [43.7864, 7.6316],
        [43.7884, 7.6316],
        [43.7884, 7.6346],
        [43.7864, 7.6346]
      ],
      label: 'Sector Alpha',
      team: 'Blue Team',
      color: '#00E5FF',
      control: 75
    },
    {
      id: 'z2',
      polygon: [
        [43.7894, 7.6356],
        [43.7914, 7.6356],
        [43.7914, 7.6386],
        [43.7894, 7.6386]
      ],
      label: 'Sector Beta',
      team: 'Purple Team',
      color: '#8A2BE2',
      control: 60
    }
  ];
}

// Read-only API functions
export async function getLivePortals(): Promise<PortalDTO[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockPortals()), 300);
    });
  }
  
  // TODO: Replace with real Supabase query when ready
  // const { data } = await supabase.from('portals').select('*');
  // return data || [];
  
  return [];
}

export async function getLiveEvents(): Promise<EventDTO[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockEvents()), 300);
    });
  }
  
  // TODO: Replace with real Supabase query
  return [];
}

export async function getLiveAgents(): Promise<AgentDTO[]> {
  // 🎯 MOCK MODE: Return mock data + fictitious agents
  if (USE_MOCK) {
    const mockAgents = generateMockAgents();
    // Combine mock with fictitious NPC agents
    const allAgents = [...mockAgents, ...ALL_NPC_AGENTS];
    console.debug('[LiveAgents] Data source: MOCK + NPC', { mock: mockAgents.length, npc: ALL_NPC_AGENTS.length, total: allAgents.length });
    return new Promise((resolve) => {
      setTimeout(() => resolve(allAgents), 300);
    });
  }
  
  // 🔄 REAL DATA MODE: Query user_locations directly (no view dependency)
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Check auth before query
    const { data: { session } } = await supabase.auth.getSession();
    console.debug('[LiveAgents] mode=REAL, auth=', !!session);
    
    // 🚀 FIX: Query user_locations table directly
    // Column is 'updated_at' NOT 'last_seen'
    const { data: locations, error: locError } = await (supabase as any)
      .from('user_locations')
      .select('user_id, lat, lng, accuracy, status, updated_at')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(100);
    
    let realAgents: AgentDTO[] = [];
    
    if (!locError && locations && locations.length > 0) {
      // Get user profiles for usernames, agent_code, and rank_id
      const userIds = locations.map((l: any) => l.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, agent_code, rank_id')
        .in('id', userIds);
      
      const profileMap = new Map(
        profiles?.map(p => [
          p.id, 
          { 
            full_name: p.full_name, 
            agent_code: (p as any).agent_code, 
            rank_id: (p as any).rank_id 
          }
        ]) || []
      );
      
      // 🎯 Determine online status based on updated_at (15 minutes = online, else offline)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      realAgents = locations.map((row: any) => {
        const profile = profileMap.get(row.user_id);
        const isRecent = row.updated_at && row.updated_at > fifteenMinutesAgo;
        
        return {
          id: row.user_id,
          lat: row.lat,
          lng: row.lng,
          username: profile?.full_name || profile?.agent_code || 'Agent',
          status: isRecent ? 'online' : 'offline',
          lastSeen: row.updated_at,
          agent_code: profile?.agent_code,
          rank_id: profile?.rank_id
        };
      });
    }
    
    // 🔥 IMPORTANT: Always combine real agents with fictitious NPC agents
    const allAgents = [...realAgents, ...ALL_NPC_AGENTS];
    console.debug('[LiveAgents] Data source: DB + NPC', { real: realAgents.length, npc: ALL_NPC_AGENTS.length, total: allAgents.length });
    return allAgents;
  } catch (e: any) {
    console.debug('[LiveAgents] Exception in REAL mode, returning NPC only:', e.message);
    // Even on error, return fictitious agents so map is populated
    return [...ALL_NPC_AGENTS];
  }
}

export async function getControlZones(): Promise<ZoneDTO[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockZones()), 300);
    });
  }
  
  // TODO: Replace with real Supabase query
  return [];
}

// Realtime subscriptions (read-only)
export function onPortalsChanged(callback: (portals: PortalDTO[]) => void): () => void {
  if (USE_MOCK) {
    // Simulate updates every 5s in dev
    const interval = setInterval(async () => {
      const portals = await getLivePortals();
      callback(portals);
    }, 5000);
    
    return () => clearInterval(interval);
  }
  
  // TODO: Replace with Supabase Realtime channel
  // const channel = supabase.channel('portals-changes')
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'portals' }, () => {
  //     getLivePortals().then(callback);
  //   })
  //   .subscribe();
  // 
  // return () => { supabase.removeChannel(channel); };
  
  return () => {};
}

export function onEventsChanged(callback: (events: EventDTO[]) => void): () => void {
  if (USE_MOCK) {
    const interval = setInterval(async () => {
      const events = await getLiveEvents();
      callback(events);
    }, 7000);
    
    return () => clearInterval(interval);
  }
  
  return () => {};
}

export function onAgentsChanged(callback: (agents: AgentDTO[]) => void): () => void {
  if (USE_MOCK) {
    const interval = setInterval(async () => {
      const agents = await generateMockAgents(); // Regenerate for movement simulation
      callback(agents);
    }, 3000);
    
    return () => clearInterval(interval);
  }
  
  // 🚀 FIX: Subscribe to user_locations table (not agent_locations view)
  let channelCleanup: (() => void) | null = null;
  
  (async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const channel = (supabase as any)
        .channel('user-locations-live')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_locations' 
        }, async () => {
          const agents = await getLiveAgents();
          callback(agents);
        })
        .subscribe();
      
      channelCleanup = () => {
        (supabase as any).removeChannel(channel);
      };
    } catch (e) {
      console.warn('[LiveAgents] Realtime setup failed:', e);
    }
  })();
  
  return () => {
    if (channelCleanup) {
      channelCleanup();
    }
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
