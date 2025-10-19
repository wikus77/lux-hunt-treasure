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

// DEV mock data (fallback) - centered near Rome (41.9028, 12.4964) for better visibility
const DEV_DOCK_GROUPS: DockGroup[] = [
  {
    type: 'Portal',
    totalCount: 4,
    items: [
      { id: 'p1', type: 'Portal', label: 'Alpha Portal', lat: 41.9028, lng: 12.4964, status: 'active', color: '#00E5FF' },
      { id: 'p2', type: 'Portal', label: 'Beta Portal', lat: 41.9050, lng: 12.5000, status: 'active', color: '#8A2BE2' }
    ]
  },
  {
    type: 'Event',
    totalCount: 3,
    items: [
      { id: 'e1', type: 'Event', label: 'Rare Find', lat: 41.9000, lng: 12.4980, status: 'active', color: '#24E39E' }
    ]
  },
  {
    type: 'Mission',
    totalCount: 2,
    items: [
      { id: 'm1', type: 'Mission', label: 'Mission Complete', lat: 41.9030, lng: 12.4970, status: 'active' }
    ]
  },
  {
    type: 'Alert Zone',
    totalCount: 2,
    items: [
      { id: 'z1', type: 'Alert Zone', label: 'Sector Alpha', lat: 41.9010, lng: 12.4990, color: '#FFB347' }
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
