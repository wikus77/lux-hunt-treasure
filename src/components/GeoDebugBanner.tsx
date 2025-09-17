// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Development-only banner for geo debugging
import React from 'react';
import { useGeoMarkerAlert } from '@/hooks/useGeoMarkerAlert';
import { Badge } from '@/components/ui/badge';

export const GeoDebugBanner = () => {
  const { isMonitoring, nearbyMarkers, lastCheck, error } = useGeoMarkerAlert();
  
  // ⚡ PRODUZIONE: Solo se esplicitamente richiesto
  const showDebug = !import.meta.env.PROD && 
                   (window.location.hostname === 'localhost' || 
                    window.location.search.includes('debug=geo'));
  
  if (!showDebug) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-cyan-400">🎯 GeoAlert Debug</span>
        <Badge variant={isMonitoring ? "default" : "secondary"}>
          {isMonitoring ? "MONITORING" : "PAUSED"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Last Check:</span><br/>
          {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
        </div>
        <div>
          <span className="text-gray-400">Nearby:</span><br/>
          {nearbyMarkers.length} markers
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-900/50 rounded text-red-200">
          Error: {error}
        </div>
      )}
      
      {nearbyMarkers.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-green-400">📍 Nearby Markers:</span>
          {nearbyMarkers.map(marker => (
            <div key={marker.id} className="text-green-200 pl-2">
              • {marker.title} ({marker.distance}m)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};