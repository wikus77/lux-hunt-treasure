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
    const maxRetries = 100;
    const retryDelay = 150;
    let observer: MutationObserver | null = null;

    const positionBadge = (missionTitle: HTMLElement | null, controlCenterNode: HTMLElement | null) => {
      let badgeNode = document.getElementById('mission-status-badge-portal');
      if (!badgeNode) {
        badgeNode = document.createElement('div');
        badgeNode.id = 'mission-status-badge-portal';
        badgeNode.className = 'flex justify-center my-3';
      }

      const parent = (controlCenterNode?.parentElement) || (missionTitle?.parentElement) || null;
      if (!parent) return false;

      // Preferenza assoluta: PRIMA del testo "Centro di Comando Agente"
      if (controlCenterNode && badgeNode.nextSibling !== controlCenterNode) {
        parent.insertBefore(badgeNode, controlCenterNode);
        console.log('🔧 [MissionBadgeInjector] Badge positioned before Control Center');
      }
      // Fallback: subito dopo l'H1
      else if (missionTitle && missionTitle.nextSibling !== badgeNode) {
        parent.insertBefore(badgeNode, missionTitle.nextSibling);
        console.log('🔧 [MissionBadgeInjector] Badge positioned after H1');
      }

      setPortalReady(true);

      // Osserva cambi nel container per mantenere la posizione
      if (!observer && parent) {
        observer = new MutationObserver(() => {
          positionBadge(missionTitle, controlCenterNode);
        });
        observer.observe(parent, { childList: true, subtree: false });
        console.log('👀 [MissionBadgeInjector] MutationObserver attached');
      }

      return true;
    };

    const findAndInjectBadge = () => {
      console.log(`🔍 [MissionBadgeInjector] Attempt ${retryCount + 1}/${maxRetries}`);

      const missionTitle = document.querySelector('h1[aria-label*="Centro di Comando Agente"]') as HTMLElement | null
        || document.querySelector('h1[aria-label*="M1SSION"]') as HTMLElement | null;

      const controlCenterNode = Array.from(document.querySelectorAll('p, h2, div, span'))
        .find(el => el.textContent?.includes('Centro di Comando Agente')) as HTMLElement | null;

      if (!missionTitle && !controlCenterNode) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(findAndInjectBadge, retryDelay);
        } else {
          console.warn('[MissionBadgeInjector] Targets not found after retries');
        }
        return;
      }

      positionBadge(missionTitle, controlCenterNode);
    };

    findAndInjectBadge();

    const onPageShow = () => findAndInjectBadge();
    window.addEventListener('pageshow', onPageShow);

    return () => {
      const node = document.getElementById('mission-status-badge-portal');
      if (node) node.remove();
      if (observer) observer.disconnect();
      window.removeEventListener('pageshow', onPageShow);
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
