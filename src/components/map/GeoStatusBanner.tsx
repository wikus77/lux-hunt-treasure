// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { GeoState } from '@/hooks/useGeoWatcher';

interface GeoStatusBannerProps {
  geoState: GeoState;
  isDevMode?: boolean;
}

export const GeoStatusBanner: React.FC<GeoStatusBannerProps> = ({ 
  geoState, 
  isDevMode = import.meta.env.DEV 
}) => {
  if (!isDevMode || !geoState.debugInfo) return null;

  const { debugInfo } = geoState;
  
  const getStatusColor = () => {
    if (geoState.granted && geoState.coords) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (debugInfo.permission === 'denied') return 'text-red-400 border-red-500/30 bg-red-500/10';
    return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  };

  const getStatusIcon = () => {
    if (geoState.granted && geoState.coords) return <CheckCircle className="w-4 h-4" />;
    if (debugInfo.permission === 'denied') return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-20 left-4 right-4 z-[9999] p-3 rounded-lg border backdrop-blur-md ${getStatusColor()}`}
    >
      <div className="flex items-start gap-2">
        {getStatusIcon()}
        <div className="flex-1 text-xs">
          <div className="font-semibold mb-1">
            Geo Debug {geoState.isIOS && '(iOS)'} {geoState.isPWA && '(PWA)'}
          </div>
          <div className="space-y-1 opacity-80">
            <div>Permission: {debugInfo.permission}</div>
            <div>Enabled: {debugInfo.locationEnabled ? 'Yes' : 'No'}</div>
            {debugInfo.coords && (
              <div>Coords: {debugInfo.coords.lat.toFixed(4)}, {debugInfo.coords.lng.toFixed(4)}</div>
            )}
            {debugInfo.lastError && (
              <div>Error: {debugInfo.lastError}</div>
            )}
            <div>Attempts: {debugInfo.attempts}</div>
            {debugInfo.lastAttemptTime && (
              <div>Last: {new Date(debugInfo.lastAttemptTime).toLocaleTimeString()}</div>
            )}
          </div>
        </div>
        <MapPin className="w-4 h-4 opacity-60" />
      </div>
    </motion.div>
  );
};

export default GeoStatusBanner;