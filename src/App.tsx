// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "./components/ui/sonner";
// 🛡️ MediaSession Blocker - DEVE essere importato PRIMA di tutto per bloccare la Dynamic Island
import '@/lib/media/MediaSessionBlocker';
import { BadgeAuditReport } from "./components/debug/BadgeAuditReport";
import PushFrozenNotice from "./banners/PushFrozenNotice";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { XpSystemManager } from "./components/xp/XpSystemManager";
// DynamicIslandAutoActivator RIMOSSO - ora solo su IntelligencePage quando AION parla
// import DynamicIslandAutoActivator from "./components/dynamic-island/DynamicIslandAutoActivator";
import DynamicIslandContextManager from "./components/dynamic-island/DynamicIslandContextManager";
import { DynamicIslandProvider } from "./contexts/DynamicIslandContext";
import { HelmetProvider } from "./components/helmet/HelmetProvider";
import SkipToContent from "./components/accessibility/SkipToContent";
import OfflineIndicator from "./components/offline/OfflineIndicator";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { ProductionSafetyWrapper } from "./components/ProductionSafetyWrapper";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
// OneSignal rimosso - usando solo FCM
import { IOSPermissionManager } from "./components/IOSPermissionManager";
import { NativePushPermissionTrigger } from "./components/push/NativePushPermissionTrigger";
import { AndroidPushSetup } from "./components/android/AndroidPushSetup";
import { PushNotificationSetup } from "./components/PushNotificationSetup";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import { usePWAStabilizer } from "./hooks/usePWAStabilizer";
import { usePushSync } from "./hooks/usePushSync";
import { useActivityTracker } from "./hooks/useActivityTracker";
import { useState, useEffect } from "react";
import LegalOnboarding from "./components/legal/LegalOnboarding";
import { InterestSignalsProvider } from "./components/InterestSignalsProvider";
import FirstLoginQuizManager from "./components/quiz/FirstLoginQuizManager";
// WalkthroughManager RIMOSSO - verrà ricreato
import DNAManager from "./components/dna/DNAManager";
import { WelcomeBonusManager } from "./components/welcome";
import { CookieConsentManager } from "./features/consent/CookieConsentManager";
// Import per esporre funzione popolamento KB globalmente
import "@/utils/populateKnowledgeBase";
import { NorahProactiveManager } from "./components/norah/NorahProactiveManager";
import { MissionBadgeInjector } from "./components/home/MissionBadgeInjector";
import { RewardZonePopup } from "./components/rewards/RewardZonePopup";
// 🏪 STORE COMPLIANCE: Lazy load PulseBreaker components (hidden on native)
import { isPulseBreakerEnabled } from "./utils/storeCompliance";
import { PulseBreakerInfoPopup } from "./components/popups/PulseBreakerInfoPopup";
import { GlobalPulseBreakerModal } from "./components/popups/GlobalPulseBreakerModal";
import { UpdateBanner } from "./components/sw/UpdateBanner";
import '@/features/living-map/styles/livingMap.css';
import { OnboardingProvider, OnboardingOverlay } from "./components/onboarding";
import { PULSE_ENABLED, VICTORY_ORCH_QA_LOCALSTORAGE_PRESERVE_KEYS } from "@/config/featureFlags";
import { PulseContributionListener, PulseRewardNotification } from "@/features/pulse";
import { RouteAnnouncer } from "./components/a11y/RouteAnnouncer";
import { useRouteAnnouncements } from "./hooks/useRouteAnnouncements";
import { ReconnectBadge } from "./components/net/ReconnectBadge";
import { M1UnitsDebugPanel } from "./components/debug/M1UnitsDebugPanel";
import { initGA4, trackPageView } from './lib/analytics/ga4';
import { initAnalytics, track } from './lib/analytics';
import { useLocation } from 'wouter';
import M1LogoSplash from "./components/intro/M1LogoSplash";
import { useGlobalGlitchListener } from "./hooks/useGlobalGlitch";
// 🌑 M1SSION™ SHADOW PROTOCOL™
import { EntityOverlay } from "./components/overlay/EntityOverlay";
import { ShadowProtocolEngine } from "./components/overlay/ShadowProtocolEngine";
// 🔄 Cache Buster - Forza refresh cache quando necessario
import { checkAndClearCache } from "./lib/cache/cacheBuster";
import { ShadowBehaviorsLayer } from "./components/overlay/ShadowBehaviorsLayer";
// 🎬 Mission Start Sequence (fullscreen, fuori dal portal)
import { MissionIntroOverlay } from "./components/overlay/MissionIntroOverlay";
// 🎁 Prize Intro Cinematic System
import { MissionPrizeIntroOverlay } from "./components/overlay/MissionPrizeIntroOverlay";
// ⚔️ TRON Battle Defense Manager - Global listener for incoming attacks
import { BattleDefenseManager } from "./components/battle/BattleDefenseManager";
// 📱 Native Safe Area Provider - Cross-device layout adaptation
import { NativeSafeAreaProvider } from "./components/layout/NativeSafeAreaProvider";
// 🎰 Global M1U Slot Overlay — PRE→SLOT→POST on any credit (Shop, Wheel, Missions, etc.)
import { GlobalM1UCreditOverlay } from "./features/m1u/GlobalM1UCreditOverlay";
import { GlobalPERewardOverlay } from "./features/pulse/components/GlobalPERewardOverlay";
import { VictoryOrchestrationProvider } from "@/features/victoryOrchestration/VictoryOrchestrationContext";
import { VictoryOrchQaHarnessPanel } from "@/features/victoryOrchestration/qa/VictoryOrchQaHarnessPanel";
// 🎯 Daily Missions System
import { DailyMissionsController } from "./missions";
// 🎯 FIRST SESSION: Micro-missions (global - works on all pages)
import { MicroMissionsCard } from "./components/first-session";
// 🏆 CLUE MILESTONES: Global watcher for level-up rewards
import { ClueMilestoneWatcher } from "./components/milestones/ClueMilestoneWatcher";
// 🎖️ HIERARCHY RANK: Global watcher for rank-up video popups
import { RankUpWatcher } from "./components/rank/RankUpWatcher";
// 🎉 PROGRESS FEEDBACK: Celebration overlays and progress toasts
import { ProgressFeedbackProvider } from "./components/feedback";
// 📱 iOS KEYBOARD: Hide bottom nav when keyboard is open (like Telegram)
import { useKeyboardVisible } from "./hooks/useKeyboardVisible";
// 📐 VIEWPORT DEBUG HUD: Shows real-time viewport metrics for iOS WKWebView debugging
import { ViewportHUD } from "./components/debug/ViewportHUD";
// 📏 VIEWPORT HEIGHT FIX: Initialize --app-height for iOS WKWebView
import { initViewportHeight } from "./utils/viewportHeight";
// 📱 NATIVE DETECTION: For scoped native-only CSS fixes
import { Capacitor } from '@capacitor/core';
import { primeVictorySoundsOnUserGesture } from '@/utils/victoryRewardSounds';

