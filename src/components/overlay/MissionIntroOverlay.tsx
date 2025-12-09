// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Wrapper per MissionStartSequence che usa lo store globale
// Renderizzato a livello App.tsx (fuori dal portal) per evitare problemi di z-index

import React, { useCallback } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';
import MissionStartSequence from '@/components/home/MissionStartSequence';

/**
 * MissionIntroOverlay
 * 
 * Wrapper che:
 * 1. Ascolta lo store per `showMissionIntro`
 * 2. Renderizza fullscreen MissionStartSequence
 * 3. Naviga alla mappa al completamento
 */
export const MissionIntroOverlay: React.FC = () => {
  const [, setLocation] = useLocation();
  const showMissionIntro = useEntityOverlayStore((s) => s.showMissionIntro);
  const closeMissionIntro = useEntityOverlayStore((s) => s.closeMissionIntro);

  const handleComplete = useCallback(() => {
    console.log('🎬 [MissionIntroOverlay] Sequence completed, navigating to map...');
    closeMissionIntro();
    setLocation('/map-3d-tiler');
  }, [closeMissionIntro, setLocation]);

  const handleCancel = useCallback(() => {
    console.log('🎬 [MissionIntroOverlay] Sequence cancelled');
    closeMissionIntro();
  }, [closeMissionIntro]);

  return (
    <AnimatePresence>
      {showMissionIntro && (
        <MissionStartSequence
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}
    </AnimatePresence>
  );
};

export default MissionIntroOverlay;

