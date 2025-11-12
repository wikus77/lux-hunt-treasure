// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from "react";
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

const AppHome = () => {
  // AppHome component rendering
  
  // 🔐 CRITICAL FIX: ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
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

  // 🔐 ALL EFFECTS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  // Check for developer access and Capacitor environment
  useEffect(() => {
    const checkAccess = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      // Access check completed
      
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
  
  // User state validated
  
  // 🔐 SAFE EARLY RETURN - Now all hooks are called above
  // CRITICAL FIX: Ensure consistent return to prevent hook count mismatch
  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070818]">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Caricamento...</p>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Second check for user without causing hook issues
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070818]">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Inizializzazione utente...</p>
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
      <div className="flex min-h-screen items-center justify-center bg-[#070818] px-4">
        <div className="p-8 bg-red-800/30 rounded-xl text-center w-full max-w-sm glass-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-300">Errore</h2>
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

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>M1SSION™ - Home App</title>
      </Helmet>
      
      {/* CRITICAL FIX: Remove duplicate header/nav - GlobalLayout handles these */}
      <div className="px-4 space-y-6">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="relative min-h-screen overflow-y-auto"
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

                  <div className="container mx-auto px-3 pb-20">
                <motion.div
                  className="relative text-center my-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 
                    id="m1-home-title"
                    data-m1-anchor="home-title"
                    className="text-4xl font-orbitron font-bold"
                    role="banner"
                    aria-label="M1SSION Centro di Comando Agente"
                  >
                    <span className="text-[#00D1FF]" style={{ 
                      textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                    }}>M1</span>
                    <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                  </h1>
                  
                  {/* ON M1SSION Badge Portal - Fixed slot for MissionBadgeInjector */}
                  <div 
                    id="mission-status-badge-portal" 
                    data-anchor="m1-header-badge"
                    data-persistent="true"
                    className="flex justify-center my-3"
                  />
                  
                  <p className="text-gray-400 mt-2">Centro di Comando Agente</p>

                  {/* M1U Pill Slot - Home (inside hero, aligned left) */}
                  <div
                    id="m1u-pill-home-slot"
                    className="absolute top-0 left-0 z-[1000] flex items-center gap-3"
                    style={{ 
                      pointerEvents: 'auto',
                      paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))'
                    }}
                    aria-hidden={false}
                  >
                    <M1UPill showLabel showPlusButton />
                  </div>
                </motion.div>


                <main 
                  id="main-content" 
                  className="max-w-screen-xl mx-auto"
                  role="main"
                  aria-label="Contenuto principale"
                >
                  {/* 🔥 CONTAINER OTTIMIZZATO: Eliminato min-h per evitare overflow */}
                  <div>
                    <CommandCenterHome />
                  </div>
                  
                  {/* M1SSION PANEL™ Button - Only for Admin/Developer - SENZA MARGINI */}
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
                        whileHover={{ 
                          scale: 1.02,
                          borderColor: 'rgba(67, 97, 238, 0.6)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Animated border pulse */}
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
                            <p className="text-gray-400 text-sm">
                              Centro AI Generativo - Accesso Test
                            </p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppHome;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™