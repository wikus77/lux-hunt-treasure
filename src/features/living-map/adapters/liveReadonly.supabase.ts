import { supabase } from '@/integrations/supabase/client';
import { DockItemData } from '../components/DockItem';

/**
 * Live Map data adapter - READ ONLY
 * Fetches data from Supabase views or returns dev mocks
 */

export interface DockGroup {
  type: 'Portal' | 'Event' | 'Alert Zone' | 'Mission' | 'Sector';
  items: DockItemData[];
  totalCount: number;
}

// DEV mock data (fallback)
const DEV_DOCK_GROUPS: DockGroup[] = [
  {
    type: 'Portal',
    totalCount: 4,
    items: [
      { id: 'p1', type: 'Portal', label: 'Alpha Portal', lat: 43.7874, lng: 7.6326, status: 'active', color: '#00E5FF' },
      { id: 'p2', type: 'Portal', label: 'Beta Portal', lat: 43.7900, lng: 7.6400, status: 'active', color: '#8A2BE2' }
    ]
  },
  {
    type: 'Event',
    totalCount: 3,
    items: [
      { id: 'e1', type: 'Event', label: 'Rare Find', lat: 43.7850, lng: 7.6350, status: 'active', color: '#24E39E' }
    ]
  },
  {
    type: 'Mission',
    totalCount: 2,
    items: [
      { id: 'm1', type: 'Mission', label: 'Mission Complete', lat: 43.7880, lng: 7.6360, status: 'active' }
    ]
  },
  {
    type: 'Alert Zone',
    totalCount: 2,
    items: [
      { id: 'z1', type: 'Alert Zone', label: 'Sector Alpha', lat: 43.7860, lng: 7.6340, color: '#FFB347' }
    ]
  }
];

/**
 * Fetch dock groups from Supabase or return mocks
 */
export const getDockGroups = async (): Promise<DockGroup[]> => {
  try {
    // For now, use dev mocks since we don't have a living_map_markers table yet
    // TODO: Replace with actual Supabase query when table is created
    console.log('[Living Map] Using dev mocks (no table configured)');
    return DEV_DOCK_GROUPS;
  } catch (err) {
    console.warn('[Living Map] Read error, using dev mocks:', err);
    return DEV_DOCK_GROUPS;
  }
};

/**
 * Subscribe to real-time dock counts changes (optional)
 * Currently disabled until table is configured
 */
export const onDockCountsChanged = (callback: (groups: DockGroup[]) => void) => {
  // TODO: Enable when living_map_markers table exists
  console.log('[Living Map] Realtime updates disabled (no table configured)');
  
  // Return no-op cleanup function
  return () => {
    // No-op
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
