// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// MissionBadgeInjector - Renders START M1SSION or ON M1SSION badge ONLY on /home page
// V2 FIX: DB-first, localStorage NON fa più override

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { StartMissionButton } from './StartMissionButton';

// Routes where the badge should appear
const ALLOWED_ROUTES = ['/home', '/'];

export const MissionBadgeInjector = () => {
  const [location] = useLocation();
  // 🔥 FIX: Usa SOLO isEnrolled dal hook (che ora è DB-first)
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();
  const [portalReady, setPortalReady] = useState(false);

  // 🛡️ GUARD: Only render on allowed routes (Home page)
  const isOnHomePage = ALLOWED_ROUTES.includes(location) || location === '/home';

  // 🔥 FIX RIMOSSO: Non leggere più localStorage come override!
  // Il hook useActiveMissionEnrollment ora gestisce tutto correttamente

  // Reset portal when leaving home page
  useEffect(() => {
    if (!isOnHomePage) {
      setPortalReady(false);
    }
  }, [isOnHomePage]);

  useEffect(() => {
    // 🛡️ Don't inject badge on non-home pages
    if (!isOnHomePage || isLoading) return;

    let retryCount = 0;
    const maxRetries = 100; // Reduced from 200
    const retryDelay = 100;
    let headerObserver: MutationObserver | null = null;
    let globalObserver: MutationObserver | null = null;
    let badgeNodeRef: HTMLElement | null = null;

    const getHeaderContext = () => {
      // 🛡️ First check if we're still on home page
      if (!ALLOWED_ROUTES.includes(window.location.pathname) && window.location.pathname !== '/home') {
        return { headerH1: null, headerWrapper: null, subtitle: null };
      }

      // Look for the specific home page title
      let headerH1 = document.getElementById('m1-home-title') as HTMLElement | null;
      
      if (!headerH1) {
        // Look specifically for the home page header with "Centro di Comando"
        headerH1 = document.querySelector('h1[aria-label*="Centro di Comando Agente"]') as HTMLElement | null;
        
        // Fallback: find h1 in the home page content area (not in login/other pages)
        if (!headerH1) {
          const homeContent = document.querySelector('[data-page="home"]') || 
                             document.querySelector('.command-center-home');
          if (homeContent) {
            headerH1 = homeContent.querySelector('h1') as HTMLElement | null;
          }
        }
        
        // Final fallback: only match h1 that's in the main content area with "Centro di Comando" subtitle nearby
        if (!headerH1) {
          const allH1s = Array.from(document.querySelectorAll('h1'));
          headerH1 = allH1s.find(h => {
            const parent = h.closest('div');
            return parent && 
                   h.textContent?.includes('M1SSION') && 
                   parent.textContent?.includes('Centro di Comando Agente');
          }) as HTMLElement | null;
        }
        
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
      // 🛡️ Double check we're on home page
      if (!ALLOWED_ROUTES.includes(window.location.pathname) && window.location.pathname !== '/home') {
        return false;
      }

      const { headerH1, headerWrapper, subtitle } = getHeaderContext();
      if (!headerH1 || !headerWrapper) return false;

      if (!badgeNodeRef) {
        badgeNodeRef = document.getElementById('mission-status-badge-portal');
        if (!badgeNodeRef) {
          badgeNodeRef = document.createElement('div');
          badgeNodeRef.id = 'mission-status-badge-portal';
          badgeNodeRef.setAttribute('data-anchor', 'm1-header-badge');
          badgeNodeRef.className = 'flex justify-center my-3';
          badgeNodeRef.setAttribute('data-persistent', 'true');
        }
      }

      // Anchor strategy: before subtitle if exists, else right after H1
      const isCorrectlyPositioned = subtitle 
        ? badgeNodeRef.nextSibling === subtitle && badgeNodeRef.parentElement === headerWrapper
        : badgeNodeRef.previousElementSibling === headerH1 && badgeNodeRef.parentElement === headerWrapper;

      if (!isCorrectlyPositioned) {
        if (subtitle) {
          headerWrapper.insertBefore(badgeNodeRef, subtitle);
        } else {
          headerH1.insertAdjacentElement('afterend', badgeNodeRef);
        }
      }

      setPortalReady(true);
      return true;
    };

    const findAndInject = () => {
      // 🛡️ Check route before each attempt
      if (!ALLOWED_ROUTES.includes(window.location.pathname) && window.location.pathname !== '/home') {
        return;
      }

      if (ensureBadgePosition()) {
        // Observe header wrapper for structural changes
        const { headerWrapper } = getHeaderContext();
        if (headerWrapper && !headerObserver) {
          headerObserver = new MutationObserver(() => {
            if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
              requestAnimationFrame(() => ensureBadgePosition());
            }
          });
          headerObserver.observe(headerWrapper, { childList: true, subtree: false });
        }
        
        // Global guard: if badge moves or disconnects, reattach (only on home)
        if (!globalObserver) {
          globalObserver = new MutationObserver(() => {
            if (badgeNodeRef && !document.body.contains(badgeNodeRef)) {
              if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
                requestAnimationFrame(() => ensureBadgePosition());
              }
            }
          });
          globalObserver.observe(document.body, { childList: true, subtree: true });
        }
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findAndInject, retryDelay);
      }
    };

    // Start injection
    findAndInject();

    const onRouteChange = () => {
      // 🛡️ Only process if navigating to/from home
      const isHome = ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home';
      if (isHome) {
        requestAnimationFrame(() => {
          setPortalReady(false);
          badgeNodeRef = null;
          setTimeout(findAndInject, 50);
        });
      } else {
        setPortalReady(false);
        badgeNodeRef = null;
      }
    };

    const onPageShow = () => {
      if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
        requestAnimationFrame(findAndInject);
      }
    };
    
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
          requestAnimationFrame(findAndInject);
        }
      }
    };
    
    const onFocus = () => {
      if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
        requestAnimationFrame(findAndInject);
      }
    };

    // Lightweight watchdog: periodically ensure badge is attached on /home only
    const homeCheckInterval = window.setInterval(() => {
      try {
        if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
          ensureBadgePosition();
        }
      } catch {}
    }, 800);
    
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      headerObserver?.disconnect();
      globalObserver?.disconnect();
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onRouteChange);
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.clearInterval(homeCheckInterval);
      badgeNodeRef = null;
    };
  }, [isLoading, isOnHomePage]);

  // Listen for enrollment event
  useEffect(() => {
    const onEnrolled = () => {
      console.log('✅ [MissionBadgeInjector] mission:enrolled event received');
      // 🔥 FIX: Non serve più setEnrolledOverride - il hook gestisce tutto
      // Solo aggiorna il portal se siamo sulla home
      if (ALLOWED_ROUTES.includes(window.location.pathname) || window.location.pathname === '/home') {
        setPortalReady(true);
      }
    };
    
    // 🔥 FIX: Listen for mission reset to force UI update
    const onMissionReset = () => {
      console.log('🔄 [MissionBadgeInjector] mission:reset/missionLaunched event received');
      // Il hook si occupa di pulire la cache e resettare isEnrolled
      setPortalReady(true); // Forza re-render
    };
    
    window.addEventListener('mission:enrolled', onEnrolled);
    window.addEventListener('missionLaunched', onMissionReset);
    window.addEventListener('mission:reset', onMissionReset);
    window.addEventListener('missionReset', onMissionReset); // 🔥 FIX: Anche senza i due punti
    
    return () => {
      window.removeEventListener('mission:enrolled', onEnrolled);
      window.removeEventListener('missionLaunched', onMissionReset);
      window.removeEventListener('mission:reset', onMissionReset);
      window.removeEventListener('missionReset', onMissionReset);
    };
  }, []);

  // 🛡️ Don't render anything if not on home page
  if (!isOnHomePage) return null;
  if (isLoading || !portalReady) return null;

  const portalTarget = document.getElementById('mission-status-badge-portal');
  if (!portalTarget) return null;

  // 🔥 FIX: Usa SOLO isEnrolled dal hook (DB-first)
  // Se iscritto: mostra "ON M1SSION" con gradiente verde-viola
  // Se NON iscritto: mostra "START M1SSION" (StartMissionButton)
  return createPortal(
    isEnrolled ? (
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
