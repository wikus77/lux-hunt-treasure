// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Home, MessageSquare, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { hapticLight } from "@/utils/haptics";
import { subscribeAudioEvent } from "@/utils/audioController";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
// 🎬 UNIFIED: Tutti i briefing ora usano lo stesso fullscreen modal
import BriefingFlipOverlay from "@/components/shared/BriefingFlipOverlay";
import { AudioManager } from "@/lib/audio/AudioManager"; // 🔧 FIX: Singleton Audio
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Navigation Component - Floating Pill Style - SIMPLIFIED

// 🔊 Audio paths for navigation sounds (usati dal singleton AudioManager)
const MAP_BOOM_SOUND = '/assets/audio/DSGNBoom-A_fast_6-second_cine-Elevenlabs.mp3';
const BUZZ_BOOM_SOUND = '/assets/audio/DSGNBoom-Create_an_intense_ci-Elevenlabs.mp3';
const HOME_SOUND = '/assets/audio/m1-home.mp3';

// 🎬 Video paths for briefing videos
const BUZZ_VIDEO = '/assets/video/BUZZ-BRIF-VIDEO-01.mp4';
const HOME_VIDEO = '/assets/video/HOME-BRIF-VIDEO.mp4';
const MAP_VIDEO = '/assets/video/BUZZ-BRIF-VIDEO.mp4';
const AION_VIDEO = '/assets/video/AION-BRIF-VIDEO.mp4';
const CLASSIFICA_VIDEO = '/assets/video/CLASSIFICA-BRIF-VIDEO.mp4';
const NOTIFICHE_VIDEO = '/assets/video/NOTIFICHE-BRIF-VIDEO.mp4';

