
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Page Component - FIXED PRICING LOGIC
// V2: Added START M1SSION gate enforcement

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { BuzzInstructions } from '@/components/buzz/BuzzInstructions';
import { BuzzRewardHandler } from '@/components/buzz/BuzzRewardHandler';
import { useBuzzStats } from '@/hooks/useBuzzStats';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
// 🔇 RIMOSSO: useSoundEffects - tutti i suoni ora gestiti da BuzzActionButton
// 🔇 RIMOSSO: createVortexSound - suono vortex eliminato per evitare conflitti con BUZZMAP.mp3
// import { createVortexSound } from '@/utils/audioSynthesis';
// UnifiedHeader e BottomNavigation gestiti da GlobalLayout
import M1UPill from '@/features/m1u/M1UPill';
import { useDebugFlag } from '@/debug/useDebugFlag';
import { DebugBuzzPanel } from '@/debug/DebugBuzzPanel';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { Rocket, Lock, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
// STANDBY: Sistema hint inattività disabilitato - riattivare se necessario
// import { InactivityHint } from '@/components/first-session';
import { MotivationalPopup } from '@/components/feedback';

export const BuzzPage: React.FC = () => {
  const { stats, loading, loadBuzzStats } = useBuzzStats();
  const { user, isLoading: authLoading } = useUnifiedAuth();
  // 🔇 RIMOSSO: playSound - ora usa solo BUZZMAP.mp3 gestito da BuzzActionButton
  // 🔇 RIMOSSO: vortexSoundRef - suono vortex eliminato
  const debugEnabled = useDebugFlag();
  const [forceShow, setForceShow] = React.useState(false);
  const [, setLocation] = useLocation();
  
  // 🚨 START M1SSION GATE: Check if user is enrolled in mission
  const { isEnrolled, isLoading: enrollmentLoading, missionId } = useActiveMissionEnrollment();
  
  // 🔥 FIXED: Use centralized pricing logic from useBuzzCounter
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzDisplayCostM1U,
    loadDailyBuzzCounter  // ✅ ADD THIS for force refresh
  } = useBuzzCounter(user?.id);

  // ✅ FIX 23/12/2025: Rimosso gate ON M1SSION - ora Buzz è sempre accessibile
  // L'utente verrà guidato a premere START M1SSION tramite le micro-missions
  const showGate = false; // Gate disabilitato
  const isBlocked = false; // Buzz sempre accessibile
  const currentPriceDisplay = getCurrentBuzzDisplayCostM1U();

  // ⏱️ Safety timeout: force show page after 3 seconds to prevent infinite spinner
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || authLoading) {
        console.warn('⚠️ Buzz page: Force showing after timeout');
        setForceShow(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading, authLoading]);

  // 🔍 DEBUG: Track any page reload/navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.error('🚨 PAGE RELOAD DETECTED! Stack:', new Error().stack);
      // Log to help identify what triggered the reload
      console.error('🚨 Window location:', window.location.href);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 🔇 RIMOSSO: Vortex sound - eliminato per evitare conflitti con BUZZMAP.mp3
  // L'unico suono autorizzato nella pagina Buzz è BUZZMAP.mp3 quando si preme il tasto

  const handleBuzzSuccess = async () => {
    console.log('🎉 BUZZ SUCCESS - Refreshing counters');
    // 🔥 FIX: Refresh counters after successful BUZZ without page reload
    loadDailyBuzzCounter();
    loadBuzzStats();
  };

  // 🔥 FIX: Listen for BUZZ events to sync counter in real-time
  useEffect(() => {
    const handleBuzzCompleted = () => {
      console.log('📊 BuzzPage: buzzCompleted event received, refreshing counters');
      loadDailyBuzzCounter();
      loadBuzzStats();
    };

    window.addEventListener('buzzCompleted', handleBuzzCompleted);
    return () => window.removeEventListener('buzzCompleted', handleBuzzCompleted);
  }, [loadDailyBuzzCounter, loadBuzzStats]);

  // 🔧 P0 FIX 31/01/2026: REMOVED html/body manipulation
  // REASON: LeaderboardPage pattern - theme applied via container className="sn-page" only
  // This ensures deterministic behavior without race conditions during navigation

  // 🚀 INSTANT RENDER: Never block the page with loading spinner
  // Data will load in background and update via realtime subscriptions

  // 🔧 FIX v2: BuzzPage now relies on GlobalLayout for header/nav/safe-area
  // 🎨 SOFT NATIVE: White Apple-like design
  return (
    <div 
      className="w-full relative sn-page"
    >
      {/* Free BUZZ Reward Handler - Non interferisce con Stripe */}
      <BuzzRewardHandler onRewardRedeemed={handleBuzzSuccess} />
      
      {/* 🔧 FIX: UnifiedHeader RIMOSSO - già gestito da GlobalLayout per fullscreen routes */}
      
      {/* Main content - 🔧 FIX v2: No extra padding, GlobalLayout handles it */}
      <main
        className="relative"
        style={{ zIndex: 0 }}
      >
        <div className="container mx-auto px-4">
          {/* © 2025 Joseph MULÉ – M1SSION™ */}
          

          {/* 🔧 FIX v8: M1UPill moved to FIXED OVERLAY (see bottom of component)
              This prevents clipping of the animated orb rings */}
          <div className="m1-first-content-offset-compact mb-4">
            {/* Placeholder for scroll offset - pill is now fixed overlay */}
          </div>

          {/* 🎨 FADE ZONE - PIENA LARGHEZZA come Home (non sposta il tasto BUZZ) */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderRadius: '24px',
              overflow: 'hidden',
              minHeight: '380px',
              background: `linear-gradient(180deg, 
                rgba(10, 18, 35, 0.95) 0%, 
                rgba(12, 20, 38, 0.88) 20%, 
                rgba(18, 28, 48, 0.75) 40%, 
                rgba(35, 45, 65, 0.55) 60%, 
                rgba(80, 90, 110, 0.30) 75%, 
                rgba(180, 185, 195, 0.12) 88%, 
                rgba(255, 255, 255, 0) 100%
              )`,
              padding: '20px 16px 40px 16px',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Container centrato - 🔧 FIX v2: Simpler layout, no calc that can break */}
          <div className="flex flex-col items-center justify-center py-4" style={{ position: 'relative', zIndex: 1 }}>
            
            {/* 🚨 START M1SSION GATE: Show overlay when not enrolled (V4: no flash) */}
            <AnimatePresence mode="wait">
              {showGate && !isEnrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                  style={{ 
                    paddingTop: 'calc(119px + env(safe-area-inset-top, 0px))',
                    paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
                  }}
                >
                  <motion.div 
                    className="text-center p-8 mx-4 rounded-3xl max-w-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,30,60,0.95) 0%, rgba(0,15,30,0.98) 100%)',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      boxShadow: '0 0 60px rgba(0, 209, 255, 0.2), inset 0 0 30px rgba(0, 209, 255, 0.05)',
                    }}
                  >
                    {/* Lock Icon */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-6"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,100,100,0.2) 0%, rgba(255,50,50,0.1) 100%)',
                          border: '2px solid rgba(255,100,100,0.4)',
                        }}
                      >
                        <Lock className="w-10 h-10 text-red-400" />
                      </div>
                    </motion.div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-orbitron font-bold text-white mb-3">
                      MISSIONE NON AVVIATA
                    </h2>
                    
                    {/* Description */}
                    <p className="text-white/70 mb-6 text-sm leading-relaxed">
                      Per utilizzare <span className="text-cyan-400 font-semibold">BUZZ</span> devi prima avviare la missione del mese.
                      <br />
                      Torna alla Home e premi <span className="text-cyan-400 font-semibold">START M1SSION</span>.
                    </p>
                    
                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocation('/home')}
                      className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3"
                      style={{
                        background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                        boxShadow: '0 0 30px rgba(0, 209, 255, 0.4)',
                      }}
                    >
                      <Rocket className="w-5 h-5" />
                      VAI ALLA HOME
                    </motion.button>
                    
                    {/* Info */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>Il BUZZ sarà disponibile dopo l'avvio</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Pulsante BUZZ centrato */}
            <div className="text-center mb-6" data-onboarding="buzz-button">
              <BuzzActionButton
                isBlocked={isBlocked}
                onSuccess={handleBuzzSuccess}
              />
            </div>

            {/* 🎨 SOFT NATIVE: Info container */}
            <div 
              className="sn-card-elevated p-4 sm:p-6 mb-6 max-w-3xl w-full mx-4 relative overflow-hidden"
            >
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ */}
                <div className="space-y-2" style={{ color: 'var(--sn-text-secondary)' }}>
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 250 indizi totali.</p>
                  <p className="font-semibold" style={{ color: 'var(--sn-text-primary)' }}>BUZZ oggi: {dailyBuzzCounter} (prezzo progressivo)</p>
                  <p className="font-semibold" style={{ color: 'var(--sn-text-primary)' }}>BUZZ totali: {stats?.total_count || 0}/250 (target finale)</p>
                  <p style={{ color: 'var(--sn-accent)' }}>Prossimo: {currentPriceDisplay}</p>
                  <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--sn-text-tertiary)' }}>
                    <span 
                      className="inline-flex w-4 h-4 rounded-full items-center justify-center text-[8px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#1a1a1a',
                        boxShadow: '0 0 6px rgba(255, 215, 0, 0.6)',
                      }}
                    >
                      M1
                    </span>
                    Ogni BUZZ consuma M1U dal tuo saldo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - gestita da GlobalLayout */}

      {/* Debug Panel (only if enabled) */}
      {debugEnabled && <DebugBuzzPanel />}
      {/* 🆕 STANDBY: Hint per utenti inattivi disabilitato
      <InactivityHint type="buzz" />
      */}
      
      {/* 🎯 Motivational Popup - Shows once per session */}
      <MotivationalPopup pageType="buzz" />
      
      {/* 🔧 FIX v8: M1UPill as FIXED OVERLAY (like Map page)
          This prevents clipping of the animated orb rings
          Position: fixed, left side, below header with safe area */}
      <div 
        id="m1u-pill-buzz-slot" 
        data-onboarding="m1u-pill"
        className="fixed left-4 z-[1001] flex flex-col gap-3"
        style={{ 
          top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          paddingLeft: 'max(0px, env(safe-area-inset-left, 0px))',
          pointerEvents: 'auto' 
        }}
      >
        <M1UPill showLabel showPlusButton />
      </div>
    </div>
  );
};

export default BuzzPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
