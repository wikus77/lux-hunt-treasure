// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React from 'react';
import { AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react';

interface GeoDebugBannerProps {
  show: boolean;
  markersCount: number;
  currentZoom: number;
  minZoom: number;
  isAuthenticated: boolean | null;
  reason?: 'auth' | 'zoom' | 'network' | 'cache' | 'empty' | 'rls';
  additionalInfo?: string;
}

export const GeoDebugBanner: React.FC<GeoDebugBannerProps> = ({
  show,
  markersCount,
  currentZoom,
  minZoom,
  isAuthenticated,
  reason,
  additionalInfo
}) => {
  if (!show || import.meta.env.PROD) return null;

  const getReasonText = () => {
    switch (reason) {
      case 'auth':
        return 'User not authenticated - markers require authentication';
      case 'zoom':
        return `Zoom too low (${currentZoom.toFixed(1)} < ${minZoom}) - markers hidden`;
      case 'network':
        return 'Network error loading markers';
      case 'cache':
        return 'Service Worker cache may contain stale data';
      case 'empty':
        return 'No markers found in database';
      case 'rls':
        return 'Row Level Security blocking marker access';
      default:
        return 'Unknown issue with marker loading';
    }
  };

  const getIcon = () => {
    switch (reason) {
      case 'auth':
        return <WifiOff className="w-4 h-4" />;
      case 'network':
        return <WifiOff className="w-4 h-4" />;
      case 'zoom':
        return <Info className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getBgColor = () => {
    switch (reason) {
      case 'zoom':
        return 'bg-blue-500/80';
      case 'auth':
        return 'bg-orange-500/80';
      default:
        return 'bg-red-500/80';
    }
  };

  return (
    <div className={`fixed top-16 left-4 right-4 z-[1000] ${getBgColor()} text-white p-3 rounded-lg shadow-lg border border-white/20`}>
      <div className="flex items-center gap-2 text-sm">
        {getIcon()}
        <div className="flex-1">
          <div className="font-medium">🔧 DEV: Marker Debug Info</div>
          <div className="text-xs opacity-90">
            {getReasonText()} {additionalInfo && `- ${additionalInfo}`}
          </div>
          <div className="text-xs opacity-75 mt-1">
            Markers: {markersCount} | Zoom: {currentZoom.toFixed(1)}/{minZoom} | Auth: {isAuthenticated === null ? 'checking' : isAuthenticated ? '✓' : '✗'}
          </div>
        </div>
      </div>
    </div>
  );
};