const BottomNavigationComponent = () => {
  // 🎬 State per i modal video
  const [showBuzzVideoModal, setShowBuzzVideoModal] = useState(false);
  const [showHomeVideoModal, setShowHomeVideoModal] = useState(false);
  const [showMapVideoModal, setShowMapVideoModal] = useState(false);
  const [showAionVideoModal, setShowAionVideoModal] = useState(false);
  const [showClassificaVideoModal, setShowClassificaVideoModal] = useState(false);
  const [showNotificheVideoModal, setShowNotificheVideoModal] = useState(false);
  const { user } = useUnifiedAuth();
  
  // 🔧 FIX: Usa AudioManager singleton invece di refs multiple
  // Questo previene memory leak e crash su iOS Safari
  
  // 🔇 Stop all navigation sounds
  const stopAllSounds = useCallback(() => {
    AudioManager.stopCategory('navigation');
  }, []);
  
  // Play sound when clicking home icon
  const playHomeSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(HOME_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // Play boom sound when clicking map icon
  const playMapSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(MAP_BOOM_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // Play boom sound when clicking buzz icon
  const playBuzzSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(BUZZ_BOOM_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // Play sound when clicking AION icon
  const playAionSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(HOME_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // Play sound when clicking Notifiche icon
  const playNotificheSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(HOME_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // Play sound when clicking Classifica icon
  const playClassificaSound = useCallback(() => {
    stopAllSounds();
    AudioManager.play(HOME_SOUND, { volume: 0.7, category: 'navigation' });
  }, [stopAllSounds]);
  
  // 🔇 Pause current playing audio (called by buttons via audioController)
  const pauseCurrentAudio = useCallback(() => {
    AudioManager.stopCategory('navigation');
  }, []);
  
  // 🔊 Resume paused audio - ora gestito dal singleton
  const resumeCurrentAudio = useCallback(() => {
    // Il singleton gestisce automaticamente il resume
  }, []);
  
  // 📡 Subscribe to audio events from other components
  useEffect(() => {
    const unsubPause = subscribeAudioEvent('pause-page-audio', pauseCurrentAudio);
    const unsubResume = subscribeAudioEvent('resume-page-audio', resumeCurrentAudio);
    
    return () => {
      unsubPause();
      unsubResume();
    };
  }, [pauseCurrentAudio, resumeCurrentAudio]);
  
  const [currentPath] = useLocation();
  const { unreadCount } = useNotifications();
  const { navigate } = useWouterNavigation();
  const isPWA = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches;

  // Navigation links
  const links = [
    { 
      icon: <Home className="h-6 w-6" strokeWidth={1.5} />, 
      path: "/home",
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>, 
      path: "/map-3d-tiler",
    },
    {
      icon: <Circle strokeWidth={1.5} className="h-6 w-6" />,
      path: "/buzz",
      isSpecial: true,
    },
    { 
      icon: <span className="text-lg font-semibold">AIᴼᴺ</span>,
      path: "/intelligence",
    },
    {
      icon: <MessageSquare className="h-6 w-6" strokeWidth={1.5} />,
      path: "/notifications",
      badge: unreadCount > 0,
      badgeCount: unreadCount,
    },
    { 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-6 h-6">
        <polygon points="12,18 4,7 20,7" />
      </svg>, 
      path: "/leaderboard",
    },
  ];

  // 🎬 Callbacks per i video modal
  const handleHomeVideoContinue = useCallback(() => {
    playHomeSound();
    navigate('/home');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playHomeSound, navigate, isPWA]);

  const handleMapVideoContinue = useCallback(() => {
    playMapSound();
    navigate('/map-3d-tiler');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playMapSound, navigate, isPWA]);

  const handleBuzzVideoContinue = useCallback(() => {
    playBuzzSound();
    navigate('/buzz');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playBuzzSound, navigate, isPWA]);

  const handleAionVideoContinue = useCallback(() => {
    playAionSound();
    navigate('/intelligence');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playAionSound, navigate, isPWA]);

  const handleNotificheVideoContinue = useCallback(() => {
    playNotificheSound();
    navigate('/notifications');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playNotificheSound, navigate, isPWA]);

  const handleClassificaVideoContinue = useCallback(() => {
    playClassificaSound();
    navigate('/leaderboard');
    if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
  }, [playClassificaSound, navigate, isPWA]);

  // PWA compatible navigation handler
  const handleNavigationPWA = async (link: typeof links[0], e: React.MouseEvent) => {
    e.preventDefault();
    hapticLight();
    
    // 🎬 Mostra video modal per ogni pagina
    switch (link.path) {
      case '/home':
        setShowHomeVideoModal(true);
        return;
      case '/map-3d-tiler':
        setShowMapVideoModal(true);
        return;
      case '/buzz':
        setShowBuzzVideoModal(true);
        return;
      case '/intelligence':
        setShowAionVideoModal(true);
        return;
      case '/notifications':
        setShowNotificheVideoModal(true);
        return;
      case '/leaderboard':
        setShowClassificaVideoModal(true);
        return;
      default:
        // Per altre pagine, naviga direttamente
        navigate(link.path);
        if (isPWA) setTimeout(() => window.scrollTo(0, 0), 100);
    }
  };

  return (
    <div
      className="bottom-navigation-ios"
      data-onboarding="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: isPWA ? "env(safe-area-inset-bottom, 8px)" : "8px",
        pointerEvents: "none",
        // GPU acceleration
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        isolation: "isolate",
        willChange: "transform",
        visibility: "visible",
        opacity: 1,
      }}
    >
      <div
        className="bottom-nav-pill"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          maxWidth: "400px",
          height: "64px",
          // 🔧 OPTION B: WHITE GLASS for iOS native (CSS overrides this)
          // Default dark for web, CSS makes it white for body.is-native
          background: "rgba(15, 20, 30, 0.45)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "32px",
          padding: "0 8px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.08)",
          pointerEvents: "auto",
        }}
      >
        {links.map((link) => {
          const isActive = currentPath === link.path || 
            (link.path === '/map-3d-tiler' && currentPath === '/living-map-3d');
          
          return (
            <motion.button
              key={link.path}
              onClick={(e) => handleNavigationPWA(link, e)}
              className={`relative flex flex-col items-center justify-center bottom-nav-btn ${isActive ? 'bottom-nav-active' : 'bottom-nav-inactive'}`}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: "8px 12px",
                WebkitTapHighlightColor: "transparent",
                // 🔧 OPTION B: Color controlled via CSS for iOS native
                // CSS uses .bottom-nav-active/.bottom-nav-inactive classes
                color: isActive ? "#00D1FF" : "#8B9CAF",
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Background circle when active */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.4)",
                      zIndex: 0,
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Active indicator line */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "2px",
                      width: "20px",
                      height: "3px",
                      backgroundColor: "#00D1FF",
                      borderRadius: "2px",
                      boxShadow: "0 0 8px #00D1FF, 0 0 16px #00D1FF",
                      zIndex: 2,
                    }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative z-[1]">
                {link.icon}
                
                {/* Notification badge */}
                {link.badge && link.badgeCount && (
                  <motion.div 
                    className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-[#FF59F8] rounded-full"
                    style={{ boxShadow: "0 0 8px rgba(255, 89, 248, 0.7)" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {link.badgeCount > 9 ? "9+" : link.badgeCount}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* 🎬 UNIFIED Modal Video Briefings - Tutti fullscreen con CTA bianco glass */}
      <BriefingFlipOverlay
        open={showBuzzVideoModal}
        onClose={() => setShowBuzzVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleBuzzVideoContinue}
        videoSrc={BUZZ_VIDEO}
        storageKey="m1_buzz_video_modal_dismissed"
        title="BRIEFING BUZZ"
        subtitle="Guarda il video introduttivo prima di iniziare"
      />
      
      <BriefingFlipOverlay
        open={showHomeVideoModal}
        onClose={() => setShowHomeVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleHomeVideoContinue}
        videoSrc={HOME_VIDEO}
        storageKey="m1_home_video_dismissed"
        title="M1SSION HOME"
        subtitle="Briefing: Benvenuto nel tuo quartier generale"
      />
      
      <BriefingFlipOverlay
        open={showMapVideoModal}
        onClose={() => setShowMapVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleMapVideoContinue}
        videoSrc={MAP_VIDEO}
        storageKey="m1_map_video_dismissed"
        title="BUZZ MAP"
        subtitle="Briefing: La mappa della missione"
      />
      
      <BriefingFlipOverlay
        open={showAionVideoModal}
        onClose={() => setShowAionVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleAionVideoContinue}
        videoSrc={AION_VIDEO}
        storageKey="m1_aion_video_dismissed"
        title="AION AI"
        subtitle="Briefing: L'intelligenza artificiale al tuo servizio"
      />
      
      <BriefingFlipOverlay
        open={showClassificaVideoModal}
        onClose={() => setShowClassificaVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleClassificaVideoContinue}
        videoSrc={CLASSIFICA_VIDEO}
        storageKey="m1_classifica_video_dismissed"
        title="CLASSIFICA"
        subtitle="Briefing: La classifica dei migliori agenti"
      />
      
      <BriefingFlipOverlay
        open={showNotificheVideoModal}
        onClose={() => setShowNotificheVideoModal(false)}
        userEmail={user?.email}
        onContinue={handleNotificheVideoContinue}
        videoSrc={NOTIFICHE_VIDEO}
        storageKey="m1_notifiche_video_dismissed"
        title="NOTIFICHE"
        subtitle="Briefing: Le notifiche della missione"
      />
    </div>
  );
};

const BottomNavigation = BottomNavigationComponent;
export default BottomNavigation;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
