// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React from 'react';

interface GeoDebugBannerProps {
  markersCount: number;
  isLoading: boolean;
  userLocation: { lat: number; lng: number } | null;
  showMarkersLayer: boolean;
  markerMinZoom: number;
  debugMessage?: string;
}

export const GeoDebugBanner: React.FC<GeoDebugBannerProps> = ({
  markersCount,
  isLoading,
  userLocation,
  showMarkersLayer,
  markerMinZoom,
  debugMessage
}) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500/90';
    if (markersCount === 0) return 'bg-red-500/90';
    if (!showMarkersLayer) return 'bg-orange-500/90';
    return 'bg-green-500/90';
  };

  const getStatusText = () => {
    if (debugMessage) return debugMessage;
    if (isLoading) return 'M1MARK-TRACE: Loading markers...';
    if (markersCount === 0) return 'M1MARK-TRACE: No markers found';
    if (!showMarkersLayer) return `M1MARK-TRACE: Hidden (zoom < ${markerMinZoom})`;
    return `M1MARK-TRACE: ${markersCount} markers visible`;
  };

  const getStatusIcon = () => {
    if (isLoading) return '⏳';
    if (markersCount === 0) return '❌';
    if (!showMarkersLayer) return '👁️‍🗨️';
    return '✅';
  };

  return (
    <div className="fixed top-20 left-4 z-[1000] pointer-events-none">
      <div className={`px-4 py-3 rounded-xl text-white text-sm font-medium ${getStatusColor()} shadow-lg backdrop-blur-sm border border-white/20`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{getStatusIcon()}</span>
          <span className="font-mono">{getStatusText()}</span>
        </div>
        {userLocation && (
          <div className="text-xs opacity-80 mt-2 font-mono">
            📍 User: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
        )}
        <div className="text-xs opacity-60 mt-1 font-mono">
          🔧 DEV-ONLY | M1SSION™ Telemetry
        </div>
      </div>
    </div>
  );
};