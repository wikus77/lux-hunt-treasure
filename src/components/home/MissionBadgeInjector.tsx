// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { StartMissionButton } from './StartMissionButton';

export const MissionBadgeInjector = () => {
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 100;

    const findAndInjectBadge = () => {
      console.log(`🔍 [MissionBadgeInjector] Attempt ${retryCount + 1}/${maxRetries}`);
      
      // Cerca l'h1 che contiene "M1SSION"
      const h1Elements = Array.from(document.querySelectorAll('h1'));
      const missionTitle = h1Elements.find(h1 => h1.textContent?.includes('M1SSION'));
      
      if (!missionTitle) {
        console.warn('[MissionBadgeInjector] M1SSION title not found');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(findAndInjectBadge, retryDelay);
        }
        return;
      }

      console.log('✅ [MissionBadgeInjector] M1SSION title found');

      // Crea il nodo badge se non esiste già
      let badgeNode = document.getElementById('mission-status-badge-portal');
      if (!badgeNode) {
        badgeNode = document.createElement('div');
        badgeNode.id = 'mission-status-badge-portal';
        badgeNode.className = 'flex justify-center my-3';
        
        // Inserisce dopo il titolo H1
        if (missionTitle.parentNode) {
          missionTitle.parentNode.insertBefore(badgeNode, missionTitle.nextSibling);
          console.log('✅ [MissionBadgeInjector] Badge node created and inserted');
          setPortalReady(true);
        }
      } else {
        console.log('✅ [MissionBadgeInjector] Badge node already exists');
        setPortalReady(true);
      }
    };

    findAndInjectBadge();

    return () => {
      // Cleanup: rimuovi il nodo quando il componente unmount
      const node = document.getElementById('mission-status-badge-portal');
      if (node) {
        node.remove();
        console.log('🧹 [MissionBadgeInjector] Badge node removed');
      }
      setPortalReady(false);
    };
  }, [isLoading]);

  if (isLoading || !portalReady) return null;

  const portalTarget = document.getElementById('mission-status-badge-portal');
  if (!portalTarget) return null;

  // Se iscritto: mostra "ON M1SSION" con gradiente verde-viola
  // Se NON iscritto: mostra "START M1SSION" (StartMissionButton)
  return createPortal(
    isEnrolled ? (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-purple-500/10 border border-green-500/30"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))',
          borderImage: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(168, 85, 247, 0.3)) 1'
        }}
      >
        <span 
          className="text-xs font-orbitron font-semibold uppercase tracking-wider bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent"
        >
          ON M1SSION
        </span>
      </motion.div>
    ) : (
      <StartMissionButton />
    ),
    portalTarget
  );
};
