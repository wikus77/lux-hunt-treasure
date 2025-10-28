// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect } from 'react';
import { useDNA } from '@/hooks/useDNA';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { DNAModal } from './DNAModal';
import { toast } from 'sonner';
import type { DNAScores } from '@/features/dna/dnaTypes';
import { ARCHETYPE_CONFIGS } from '@/features/dna/dnaTypes';

const DNAManager: React.FC = () => {
  const { isAuthenticated } = useUnifiedAuth();
  const { needsOnboarding, isLoading, saveDNA, recordOnboardingShown, dnaProfile } = useDNA();

  // Apply theme when DNA profile changes
  useEffect(() => {
    if (dnaProfile) {
      const config = ARCHETYPE_CONFIGS[dnaProfile.archetype];
      
      // Set CSS custom property for accent color
      document.documentElement.style.setProperty('--dna-accent', config.accentVar);
      
      console.info('[DNA] Theme applied', { 
        archetype: dnaProfile.archetype, 
        color: config.color 
      });
    }
  }, [dnaProfile]);

  const handleComplete = async (scores: DNAScores) => {
    const success = await saveDNA(scores);
    
    if (success && dnaProfile) {
      const config = ARCHETYPE_CONFIGS[dnaProfile.archetype];
      toast.success('DNA calibrato con successo!', {
        description: `Sei un ${config.nameIt} ${config.icon}`
      });
    } else {
      toast.error('Errore durante il salvataggio del DNA');
    }
  };

  const handleSkip = () => {
    recordOnboardingShown();
    toast.info('Calibrazione DNA rimandata', {
      description: 'Riapparirà domani all\'apertura dell\'app'
    });
  };

  // Don't render if not authenticated, loading, or onboarding not needed
  if (!isAuthenticated || isLoading || !needsOnboarding) {
    return null;
  }

  return (
    <DNAModal
      isOpen={needsOnboarding}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};

export default DNAManager;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