function App() {
  // 📱 NATIVE CLASS: Add 'is-native' to body for scoped iOS WKWebView fixes
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('is-native');
      console.log('📱 [App] Native platform detected, added is-native class');
    }
  }, []);
  // 🚀 NATIVE APP FEEL: Show splash on EVERY app launch (but only once per session)
  // sessionStorage clears when app is closed, localStorage persists
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash was already shown in this session
    return !sessionStorage.getItem('m1_splash_shown_session');
  });
  // SW registration now handled by swControl utils - no duplicate registration
  const [location] = useLocation();
  
  // 🔄 Cache Buster - Check and clear stale caches on app start
  useEffect(() => {
    const cacheCleared = checkAndClearCache();
    if (cacheCleared) {
      console.log('🔄 [App] Cache cleared, app will reload fresh data');
    }
  }, []);

  // 📏 Initialize viewport height for iOS WKWebView compatibility
  useEffect(() => {
    initViewportHeight();
  }, []);

  // Victory SFX: preload Audio elements after first user gesture (iOS WKWebView–safe)
  useEffect(() => {
    primeVictorySoundsOnUserGesture();
  }, []);

  // Initialize GA4 and M1SSION Analytics once on mount
  useEffect(() => {
    initGA4();
    initAnalytics(); // M1SSION internal analytics with batching
  }, []);

  // Preload heavy components in background for smoother navigation
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      // Preload map after 2 seconds
      import('@/pages/sandbox/MapTiler3D').catch(() => {});
    }, 2000);
    return () => clearTimeout(preloadTimer);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (location) {
      trackPageView(location);
      track('route_viewed', { route: location });
    }
  }, [location]);
  
  // A11y: Route announcements for screen readers
  useRouteAnnouncements();

  // Debug iOS rendering issue - essential for troubleshooting black screen
  useEffect(() => {
    console.log('🍎 [iOS DEBUG] App rendering started');
    console.log('🍎 [iOS DEBUG] Environment:', {
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      protocol: window.location.protocol,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // CSS Variables check (without creating DOM elements to avoid flicker)
    const styles = getComputedStyle(document.documentElement);
    console.log('🍎 [iOS DEBUG] CSS Variables:', {
      background: styles.getPropertyValue('--background').trim(),
      color: styles.getPropertyValue('--foreground').trim(),
      hasBackground: !!styles.getPropertyValue('--background').trim(),
      hasColor: !!styles.getPropertyValue('--foreground').trim(),
    });
    
    // Remove any reload triggers that could cause loops
  }, []);

  // PE modal forensics: global JS error trap (temporary — remove after diagnosis)
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      console.log('[PE-TRACE-JS-ERROR] onerror', { message: ev.message, source: ev.filename, lineno: ev.lineno, colno: ev.colno, stack: ev.error?.stack });
      return false;
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      console.log('[PE-TRACE-JS-ERROR] unhandledrejection', { reason: ev.reason, message: ev.reason?.message, stack: ev.reason?.stack });
    };
    window.onerror = onError;
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.onerror = null;
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  
  // Initialize PWA stabilizer (prevents reload loops and manages push)
  usePWAStabilizer();
  
  // Push sync - sincronizza subscription al login e mantiene SW attivo
  usePushSync();
  
  // Activity tracker - traccia comportamento per notifiche intelligenti
  useActivityTracker();

  // 🎬 Global Glitch Listener - riceve broadcast da admin
  useGlobalGlitchListener();
  
  // 📱 iOS KEYBOARD: Toggle class to hide bottom nav when keyboard is open
  const keyboardOpen = useKeyboardVisible();
  useEffect(() => {
    document.documentElement.classList.toggle("m1-keyboard-open", keyboardOpen);
    document.body.classList.toggle("m1-keyboard-open", keyboardOpen);
  }, [keyboardOpen]);
  
  return (
    <div className="app-shell relative">
      {/* 🚀 M1 INTRO SPLASH - Shows M1SSION_INTRO.mp4 on EVERY app launch (native feel) */}
      {showSplash && (
        <M1LogoSplash 
          onComplete={() => {
            setShowSplash(false);
            // Mark splash as shown for this session (clears when app closes)
            sessionStorage.setItem('m1_splash_shown_session', 'true');
          }} 
          duration={4500} // 4.5 seconds - loads user data in background
        />
      )}
      
      {/* SFONDO GRADIENTE FULLSCREEN - z-index: 0 per stare SOTTO tutto ma VISIBILE */}
      <div 
        className="m1-fullscreen-bg" 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 1200px 800px at 85% -10%, rgba(0, 229, 255, 0.35), transparent 50%),
            radial-gradient(ellipse 1000px 700px at -15% 25%, rgba(123, 46, 255, 0.30), transparent 50%),
            radial-gradient(ellipse 800px 500px at 50% 90%, rgba(252, 30, 255, 0.15), transparent 45%),
            linear-gradient(180deg, #0a0b0f 0%, #0c0e14 25%, #0e1118 50%, #0a0c10 75%, #080a0d 100%)
          `,
        }}
      />
      <div className="m1-grain"></div>
      
      {/* 📱 NATIVE SAFE AREA PROVIDER - Injects CSS variables for cross-device layout */}
      <NativeSafeAreaProvider debug={import.meta.env.DEV}>
      <PushFrozenNotice />
      <ErrorBoundary fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
          <div className="glass-card p-6 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold mb-4">ERRORE CRITICO DI SISTEMA</h2>
            <p className="mb-6">L'applicazione ha riscontrato un errore fatale. Ricarica la pagina.</p>
            <button 
              onClick={() => {
                const preserved: [string, string][] = [];
                for (const key of VICTORY_ORCH_QA_LOCALSTORAGE_PRESERVE_KEYS) {
                  try {
                    const v = localStorage.getItem(key);
                    if (v !== null) preserved.push([key, v]);
                  } catch {
                    /* ignore */
                  }
                }
                localStorage.clear();
                for (const [key, v] of preserved) {
                  try {
                    localStorage.setItem(key, v);
                  } catch {
                    /* ignore */
                  }
                }
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink rounded-md"
            >
              🔄 RIAVVIA EMERGENZA
            </button>
          </div>
        </div>
      }>
        <ProductionSafetyWrapper>
          <ProductionSafety>
            <HelmetProvider>
              <SkipToContent />
              <OfflineIndicator />
              <RouteAnnouncer />
              <ReconnectBadge />
              <Router>
              <SoundProvider>
                <AuthProvider>
                  <VictoryOrchestrationProvider>
                  {/* M1U Global Slot Overlay: inside AuthProvider so M1UPill can use useUnifiedAuth (fix post-IAP crash) */}
                  <GlobalM1UCreditOverlay />
                  {/* PE Global Fullscreen Reward: Energy Injection modal on every PE credit */}
                  <GlobalPERewardOverlay />
                  {/* QA-only: synthetic victory orchestration scenarios (flagged off in production). */}
                  <VictoryOrchQaHarnessPanel />
                  {/* 🚫 DISABILITATO 16/01/2026: OnboardingProvider rimosso (forzava navigazione) */}
                  {/* <OnboardingProvider> */}
                  <InterestSignalsProvider>
                    {/* OneSignal rimosso - usando solo FCM */}
                    {/* © 2025 M1SSION™ - Conditional render to prevent loop */}
                    {!localStorage.getItem('m1ssion_legal_consent') && <LegalOnboarding />}
                    {/* 🚫 QUIZ AGENTE DISABILITATO - Da ricreare in futuro */}
                    {/* <FirstLoginQuizManager /> */}
                    <DNAManager />
                    {/* 🎁 Welcome Bonus: 500 M1U per nuovi utenti dopo onboarding */}
                    <WelcomeBonusManager />
                    {/* 🎯 Daily Missions System */}
                    <DailyMissionsController />
                    {/* 🎯 FIRST SESSION: Micro-missions (global - works on all pages) */}
                    <MicroMissionsCard />
                    {/* 🏆 CLUE MILESTONES: Global watcher for level-up rewards */}
                    <ClueMilestoneWatcher />
                    {/* 🎖️ HIERARCHY RANK: Global watcher for rank-up video popups */}
                    <RankUpWatcher />
                    <CookieConsentManager />
                    {/* 🚫 DISABILITATO 16/01/2026: Onboarding LITE rimosso (appariva ogni login) */}
                    {/* <OnboardingOverlay /> */}
                    <WouterRoutes />
                    <InstallPrompt />
                    <IOSPermissionManager />
                    {/* 🔔 NATIVE PUSH: Triggers iOS/Android permission dialog after login */}
                    <NativePushPermissionTrigger />
                    <AndroidPushSetup className="hidden" />
                    <PushNotificationSetup className="hidden" />
                    <XpSystemManager />
                    <DynamicIslandProvider>
                      {/* DynamicIslandAutoActivator RIMOSSO per risparmio batteria */}
                      {/* Ora si attiva SOLO su IntelligencePage quando AION parla */}
                      <DynamicIslandContextManager />
                    </DynamicIslandProvider>
                    <NorahProactiveManager />
                    <MissionBadgeInjector />
                    {/* 🎯 REWARD ZONE: Popup per scoprire marker rewards */}
                    <RewardZonePopup />
                    {/* 🏪 STORE COMPLIANCE: PulseBreaker hidden on native (gambling-like) */}
                    {isPulseBreakerEnabled() && (
                      <>
                        {/* 🎮 PULSE BREAKER: Popup informativo dopo 2 minuti */}
                        <PulseBreakerInfoPopup />
                        {/* 🎮 PULSE BREAKER: Modal del gioco (globale) */}
                        <GlobalPulseBreakerModal />
                      </>
                    )}
                    {/* 🔋 PULSE: Toast globale per contribuzioni energia */}
                    <PulseContributionListener />
                    {/* 🎁 PULSE: Notifiche ricompense soglie */}
                    <PulseRewardNotification />
                    <Toaster />
                    {/* 🌑 SHADOW PROTOCOL™ - Engine + Overlay + Behaviors (dentro AuthProvider) */}
                    <ShadowProtocolEngine />
                    <EntityOverlay />
                    <ShadowBehaviorsLayer />
                    {/* 🎬 Mission Start Sequence (fullscreen, fuori dal portal) */}
                    <MissionIntroOverlay />
                    {/* 🎁 Prize Intro Cinematic (shows after onboarding, before gameplay) */}
                    <MissionPrizeIntroOverlay />
                    {/* ⚔️ TRON Battle Defense - Global listener for incoming attacks */}
                    <BattleDefenseManager />
                    <BadgeAuditReport />
                    {/* M1UnitsDebugPanel nascosto per il lancio - rimuovere in produzione */}
                    {/* <M1UnitsDebugPanel /> */}
                    {/* 🎉 PROGRESS FEEDBACK: Celebration overlays and progress toasts */}
                    <ProgressFeedbackProvider children={null} />
                  </InterestSignalsProvider>
                  {/* </OnboardingProvider> */}
                  </VictoryOrchestrationProvider>
                </AuthProvider>
              </SoundProvider>
            </Router>
          </HelmetProvider>
        </ProductionSafety>
      </ProductionSafetyWrapper>
      </ErrorBoundary>
      </NativeSafeAreaProvider>
      
      {/* Service Worker Update Banner - outside router/auth context */}
      <UpdateBanner />
      
      {/* 📐 VIEWPORT DEBUG HUD: Shows metrics in DEV mode or with ?debug=1 */}
      <ViewportHUD />
    </div>
  );
}

export default App;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™