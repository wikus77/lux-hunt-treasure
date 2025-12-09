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
 * Auth gate: Only proceeds if valid session exists
 * 
 * NOTE: Requires SQL setup from SQL_SETUP_MARKER_GEOLOCATION.sql:
 * - Function: set_my_agent_location(p_lat, p_lng, p_accuracy, p_status)
 * - Table: user_locations
 * - Views: agent_locations, online_agents, v_online_agents
 */
async function upsertAgentLocation(userId: string, position: Position): Promise<void> {
  try {
    // 🔒 Auth gate: Check for valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.debug('[AgentLocation] Upsert skipped: no session');
      return;
    }

    // 🔄 Use RPC for secure upsert
    const { error } = await (supabase as any).rpc('set_my_agent_location', {
      p_lat: position.lat,
      p_lng: position.lng,
      p_accuracy: position.acc,
      p_status: 'online'
    });

    if (error) {
      // 🚨 EXPLICIT 406 ERROR LOGGING for debugging
      if (error.code === '406' || error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        console.warn('⚠️ [AgentLocation] 406 NOT ACCEPTABLE - RPC may not be deployed:', {
          hint: 'Run SQL_SETUP_MARKER_GEOLOCATION.sql in Supabase SQL Editor'
        });
        return;
      }
      
      // Function doesn't exist - common on first setup
      if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
        console.warn('⚠️ [AgentLocation] RPC function not found. Please run SQL setup:', {
          file: 'SQL_SETUP_MARKER_GEOLOCATION.sql',
          hint: 'Execute in Supabase Dashboard > SQL Editor'
        });
        return;
      }
      
      // Silent handling: expected when function doesn't exist
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST301') {
        console.debug('[AgentLocation] RPC skipped (function/table absent):', error.code);
        return;
      }
      
      console.debug('[AgentLocation] RPC error:', error);
    } else {
      console.debug('✅ [AgentLocation] Position updated via RPC:', { lat: position.lat, lng: position.lng });
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
  // NOTE: agent_locations is a VIEW, must update user_locations table instead
  useEffect(() => {
    if (!user?.id) return;

    return () => {
      (async () => {
        try {
          // Use RPC for consistent updates (handles table directly)
          await (supabase as any).rpc('set_my_agent_location', {
            p_lat: lastPositionRef.current?.lat || 0,
            p_lng: lastPositionRef.current?.lng || 0,
            p_accuracy: null,
            p_status: 'offline'
          });
          
          console.debug('[AgentLocation] Set status to offline via RPC');
        } catch (e) {
          // Silent fail - user is leaving anyway
          console.debug('[AgentLocation] Offline update skipped:', e);
        }
      })();
    };
  }, [user?.id]);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
