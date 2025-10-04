// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { StartMissionButton } from './StartMissionButton';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';

export const MissionBadgeInjector = () => {
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();
  const [portalReady, setPortalReady] = useState(false);
  const [enrolledOverride, setEnrolledOverride] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    let retryCount = 0;
    const maxRetries = 100;
    const retryDelay = 150;
    let observer: MutationObserver | null = null;

    const findAndInjectBadge = () => {
      console.log(`🔍 [MissionBadgeInjector] Attempt ${retryCount + 1}/${maxRetries}`);

      // Trova SOLO l'H1 con aria-label che contiene "Centro di Comando Agente"
      const missionTitle = document.querySelector('h1[aria-label*="Centro di Comando Agente"]') as HTMLElement | null;

      if (!missionTitle) {
        console.warn('[MissionBadgeInjector] Target H1 not found yet');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(findAndInjectBadge, retryDelay);
        }
        return;
      }

      console.log('✅ [MissionBadgeInjector] Target H1 resolved');

      // Crea/recupera il portal container
      let badgeNode = document.getElementById('mission-status-badge-portal');
      if (!badgeNode) {
        badgeNode = document.createElement('div');
        badgeNode.id = 'mission-status-badge-portal';
        badgeNode.className = 'flex justify-center my-3';
      }

      const ensurePosition = () => {
        if (!missionTitle || !badgeNode) return;
        if (missionTitle.nextSibling !== badgeNode) {
          missionTitle.parentNode?.insertBefore(badgeNode, missionTitle.nextSibling);
          console.log('🔧 [MissionBadgeInjector] Badge positioned after H1');
        }
      };

      // Posiziona e attiva il portal
      ensurePosition();
      setPortalReady(true);

      // Osserva cambi nel container per garantire la posizione corretta nel tempo
      if (!observer && missionTitle.parentNode) {
        observer = new MutationObserver(() => ensurePosition());
        observer.observe(missionTitle.parentNode, { childList: true });
        console.log('👀 [MissionBadgeInjector] MutationObserver attached');
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
      if (observer) {
        observer.disconnect();
        observer = null;
        console.log('🧹 [MissionBadgeInjector] Observer disconnected');
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
  return (
    <>
      {createPortal(
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
      )}

      {createPortal(
        <TutorialOverlay />,
        document.body
      )}
    </>
  );
};
