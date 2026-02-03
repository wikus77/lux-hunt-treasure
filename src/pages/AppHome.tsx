// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommandCenterHome from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import DeveloperAccess from "@/components/auth/DeveloperAccess";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useLocation } from "wouter";
import { Cpu } from "lucide-react";
import { useDeepLinkQR } from "@/hooks/useDeepLinkQR";
import M1UPill from "@/features/m1u/M1UPill";
import { PageSkeleton } from "@/components/ui/skeleton-loader";
// AgentEnergyPill ora in CommandCenterHome (posizione floating)
import { PULSE_ENABLED } from "@/config/featureFlags";
import StreakPill from "@/components/gamification/StreakPill";
import CashbackVaultPill from "@/components/home/CashbackVaultPill";
import ShopPill from "@/components/shop/ShopPill";
import MissionSync from "@/components/home/MissionSync";
// STANDBY: Sistema hint inattività disabilitato - riattivare se necessario
// import { InactivityHint } from "@/components/first-session";
import { NextActionContainer, MotivationalPopup, FortuneWheel } from "@/components/feedback";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";
// 🆕 REVOLUT LAYOUT: Prize carousel at top
const PrizeVision = lazy(() => import("@/components/command-center/home-sections/PrizeVision").then(m => ({ default: m.PrizeVision })));
import { useMissionStatus } from "@/hooks/useMissionStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";
// 🎨 Web-first gradient overlay for iOS safe area
import { TopSafeGradient } from "@/components/ui/TopSafeGradient";

const AppHome = () => {
  // AppHome component rendering
  
  // 🔐 CRITICAL FIX: ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFortuneWheel, setShowFortuneWheel] = useState(false);
  
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  // 🔧 FIX 25/01/2026: Synchronous detection - MUST be true BEFORE first render
  // Previous bug: useState(false) + useEffect caused race condition where MissionSync
  // mounted with disabled=false, attached listeners, then disabled changed to true
  const [isCapacitor] = useState(() => !!(window as any).Capacitor);
  const { hasRole, user, isAuthenticated, isLoading, getCurrentUser } = useUnifiedAuth();
  const [, navigate] = useLocation();

  // 🔐 ALL NOTIFICATION HOOKS CALLED BEFORE CONDITIONALS
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  } = useNotificationManager();

