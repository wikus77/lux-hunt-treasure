// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommandCenterHome from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import DeveloperAccess from "@/components/auth/DeveloperAccess";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useLocation } from "wouter";
import { Cpu } from "lucide-react";

const AppHome = () => {
  console.log("🏠 AppHome component rendering");
  
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

  // 🔐 ALL EFFECTS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  // Check for developer access and Capacitor environment
  useEffect(() => {
    const checkAccess = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      console.log('AppHome access check:', { isMobileDevice, isCapacitorApp });
      
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
  
  // 🔐 CRITICAL DEBUG: Log received user state AFTER all hooks
  console.log("🔍 AppHome received user state:", { 
    userId: user?.id, 
    userEmail: user?.email, 
    isAuthenticated, 
    isLoading,
    timestamp: new Date().toISOString()
  });
  
  // 🔐 SAFE EARLY RETURN - Now all hooks are called above
  if (!isAuthenticated || isLoading || !user) {
    console.log("🚨 AppHome: User not ready yet", { isAuthenticated, isLoading, hasUser: !!user });
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070818]">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Caricamento...</p>
        </div>
      </div>
    );
  }


  // Check admin/developer access for Panel button
  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const showPanelButton = isAdmin || isDeveloper;

  console.log('🔍 Panel Button Debug:', { 
    isAdmin, 
    isDeveloper, 
    showPanelButton,
    userEmail: getCurrentUser()?.email,
    hasRoleFunction: typeof hasRole
  });

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
              className="relative"
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
                    <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                  </h1>
                  <p className="text-gray-400 mt-2">Centro di Comando Agente</p>
                </motion.div>

                <main className="max-w-screen-xl mx-auto">
                  <CommandCenterHome />
                  
                  {/* M1SSION PANEL™ Button - Only for Admin/Developer */}
                  {showPanelButton && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="mt-8"
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

// Copyright © 2025 Joseph M1SSION KFT