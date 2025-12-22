/**
 * THE PULSE™ — Global Contribution Listener
 * Ascolta eventi di contribuzione e mostra toast
 * Da inserire in App.tsx per funzionamento globale
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { PulseContributionToast } from './PulseContributionToast';
import { PulseContributionResult } from '../hooks/usePulseContribute';
import { PULSE_ENABLED } from '@/config/featureFlags';

export const PulseContributionListener = () => {
  const [contribution, setContribution] = useState<PulseContributionResult | null>(null);

  useEffect(() => {
    if (!PULSE_ENABLED) return;

    const handleContribution = (event: CustomEvent<PulseContributionResult>) => {
      console.log('[PULSE] Contribution event received:', event.detail);
      setContribution(event.detail);
    };

    window.addEventListener('pulse:contributed', handleContribution as EventListener);
    
    return () => {
      window.removeEventListener('pulse:contributed', handleContribution as EventListener);
    };
  }, []);

  if (!PULSE_ENABLED) return null;

  return <PulseContributionToast contribution={contribution} duration={3500} />;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™