const { isConnected } = useRealTimeNotifications();

  // Deep link QR handler (runs once on mount)
  useDeepLinkQR();

  // 🎯 MAP-FIRST REDIRECT: Nuovi utenti vanno alla mappa per prima cosa
  useEffect(() => {
    const isFirstSession = !localStorage.getItem('m1_first_session_completed');
    const hasSeenMap = localStorage.getItem('m1_has_seen_map');
    const redirectAttempted = localStorage.getItem('m1_map_redirect_attempted');
    
    // Se è prima sessione, non ha visto la mappa e non abbiamo già provato
    if (isFirstSession && !hasSeenMap && !redirectAttempted) {
      console.log('[AppHome] 🗺️ MAP-FIRST: Redirect nuovo utente alla mappa');
      localStorage.setItem('m1_map_redirect_attempted', 'true');
      // Piccolo delay per permettere all'app di stabilizzarsi
      setTimeout(() => {
        navigate('/map-3d-tiler');
      }, 500);
    }
  }, [navigate]);

  // 🔐 ALL EFFECTS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  // Check for developer access and Capacitor environment
  useEffect(() => {
    const checkAccess = () => {
      // 🔧 FIX 25/01/2026: isCapacitor now detected synchronously in useState initializer
      // No longer need to setIsCapacitor here
      
      // Allow access for all users since this is an internal authenticated route
      // If users reach this page, they're already authenticated
      setHasAccess(true);
    };
    
    checkAccess();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Real-time notification connection status updated
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      toast.error("Si è verificato un errore", {
        description: error,
        position: "bottom-center"
      });
    }
  }, [error]);

  // 🔄 Mission Sync - Pull to Refresh handler
  const handleMissionSync = async () => {
    console.log('[MissionSync] Refreshing home data...');
    try {
      // Refresh user data
      await getCurrentUser();
      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Mission Sync Complete', {
        description: 'Data aggiornati',
        position: 'top-center',
        duration: 2000
      });
    } catch (err) {
      console.error('[MissionSync] Error:', err);
      toast.error('Sync failed', { position: 'top-center' });
    }
  };
  
  // User state validated
  
  // 🔐 SAFE EARLY RETURN - Now all hooks are called above
  // CRITICAL FIX: Ensure consistent return to prevent hook count mismatch
  // 🔥 M1SSION™: Skeleton ONLY when genuinely loading (not when auth is cached)
  // 🔧 FIX 23/01/2026: Removed !isAuthenticated check — ProtectedRoute handles auth
  // This prevents "ghost skeleton" on iOS cold start when user is already cached
  if (isLoading) {
    return <PageSkeleton variant="default" />;
  }

  // CRITICAL FIX: Second check for user without causing hook issues
  if (!user) {
    return (
      <div className="sn-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inizializzazione utente...</p>
        </div>
      </div>
    );
  }


  // Check admin/developer access for Panel button
  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const showPanelButton = isAdmin || isDeveloper;

  // Panel access determined

  // Show developer access screen for mobile users without access
  if (isMobile && !hasAccess) {
    return <DeveloperAccess />;
  }

  if (error) {
    return (
      <div className="sn-page flex min-h-screen items-center justify-center px-4">
        <div className="p-8 bg-red-100 border border-red-200 rounded-xl text-center w-full max-w-sm shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">Errore</h2>
          <p className="text-gray-700">{error}</p>
          <motion.button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white btn-hover-effect"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Riprova
          </motion.button>
        </div>
      </div>
    );
  }

  // 🔧 P0 FIX 31/01/2026: REMOVED html/body manipulation
  // REASON: LeaderboardPage pattern - theme applied via container className="sn-page" only
  // This ensures deterministic behavior without race conditions during navigation

  // 🆕 REVOLUT LAYOUT: Get mission data for PrizeVision
  const { missionStatus } = useMissionStatus();
  const [progress] = useLocalStorage<number>("mission-progress", 0);
  const prizeProgress = missionStatus?.progressPercent || progress || 46;

  // 🔧 FULL SCREEN M1SSION PRIZE - Come foto riferimento
  
  // 🔧 NO dark body class - keeps white for overscroll
  
  return (
    <div 
      className="w-full overflow-x-hidden sn-page"
      style={{
        position: 'relative',
        zIndex: 0,
      }}
    >
      <Helmet>
        <title>M1SSION™ - Home App</title>
      </Helmet>
      
      {/* 🎨 Web-first gradient overlay: copre safe area iOS */}
      <TopSafeGradient height={160} />
      
      <MissionSync onRefresh={handleMissionSync}>
      
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'relative', zIndex: 2 }}
            >
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* 1️⃣ M1SSION PRIZE - Standard layout (native gradient handles top) */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div 
                className="m1-first-content-offset-compact"
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingBottom: '40px',
                }}
              >
                <Suspense fallback={
                  <div className="w-full h-64 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl animate-pulse flex items-center justify-center">
                    <div className="text-white/40 text-sm">Caricamento...</div>
                  </div>
                }>
                  <PrizeVision progress={prizeProgress} />
                </Suspense>
                
                {/* Pills INSIDE M1SSION PRIZE area */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px 0',
                    flexWrap: 'wrap',
                  }}
                >
                  <StreakPill showLabel />
                  <ShopPill />
                  <CashbackVaultPill variant="compact" />
                </div>
              </div>
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* 2️⃣ PROSSIMI PASSI Container */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div style={{ padding: '0 16px', marginBottom: '16px', marginTop: '8px' }}>
                <SectionErrorBoundary section="Prossima Azione" fallbackHeight="80px">
                  <NextActionContainer />
                </SectionErrorBoundary>
              </div>

              {/* Notifications Banner */}
              {notificationsBannerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-x-0 z-40 px-2 md:px-4"
                  style={{ 
                    top: 'calc(72px + 47px + env(safe-area-inset-top, 0px))'
                  }}
                >
                  <NotificationsBanner
                    notifications={notifications}
                    open={notificationsBannerOpen}
                    unreadCount={unreadCount}
                    onClose={closeNotificationsBanner}
                    onMarkAllAsRead={markAllAsRead}
                    onDeleteNotification={deleteNotification}
                  />
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* 5️⃣ REST OF CONTENT - CommandCenterHome (senza PrizeVision) */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div style={{ padding: '0 16px' }}>
                {/* Hidden title for accessibility */}
                <h1 id="m1-home-title" className="sr-only">M1SSION Centro di Comando</h1>
                <div id="mission-status-badge-portal" data-anchor="m1-header-badge" data-persistent="true" className="flex justify-center my-2 sm:my-3" />

                <main id="main-content" className="max-w-screen-xl mx-auto pb-20" role="main">
                  <SectionErrorBoundary section="Centro Comando" fallbackHeight="400px">
                    <CommandCenterHome />
                  </SectionErrorBoundary>
                  
                  {/* M1SSION PANEL™ Button - Admin/Developer only */}
                  {showPanelButton && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="mt-4"
                    >
                      <motion.button
                        onClick={() => navigate('/panel-access')}
                        className="w-full glass-card p-4 border border-[#4361ee]/30 bg-gradient-to-r from-[#4361ee]/10 to-[#7209b7]/10 rounded-xl group relative overflow-hidden"
                        whileHover={{ scale: 1.02, borderColor: 'rgba(67, 97, 238, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 rounded-xl border border-[#4361ee]/50 animate-pulse group-hover:border-[#4361ee]/80 transition-colors" />
                        <div className="relative flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Cpu className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-orbitron font-bold">
                              <span className="text-[#4361ee]">M1SSION</span>
                              <span className="text-white"> PANEL</span>
                              <span className="text-xs align-top text-[#7209b7]">™</span>
                            </h3>
                            <p className="text-gray-400 text-sm">Centro AI Generativo - Accesso Test</p>
                          </div>
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          </div>
                        </div>
                        
                        {/* Neon glow effect on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4361ee]/0 via-[#4361ee]/5 to-[#7209b7]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    </motion.div>
                  )}
                </main>
              </div>
              
              {/* Decorative gradient effect at bottom like top */}
              <motion.div
                className="fixed bottom-24 left-0 right-0 h-32 pointer-events-none z-[9]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 100%, rgba(0, 209, 255, 0.18), transparent 70%),
                    radial-gradient(ellipse at 20% 100%, rgba(123, 92, 255, 0.15), transparent 60%),
                    radial-gradient(ellipse at 80% 100%, rgba(240, 89, 255, 0.12), transparent 65%)
                  `,
                  filter: 'blur(20px)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      
      {/* 🆕 STANDBY: Hint per utenti inattivi disabilitato
      <InactivityHint type="home" />
      */}
      
      {/* 🎯 Motivational Popup - Shows once per session */}
      <MotivationalPopup pageType="home" />
      
      {/* 🎡 Fortune Wheel Modal */}
      <FortuneWheel 
        isOpen={showFortuneWheel} 
        onClose={() => setShowFortuneWheel(false)} 
      />
      </MissionSync>
      
      {/* 🆕 ALL PILLS moved to UnifiedHeader to avoid stacking context issues */}
    </div>
  );
};

export default AppHome;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™