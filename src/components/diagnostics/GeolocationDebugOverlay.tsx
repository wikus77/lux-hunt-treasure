// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface GeolocationDebugOverlayProps {
  visible?: boolean;
}

export const GeolocationDebugOverlay: React.FC<GeolocationDebugOverlayProps> = ({ 
  visible = true 
}) => {
  const watcher = useGeoWatcher();
  const [closestQR, setClosestQR] = useState<{ distance: number; marker: string } | null>(null);

  // Show only in development or when geo debug is enabled
  const shouldShow = visible && (
    import.meta.env.DEV || 
    new URLSearchParams(window.location.search).get('geo') === '1' ||
    localStorage.getItem('m1ssion_geo_debug') === '1'
  );

  // Calculate distance to closest QR marker
  useEffect(() => {
    if (!watcher.coords) return;
    
    // Mock QR positions for testing - in production this would come from actual data
    const mockQRs = [
      { id: 'QR1', lat: 43.7874, lng: 7.5964 },
      { id: 'QR2', lat: 43.7944, lng: 7.6036 },
      { id: 'QR3', lat: 43.7908, lng: 7.6086 }
    ];

    const distances = mockQRs.map(qr => {
      const R = 6371000; // Earth radius in meters
      const dLat = (qr.lat - watcher.coords!.lat) * Math.PI / 180;
      const dLng = (qr.lng - watcher.coords!.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(watcher.coords!.lat * Math.PI / 180) * Math.cos(qr.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return { distance: Math.round(distance), marker: qr.id };
    });

    const closest = distances.reduce((min, curr) => 
      curr.distance < min.distance ? curr : min
    );
    
    setClosestQR(closest);
  }, [watcher.coords]);

  const handleTestNearbyQR = () => {
    if (closestQR) {
      toast.success(`Marker più vicino: ${closestQR.marker} a ${closestQR.distance}m`);
      console.log('🎯 Closest QR Test:', closestQR);
    } else {
      toast.info('Nessun marker nelle vicinanze');
    }
  };

  const handleRequestPermission = async () => {
    toast.info('Richiedendo permesso geolocalizzazione...');
    const result = await watcher.requestPermissions();
    if (result) {
      toast.success('Permesso geolocalizzazione ottenuto!');
    } else {
      toast.error('Permesso geolocalizzazione negato');
    }
  };

  const getStatusIcon = () => {
    if (watcher.granted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (watcher.error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (watcher.granted) return 'Granted';
    if (watcher.error) return 'Error';
    return 'Pending';
  };

  const getAccuracyColor = (acc: number | null) => {
    if (!acc) return 'secondary';
    if (acc <= 10) return 'default'; // Green
    if (acc <= 50) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const formatAge = (ts?: number) => {
    if (!ts) return 'N/A';
    const ageMs = Date.now() - ts;
    if (ageMs < 1000) return '<1s';
    if (ageMs < 60000) return `${Math.round(ageMs/1000)}s`;
    return `${Math.round(ageMs/60000)}m`;
  };

  if (!shouldShow) return null;

  return (
    <div 
      className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-gray-700 shadow-lg z-[1000] max-w-xs"
      style={{ fontSize: '12px' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-blue-400" />
        <span className="font-semibold text-blue-400">Geo Debug</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {watcher.coords && (
          <>
            <div className="flex justify-between">
              <span>Lat:</span>
              <code className="text-blue-300">{watcher.coords.lat.toFixed(6)}</code>
            </div>
            <div className="flex justify-between">
              <span>Lng:</span>
              <code className="text-blue-300">{watcher.coords.lng.toFixed(6)}</code>
            </div>
            <div className="flex items-center justify-between">
              <span>±Acc:</span>
              <Badge variant={getAccuracyColor(watcher.coords.acc)}>
                {watcher.coords.acc ? `${Math.round(watcher.coords.acc)}m` : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Age:</span>
              <code className="text-green-300">{formatAge(watcher.ts)}</code>
            </div>
          </>
        )}

        {watcher.error && (
          <div className="text-red-400 text-xs border-t border-gray-600 pt-2">
            {watcher.error}
          </div>
        )}

        {closestQR && (
          <div className="flex justify-between border-t border-gray-600 pt-2">
            <span>Nearest QR:</span>
            <code className="text-yellow-300">{closestQR.distance}m</code>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button 
          onClick={handleRequestPermission}
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-7"
        >
          Request
        </Button>
        <Button 
          onClick={handleTestNearbyQR}
          size="sm" 
          variant="outline"
          className="flex-1 text-xs h-7"
        >
          Test QR
        </Button>
      </div>

      <div className="text-xs text-gray-400 mt-2 text-center">
        ?geo=1 to toggle
      </div>
    </div>
  );
};