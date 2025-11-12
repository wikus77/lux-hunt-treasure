/**
 * M1SSION™ - Agent Location Updater Hook
 * Auto-updates user position to agent_locations table for real-time tracking
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

interface Position {
  lat: number;
  lng: number;
  acc?: number | null;
}

const UPDATE_INTERVAL_MS = 30000; // 30 seconds
const MIN_DISTANCE_METERS = 10; // Only update if moved >10m

/**
 * Calculates distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180;
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Updates or inserts user's current position in agent_locations table
 */
async function upsertAgentLocation(userId: string, position: Position): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from('agent_locations')
      .upsert({
        user_id: userId,
        lat: position.lat,
        lng: position.lng,
        accuracy: position.acc,
        status: 'online',
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      // Silent handling: 403/404 expected when table doesn't exist or RLS blocks
      // No UI error, just debug log
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('403')) {
        console.debug('[AgentLocation] Upsert skipped (table absent or RLS):', error.code);
        return;
      }
      console.debug('[AgentLocation] Upsert error:', error);
    } else {
      console.debug('[AgentLocation] Position updated:', { lat: position.lat, lng: position.lng });
    }
  } catch (e: any) {
    // Silent exception handling - no toast, just debug log
    console.debug('[AgentLocation] Exception (silent):', e.message);
  }
}

/**
 * Hook to automatically update agent location based on geolocation
 * @param position - Current user position from useGeolocation
 * @param enabled - Whether geolocation is enabled
 */
export function useAgentLocationUpdater(position?: Position, enabled?: boolean) {
  const { user } = useUnifiedAuth();
  const lastPositionRef = useRef<Position | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // Only proceed if authenticated, enabled, and position available
    if (!user?.id || !enabled || !position) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Check if we should update (time interval or significant movement)
    let shouldUpdate = timeSinceLastUpdate >= UPDATE_INTERVAL_MS;
    
    if (lastPositionRef.current && timeSinceLastUpdate < UPDATE_INTERVAL_MS) {
      const distance = calculateDistance(lastPositionRef.current, position);
      if (distance >= MIN_DISTANCE_METERS) {
        shouldUpdate = true;
        console.debug('[AgentLocation] Significant movement detected:', distance.toFixed(1), 'm');
      }
    } else if (!lastPositionRef.current) {
      // First update
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      upsertAgentLocation(user.id, position);
      lastPositionRef.current = position;
      lastUpdateRef.current = now;
    }
  }, [user?.id, position, enabled]);

  // Cleanup: Set status to offline on unmount
  useEffect(() => {
    if (!user?.id) return;

    return () => {
      (async () => {
        try {
          await (supabase as any)
            .from('agent_locations')
            .update({ status: 'offline', last_seen: new Date().toISOString() })
            .eq('user_id', user.id);
          
          console.debug('[AgentLocation] Set status to offline');
        } catch (e) {
          console.warn('[AgentLocation] Offline update failed:', e);
        }
      })();
    };
  }, [user?.id]);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
