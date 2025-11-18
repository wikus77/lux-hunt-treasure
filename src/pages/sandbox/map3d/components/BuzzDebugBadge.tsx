import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useDebugFlag } from '@/debug/useDebugFlag';
import { useBuzzMapPricingNew } from '@/hooks/useBuzzMapPricingNew';
import { getCurrentWeekOfYear } from '@/lib/weekUtils';

interface BuzzDebugBadgeProps {
  latestArea: {
    id: string;
    radius_km: number;
    level?: number;
    lat: number;
    lng: number;
  } | null;
}

const BuzzDebugBadge: React.FC<BuzzDebugBadgeProps> = ({ latestArea }) => {
  const { user } = useAuthContext();
  const isDebugEnabled = useDebugFlag();
  const { nextLevel, nextRadiusKm } = useBuzzMapPricingNew(user?.id);
  const [dbCurrentRadiusKm, setDbCurrentRadiusKm] = useState<number | null>(null);
  const [dbCurrentLevel, setDbCurrentLevel] = useState<number | null>(null);
  const [geoJsonRadiusKm, setGeoJsonRadiusKm] = useState<number | null>(null);
  const [geoJsonLevel, setGeoJsonLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id || !isDebugEnabled) return;

    const loadLatestFromDB = async () => {
      const currentWeek = getCurrentWeekOfYear();
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('id, radius_km, level, created_at')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map')
        .eq('week', currentWeek)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ BuzzDebugBadge: Error loading latest area:', error);
        return;
      }

      if (data) {
        setDbCurrentRadiusKm(data.radius_km);
        setDbCurrentLevel(data.level);
      } else {
        setDbCurrentRadiusKm(null);
        setDbCurrentLevel(null);
      }
    };

    loadLatestFromDB();

    const handleBuzzCreated = () => {
      setTimeout(() => loadLatestFromDB(), 500);
    };
    window.addEventListener('buzzAreaCreated', handleBuzzCreated);

    return () => {
      window.removeEventListener('buzzAreaCreated', handleBuzzCreated);
    };
  }, [user?.id, isDebugEnabled]);

  // 🔥 CRITICAL: Read from user-areas GeoJSON (single source of truth)
  useEffect(() => {
    if (!isDebugEnabled) return;

    const readGeoJson = () => {
      try {
        const map = (window as any).M1_MAP;
        if (!map) return;
        
        const source = map.getSource?.('user-areas');
        const data = source && (source._data || source.serialize?.().data);
        const props = data?.features?.[0]?.properties;
        
        if (props) {
          setGeoJsonRadiusKm(props.radiusKm || null);
          setGeoJsonLevel(props.level || null);
        } else {
          setGeoJsonRadiusKm(null);
          setGeoJsonLevel(null);
        }
      } catch (e) {
        console.warn('BuzzDebugBadge: failed to read GeoJSON:', e);
      }
    };

    // Poll every 2s to catch GeoJSON updates
    const interval = setInterval(readGeoJson, 2000);
    readGeoJson();

    return () => clearInterval(interval);
  }, [isDebugEnabled]);

  if (!isDebugEnabled) return null;

  // 🔥 CRITICAL: Use GeoJSON props as source of truth (not latestArea prop)
  const uiRadiusKm = geoJsonRadiusKm;
  const uiLevel = geoJsonLevel;
  
  const radiusMismatch = dbCurrentRadiusKm !== null && uiRadiusKm !== null && 
    Math.abs(dbCurrentRadiusKm - uiRadiusKm) > 0.01;

  return (
    <div 
      className="fixed top-20 right-2 z-[9999] bg-black/90 border rounded-lg shadow-xl text-xs p-3 space-y-1 min-w-[280px]"
      style={{
        borderColor: radiusMismatch ? '#ef4444' : '#06b6d4'
      }}
    >
      <div className="font-bold text-cyan-400 border-b border-cyan-500/30 pb-1 mb-2">
        🔍 BUZZ VERIFY MODE
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="text-gray-400">Source:</div>
        <div className="text-cyan-300 font-mono">user-areas GeoJSON</div>
        
        <div className="text-gray-400">DB current:</div>
        <div className={`font-mono ${radiusMismatch ? 'text-red-400 font-bold' : 'text-cyan-300'}`}>
          {dbCurrentRadiusKm !== null 
            ? `L${dbCurrentLevel || '?'} • ${dbCurrentRadiusKm.toFixed(1)} km` 
            : 'N/A'}
        </div>
        
        <div className="text-gray-400">GeoJSON live:</div>
        <div className={`font-mono ${radiusMismatch ? 'text-red-400 font-bold' : 'text-green-400'}`}>
          {uiRadiusKm !== null 
            ? `L${uiLevel || '?'} • ${uiRadiusKm.toFixed(1)} km` 
            : 'N/A'}
        </div>
        
        <div className="text-gray-400">Next:</div>
        <div className="text-purple-400 font-mono">
          L{nextLevel} • {nextRadiusKm.toFixed(1)} km
        </div>
      </div>

      {latestArea && (
        <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-700/50">
          Center: {latestArea.lat.toFixed(4)}, {latestArea.lng.toFixed(4)}
        </div>
      )}

      {radiusMismatch && (
        <div className="text-red-400 text-[10px] pt-1 border-t border-red-500/30 font-bold">
          ⚠️ MISMATCH DETECTED
        </div>
      )}

      <div className="text-[9px] text-gray-600 pt-1 space-x-2">
        <span>✓ buzzAreaCreated</span>
        <span>✓ realtime</span>
        <span>✓ render</span>
      </div>
    </div>
  );
};

export default BuzzDebugBadge;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
