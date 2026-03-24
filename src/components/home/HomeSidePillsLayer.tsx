/**
 * HomeSidePillsLayer — Floating Home lateral UI: V2 nodes or legacy capsules.
 * Gated by HOME_V2_FLOATING_SIDE_PILLS_ENABLED + ENABLE_FLOATING_NODES_V2.
 * © 2026 Joseph MULÉ – M1SSION™
 */

import React from 'react';
import { FloatingNodesLayer } from '@/components/floatingNodes';
import {
  ENABLE_FLOATING_NODES_V2,
  HOME_V2_FLOATING_SIDE_PILLS_ENABLED,
} from '@/config/featureFlags';
import { HomeSidePillsLayerLegacy } from './HomeSidePillsLayerLegacy';

export const HomeSidePillsLayer: React.FC = () => {
  if (!HOME_V2_FLOATING_SIDE_PILLS_ENABLED) return null;
  if (ENABLE_FLOATING_NODES_V2) return <FloatingNodesLayer />;
  return <HomeSidePillsLayerLegacy />;
};
