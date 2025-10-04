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

  // Sync enrollment override from localStorage on mount (persist after navigation)
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('m1_mission_enrolled') === '1';
      if (persisted) setEnrolledOverride(true);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let retryCount = 0;
    const maxRetries = 120;
    const retryDelay = 150;
    let headerObserver: MutationObserver | null = null;
    let globalObserver: MutationObserver | null = null;

    const getHeaderContext = () => {
      let headerH1 = document.getElementById('m1-home-title') as HTMLElement | null;
      if (!headerH1) {
        headerH1 = document.querySelector('h1[aria-label*="Centro di Comando Agente"]') as HTMLElement | null
          || document.querySelector('h1[aria-label*="M1SSION"]') as HTMLElement | null
          || Array.from(document.querySelectorAll('h1')).find(h => h.textContent?.includes('M1SSION')) as HTMLElement | null;
        if (headerH1) {
          headerH1.id = 'm1-home-title';
          headerH1.setAttribute('data-m1-anchor', 'home-title');
        }
      }

      const headerWrapper = headerH1?.closest('div');
      const subtitle = headerWrapper ? Array.from(headerWrapper.querySelectorAll('p, span, div'))
        .find(el => el.textContent?.includes('Centro di Comando Agente')) as HTMLElement | null : null;

      return { headerH1, headerWrapper: headerWrapper as HTMLElement | null, subtitle };
    };

    const ensureBadgePosition = () => {
      const { headerH1, headerWrapper, subtitle } = getHeaderContext();
      if (!headerH1 || !headerWrapper) return false;

      let badgeNode = document.getElementById('mission-status-badge-portal');
      if (!badgeNode) {
        badgeNode = document.createElement('div');
        badgeNode.id = 'mission-status-badge-portal';
        badgeNode.setAttribute('data-anchor', 'm1-header-badge');
        badgeNode.className = 'flex justify-center my-3';
      }

      // Preferred: before subtitle if exists, else right after H1
      if (subtitle && badgeNode.nextSibling !== subtitle) {
        headerWrapper.insertBefore(badgeNode, subtitle);
      } else if (headerH1 && headerH1.nextElementSibling !== badgeNode) {
        headerH1.insertAdjacentElement('afterend', badgeNode);
      }

      setPortalReady(true);
      return true;
    };

    const findAndInject = () => {
      if (ensureBadgePosition()) {
        // Observe header wrapper for changes
        const { headerWrapper } = getHeaderContext();
        if (headerWrapper && !headerObserver) {
          headerObserver = new MutationObserver(() => ensureBadgePosition());
          headerObserver.observe(headerWrapper, { childList: true });
        }
        // Global guard: if someone moves the badge elsewhere, snap it back
        if (!globalObserver) {
          globalObserver = new MutationObserver(() => {
            const badgeNode = document.getElementById('mission-status-badge-portal');
            const { headerWrapper } = getHeaderContext();
            if (badgeNode && headerWrapper && badgeNode.parentElement !== headerWrapper) {
              ensureBadgePosition();
            }
          });
          globalObserver.observe(document.body, { childList: true, subtree: true });
        }
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findAndInject, retryDelay);
      } else {
        console.warn('[MissionBadgeInjector] Header not found after retries');
      }
    };

    findAndInject();

    const onPageShow = () => findAndInject();
    window.addEventListener('pageshow', onPageShow);

    return () => {
      headerObserver?.disconnect();
      globalObserver?.disconnect();
      window.removeEventListener('pageshow', onPageShow);
      const node = document.getElementById('mission-status-badge-portal');
      if (node) node.remove();
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
