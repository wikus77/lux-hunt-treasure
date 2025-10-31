/**
 * SafeMarker — Wrapper robusto per react-leaflet Marker
 * Previene crash da coordinate invalide
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { Marker, useMap } from 'react-leaflet';
import type { MarkerProps } from 'react-leaflet';
import { 
  normalizeCenter, 
  canRenderMarker, 
  logGuard 
} from '@/lib/map/geoGuards';

interface SafeMarkerProps extends Omit<MarkerProps, 'position'> {
  position?: any; // Accetta [lat,lng] o {lat,lng}
}

/**
 * Marker con validazione robusta
 * - Verifica che map sia pronta
 * - Valida position
 * - Log diagnostici se dati invalidi
 * - Ritorna null in sicurezza se non renderizzabile
 */
export const SafeMarker: React.FC<SafeMarkerProps> = ({ 
  position, 
  children,
  ...rest 
}) => {
  const map = useMap();
  
  // Guard 1: Map non pronta
  if (!map) {
    if (import.meta.env.DEV) {
      logGuard('SafeMarker skipped: map not ready', { position });
    }
    return null;
  }
  
  // Guard 2: Normalizza e valida position
  const normalizedPosition = normalizeCenter(position);
  if (!normalizedPosition) {
    logGuard('SafeMarker skipped: invalid position', { position });
    return null;
  }
  
  // Guard 3: Validazione completa
  if (!canRenderMarker({
    lat: normalizedPosition.lat,
    lng: normalizedPosition.lng
  })) {
    logGuard('SafeMarker skipped: failed canRenderMarker', { 
      position: normalizedPosition 
    });
    return null;
  }
  
  // Tutto valido: render Marker
  return (
    <Marker
      position={[normalizedPosition.lat, normalizedPosition.lng]}
      data-testid="safe-marker"
      {...rest}
    >
      {children}
    </Marker>
  );
};

export default SafeMarker;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
