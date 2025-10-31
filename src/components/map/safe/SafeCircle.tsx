/**
 * SafeCircle — Wrapper robusto per react-leaflet Circle
 * Previene crash da coordinate/radius invalidi
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { Circle, useMap } from 'react-leaflet';
import type { CircleProps } from 'react-leaflet';
import { 
  normalizeCenter, 
  normalizeRadius, 
  canRenderCircle, 
  logGuard 
} from '@/lib/map/geoGuards';

interface SafeCircleProps extends Omit<CircleProps, 'center' | 'radius'> {
  center?: any; // Accetta [lat,lng] o {lat,lng}
  radius?: number | string;
}

/**
 * Circle con validazione robusta
 * - Verifica che map sia pronta
 * - Valida center e radius
 * - Log diagnostici se dati invalidi
 * - Ritorna null in sicurezza se non renderizzabile
 */
export const SafeCircle: React.FC<SafeCircleProps> = ({ 
  center, 
  radius, 
  ...rest 
}) => {
  const map = useMap();
  
  // Guard 1: Map non pronta
  if (!map) {
    if (import.meta.env.DEV) {
      logGuard('SafeCircle skipped: map not ready', { center, radius });
    }
    return null;
  }
  
  // Guard 2: Normalizza e valida center
  const normalizedCenter = normalizeCenter(center);
  if (!normalizedCenter) {
    logGuard('SafeCircle skipped: invalid center', { center, radius });
    return null;
  }
  
  // Guard 3: Normalizza e valida radius
  const normalizedRadius = normalizeRadius(radius);
  if (!normalizedRadius) {
    logGuard('SafeCircle skipped: invalid radius', { center, radius });
    return null;
  }
  
  // Guard 4: Validazione completa
  if (!canRenderCircle({
    lat: normalizedCenter.lat,
    lng: normalizedCenter.lng,
    radius: normalizedRadius
  })) {
    logGuard('SafeCircle skipped: failed canRenderCircle', { 
      center: normalizedCenter, 
      radius: normalizedRadius 
    });
    return null;
  }
  
  // Tutto valido: render Circle
  return (
    <Circle
      center={[normalizedCenter.lat, normalizedCenter.lng]}
      radius={normalizedRadius}
      data-testid="safe-circle"
      {...rest}
    />
  );
};

export default SafeCircle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
