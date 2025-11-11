/**
 * DEPRECATED: SafeMarker - Leaflet wrapper (legacy)
 * This component is deprecated for MapLibre-based maps.
 * Kept only for backward compatibility with Intel module.
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { Marker, useMap } from 'react-leaflet';
import type { MarkerProps } from 'react-leaflet';

export const SafeMarker: React.FC<MarkerProps> = (props) => {
  console.warn('[DEPRECATED] SafeMarker is a legacy Leaflet component. Use MapLibre markers instead.');
  return <Marker {...props} />;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
