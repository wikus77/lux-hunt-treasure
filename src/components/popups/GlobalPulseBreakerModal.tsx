/**
 * GLOBAL PULSE BREAKER MODAL
 * Stesso identico pattern del modale IMPOSTAZIONI: usa SettingsFlipOverlay (portal, backdrop, panel fixed inset 0, scroll lock, animazione).
 * Apertura/chiusura e aspetto a tutta pagina come il modale Impostazioni.
 *
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - Hidden on native platforms (gambling-like mechanic)
 * - Returns null when isPulseBreakerEnabled() === false
 *
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { useLocation } from 'wouter';
import SettingsFlipOverlay from '@/components/settings/SettingsFlipOverlay';
import { PulseBreaker } from '@/features/pulse-breaker/components/PulseBreaker';
import { usePulseBreakerStore } from '@/stores/pulseBreakerStore';
import { isPulseBreakerEnabled } from '@/utils/storeCompliance';

export const GlobalPulseBreakerModal: React.FC = () => {
  const { isOpen, closePulseBreaker } = usePulseBreakerStore();
  const [location] = useLocation();

  if (!isPulseBreakerEnabled()) return null;
  const isPublicPage = location === '/landing' || location === '/spectator' || location === '/register' || location === '/login';
  if (isPublicPage) return null;

  return (
    <SettingsFlipOverlay
      open={isOpen}
      originRect={null}
      onClose={closePulseBreaker}
      portalId="m1-pulsebreaker-portal"
    >
      <PulseBreaker isOpen={isOpen} onClose={closePulseBreaker} renderAsContentOnly />
    </SettingsFlipOverlay>
  );
};

