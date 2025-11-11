/**
 * DEPRECATED: SafeCircle - Leaflet wrapper (legacy)
 * This component is deprecated for MapLibre-based maps.
 * Kept only for backward compatibility with Intel module.
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { Circle, useMap } from 'react-leaflet';
import type { CircleProps } from 'react-leaflet';

export const SafeCircle: React.FC<CircleProps> = (props) => {
  console.warn('[DEPRECATED] SafeCircle is a legacy Leaflet component. Use MapLibre layers instead.');
  return <Circle {...props} />;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
