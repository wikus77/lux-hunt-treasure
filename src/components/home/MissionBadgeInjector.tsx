// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { StartMissionButton } from './StartMissionButton';

export const MissionBadgeInjector = () => {
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();
  const [portalReady, setPortalReady] = useState(false);
  const [enrolledOverride, setEnrolledOverride] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    let retryCount = 0;
    const maxRetries = 50;
    const retryDelay = 200;

    const findAndInjectBadge = () => {
      console.log(`🔍 [MissionBadgeInjector] Attempt ${retryCount + 1}/${maxRetries}`);

      // 1) Trova il titolo M1SSION (fallback anche con aria-label)
      const h1Elements = Array.from(document.querySelectorAll('h1'));
      let missionTitle: HTMLElement | undefined = h1Elements.find(h1 => h1.textContent?.includes('M1SSION')) as HTMLElement | undefined;
      if (!missionTitle) {
        missionTitle = document.querySelector('h1[aria-label*="M1SSION"]') as HTMLElement | null || undefined;
      }

      // 2) Trova il nodo con il testo "Centro di Comando Agente" (p/h2/div/span)
      const candidateNodes = Array.from(document.querySelectorAll('p, h2, div, span')) as HTMLElement[];
      const controlCenterNode = candidateNodes.find(el => el.textContent?.includes('Centro di Comando Agente'));

      if (!missionTitle && !controlCenterNode) {
        console.warn('[MissionBadgeInjector] Target nodes not found yet');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(findAndInjectBadge, retryDelay);
        }
        return;
      }

      console.log('✅ [MissionBadgeInjector] Target nodes resolved', { hasTitle: !!missionTitle, hasControl: !!controlCenterNode });

      // 3) Crea/recupera il portal container
      let badgeNode = document.getElementById('mission-status-badge-portal');
      if (!badgeNode) {
        badgeNode = document.createElement('div');
        badgeNode.id = 'mission-status-badge-portal';
        badgeNode.className = 'flex justify-center my-3';

        // Inserimento: prima del testo "Centro di Comando Agente" se presente, altrimenti subito dopo l'H1
        if (controlCenterNode?.parentNode) {
          controlCenterNode.parentNode.insertBefore(badgeNode, controlCenterNode);
          console.log('✅ [MissionBadgeInjector] Badge inserted before Control Center text');
          setPortalReady(true);
        } else if (missionTitle?.parentNode) {
          missionTitle.parentNode.insertBefore(badgeNode, missionTitle.nextSibling);
          console.log('✅ [MissionBadgeInjector] Badge inserted after title');
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

  // Aggiorna immediatamente il badge quando l'utente viene iscritto
  useEffect(() => {
    const onEnrolled = () => {
      console.log('✅ [MissionBadgeInjector] mission:enrolled event received');
      setEnrolledOverride(true);
      setPortalReady(true);
    };
    window.addEventListener('mission:enrolled', onEnrolled);
    return () => window.removeEventListener('mission:enrolled', onEnrolled);
  }, []);

  if (isLoading || !portalReady) return null;

  const portalTarget = document.getElementById('mission-status-badge-portal');
  if (!portalTarget) return null;

  // Se iscritto: mostra "ON M1SSION" con gradiente verde-viola
  // Se NON iscritto: mostra "START M1SSION" (StartMissionButton)
  return createPortal(
    (isEnrolled || enrolledOverride) ? (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-600/15 to-fuchsia-600/15"
      >
        <span 
          className="text-xs font-orbitron font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-fuchsia-400 bg-clip-text text-transparent"
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
