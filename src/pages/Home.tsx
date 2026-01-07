
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati

import { useState, useEffect } from "react";
import { QRValidationModal } from "@/components/qr/QRValidationModal";
import { motion, AnimatePresence } from "framer-motion";
import CommandCenterHome from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useDynamicIsland } from "@/hooks/useDynamicIsland";
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useMissionManager } from "@/hooks/useMissionManager";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import DeveloperAccess from "@/components/auth/DeveloperAccess";
// CookieBanner RIMOSSO - gestito centralmente da CookieConsentManager in App.tsx
import TermsBanner from '@/components/legal/TermsBanner';
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useOnboardingTutorial } from "@/hooks/useOnboardingTutorial";
// MicroMissionsCard ora è globale in App.tsx
// 🎯 DAILY MISSIONS: Mission pill (same as MapTiler3D)
import { MissionPill } from '@/missions/ui/MissionPill';

const Home = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeToValidate, setQRCodeToValidate] = useState<string | undefined>();
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();
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

  // Attiva il sistema di sicurezza Dynamic Island
  useDynamicIslandSafety();

  // Onboarding tutorial
  const { showTutorial, isLoading: tutorialLoading, hideTutorialForever } = useOnboardingTutorial();

  // Check for developer access and Capacitor environment + PWA standalone mode + QR handling
  useEffect(() => {
    // Check for QR code in URL fragment (from Safari fallback)
    const urlHash = window.location.hash;
    if (urlHash.includes('qr=')) {
      const qrId = urlHash.split('qr=')[1]?.split('&')[0];
      if (qrId) {
        console.log('🎯 QR DETECTED IN HOME:', qrId);
        setQRCodeToValidate(qrId);
        setShowQRModal(true);
        // Clean URL
        window.history.replaceState(null, '', '/home');
      }
    }
    
    const checkAccess = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
      
      setIsCapacitor(isCapacitorApp || isPWAStandalone);
      
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp || isPWAStandalone;
      
      console.log('🏠 HOME access check:', { 
        isMobileDevice, 
        isCapacitorApp, 
        isPWAStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      });
      
      // FORCE ALLOW PWA STANDALONE ACCESS
      if (isPWAStandalone) {
        console.log('📱 PWA STANDALONE DETECTED - Enabling full access');
        setHasAccess(true);
        setIsLoaded(true);
        return;
      }
      
      if (isMobileDevice) {
        // Mobile users need to login properly now
        setHasAccess(false);
      } else if (!isMobileDevice) {
        // Web users get redirected to landing page
        window.location.href = '/';
        return;
      }
    };
    
    checkAccess();
  }, []);

  // Dynamic Island integration for HOME - Active mission con logging avanzato
  useEffect(() => {
    if (hasAccess && isLoaded && currentMission && currentMission.status === 'active') {
      console.log('🏠 HOME: Starting Dynamic Island for active mission:', currentMission.name);
      startActivity({
        missionId: currentMission.id,
        title: currentMission.name,
        status: "Missione attiva",
        progress: currentMission.progress,
        timeLeft: currentMission.timeLeft,
      });
    }
  }, [hasAccess, isLoaded, currentMission, startActivity]);

  // Cleanup migliorato con logging
  useEffect(() => {
    return () => {
      if (currentMission && currentMission.status !== 'active') {
        console.log('🏠 HOME: Cleaning up inactive mission Live Activity');
        endActivity();
      }
    };
  }, [endActivity, currentMission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Real-time notification connection status:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      toast.error("Si è verificato un errore", {
        description: error,
        position: "bottom-center"
      });
    }
  }, [error]);

  const getContentPaddingClass = () => {
    return isCapacitor ? "capacitor-safe-content" : "";
  };

  const getContentPaddingStyle = () => {
    if (!isCapacitor) {
      return { 
        paddingTop: 'calc(72px + env(safe-area-inset-top) + 50px)' 
      };
    }
    return {};
  };

  // Allow access for authenticated users - remove mobile restriction
  // if (isMobile && !hasAccess) {
  //   return <DeveloperAccess />;
  // }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070818] px-4">
        <div className="p-8 bg-red-800/30 rounded-xl text-center w-full max-w-sm m1ssion-glass-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 neon-text-magenta">Errore</h2>
          <p className="text-white/80">{error}</p>
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

  // DEBUG: Add logging to track rendering
  console.log("✅ M1SSION™ Home component rendering with:", { 
    isLoaded, 
    hasAccess, 
    isCapacitor,
    profileImage: !!profileImage,
    timestamp: new Date().toISOString()
  });

  return (
    <>
      {/* © 2025 Joseph MULÉ – M1SSION™ - HEADER VISIBILITY FORCED + PWA STANDALONE */}
      <div 
        id="mission-header-container"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <UnifiedHeader profileImage={profileImage} />
      </div>
      
      <div 
        className="min-h-screen" 
        style={{ 
          paddingTop: '140px', 
          paddingBottom: '120px',
          width: '100vw',
          maxWidth: '100vw',
          overflowX: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0, // 🔧 FIX: Stay below header and bottom nav
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(0, 209, 255, 0.15), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(123, 92, 255, 0.12), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(240, 89, 255, 0.08), transparent 60%),
            linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)
          `,
          backgroundAttachment: 'fixed',
          // 🔧 FIX v2: Block iOS bounce scroll
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* Texture tramata */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05' /%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity: 0.4
          }}
        />
        <Helmet>
          <title>M1SSION™ - Home</title>
        </Helmet>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {notificationsBannerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-x-0 z-[60] px-2 md:px-4 ${isCapacitor ? 'capacitor-safe-content' : ''}`}
                style={!isCapacitor ? { 
                  top: 'calc(72px + env(safe-area-inset-top) + 50px)'
                } : {}}
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

            <div className="container mx-auto px-3">
              <motion.div
                className="text-center my-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl font-orbitron font-bold">
                  <span className="text-[#00D1FF]" style={{ 
                    textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                  }}>M1</span>
                  <span className="text-[#0a0b0f]">SSION<span className="text-xs align-top">™</span></span>
                </h1>
              </motion.div>

              <main className="max-w-screen-xl mx-auto pb-20">
                <CommandCenterHome />
              </main>

              {/* Decorative gradient effect at bottom */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Terms Banner */}
      <TermsBanner />
      </div>
      
      {/* © 2025 Joseph MULÉ – M1SSION™ - BOTTOM NAV VISIBILITY FORCED + PWA STANDALONE */}
      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>

      {/* QR Validation Modal */}
      <QRValidationModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrCode={qrCodeToValidate}
      />

      {/* Onboarding Tutorial */}
      {!tutorialLoading && (
        <OnboardingModal
          isOpen={showTutorial}
          onClose={hideTutorialForever}
        />
      )}

      {/* 🎯 DAILY MISSIONS: Mission pill (stessa posizione della mappa) */}
      <MissionPill />

      {/* MicroMissionsCard ora è globale in App.tsx */}
    </>
  );
};

export default Home;
