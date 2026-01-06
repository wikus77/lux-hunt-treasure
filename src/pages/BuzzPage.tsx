
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
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { createVortexSound } from '@/utils/audioSynthesis';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
// BottomNavigation gestita da GlobalLayout
import M1UPill from '@/features/m1u/M1UPill';
import { useDebugFlag } from '@/debug/useDebugFlag';
import { DebugBuzzPanel } from '@/debug/DebugBuzzPanel';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { Rocket, Lock, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { InactivityHint } from '@/components/first-session';
import { MotivationalPopup } from '@/components/feedback';

export const BuzzPage: React.FC = () => {
  const { stats, loading, loadBuzzStats } = useBuzzStats();
  const { user, isLoading: authLoading } = useUnifiedAuth();
  const { playSound } = useSoundEffects();
  const vortexSoundRef = useRef<ReturnType<typeof createVortexSound> | null>(null);
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

  // Start procedural vortex sound ONLY when on /buzz page
  useEffect(() => {
    let mounted = true;
    
    // Small delay to ensure user has interacted with page
    const timer = setTimeout(() => {
      if (!mounted) return;
      
      try {
        const vortex = createVortexSound();
        if (!mounted) {
          vortex.stop();
          return;
        }
        
        vortexSoundRef.current = vortex;
        vortex.setVolume(0.25); // Subtle background volume
        vortex.start();
        console.log('🌀 Vortex sound active on /buzz page');
      } catch (error) {
        console.log('Vortex sound init prevented (autoplay policy):', error);
      }
    }, 200);
    
    // Cleanup: stop sound immediately when leaving /buzz page
    return () => {
      mounted = false;
      clearTimeout(timer);
      
      if (vortexSoundRef.current) {
        console.log('🌀 Stopping vortex sound (leaving /buzz page)');
        vortexSoundRef.current.stop();
        vortexSoundRef.current = null;
      }
    };
  }, []);

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

  // 🚀 INSTANT RENDER: Never block the page with loading spinner
  // Data will load in background and update via realtime subscriptions

  return (
    <div 
      className="bg-[#070818] w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top, 47px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Free BUZZ Reward Handler - Non interferisce con Stripe */}
      <BuzzRewardHandler onRewardRedeemed={handleBuzzSuccess} />
      
      <UnifiedHeader />
      
      {/* Decorative gradient effect at top - INSTANT (no delay) */}
      <div
        className="fixed top-24 left-0 right-0 h-32 pointer-events-none z-[9]"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(0, 209, 255, 0.18), transparent 70%),
            radial-gradient(ellipse at 20% 0%, rgba(123, 92, 255, 0.15), transparent 60%),
            radial-gradient(ellipse at 80% 0%, rgba(240, 89, 255, 0.12), transparent 65%)
          `,
          filter: 'blur(20px)'
        }}
      />
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(119px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4">
          {/* © 2025 Joseph MULÉ – M1SSION™ */}
          

          {/* M1U Pill Slot - Buzz (fixed overlay aligned like Home) */}
          <div 
            id="m1u-pill-buzz-slot" 
            className="fixed z-[1000] flex items-center gap-2"
            style={{ 
              top: 'calc(env(safe-area-inset-top, 0px) + 96px)',
              left: 'max(1rem, env(safe-area-inset-left, 0px))',
              pointerEvents: 'auto' 
            }}
            aria-hidden={false}
          >
            <M1UPill showLabel showPlusButton />
          </div>


          {/* Container centrato verticalmente e orizzontalmente */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            
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

            {/* Container con descrizione - Sistema 200 indizi - RESET COMPLETO 17/07/2025 */}
            <div 
              className="m1-relief p-4 sm:p-6 mb-6 max-w-3xl w-full mx-4 relative overflow-hidden"
              style={{
                borderRadius: '24px'
              }}
            >
              {/* Animated glow strip like header */}
              <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                  style={{
                    animation: 'slideGlowBuzz 3s ease-in-out infinite',
                    width: '200%',
                    left: '-100%'
                  }}
                />
              </div>
              <style>{`
                @keyframes slideGlowBuzz {
                  0% { transform: translateX(0); }
                  50% { transform: translateX(50%); }
                  100% { transform: translateX(0); }
                }
              `}</style>
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025 */}
                <div className="text-white/80 space-y-2">
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 250 indizi totali.</p>
                  <p className="font-semibold">BUZZ oggi: {dailyBuzzCounter} (prezzo progressivo)</p>
                  <p className="font-semibold">BUZZ totali: {stats?.total_count || 0}/250 (target finale)</p>
                  <p className="text-[#00ffff]">Prossimo: {currentPriceDisplay}</p>
                  <p className="text-xs text-white/60 flex items-center gap-1">
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
      
      {/* Decorative gradient effect at bottom - INSTANT (no delay) */}
      <div
        className="fixed bottom-24 left-0 right-0 h-32 pointer-events-none z-[9]"
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, rgba(0, 209, 255, 0.18), transparent 70%),
            radial-gradient(ellipse at 20% 100%, rgba(123, 92, 255, 0.15), transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(240, 89, 255, 0.12), transparent 65%)
          `,
          filter: 'blur(20px)'
        }}
      />
      
      {/* Bottom Navigation - gestita da GlobalLayout */}

      {/* Debug Panel (only if enabled) */}
      {debugEnabled && <DebugBuzzPanel />}
      {/* 🆕 Hint per utenti inattivi (1 volta al giorno) */}
      <InactivityHint type="buzz" />
      
      {/* 🎯 Motivational Popup - Shows once per session */}
      <MotivationalPopup pageType="buzz" />
    </div>
  );
};

export default BuzzPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
