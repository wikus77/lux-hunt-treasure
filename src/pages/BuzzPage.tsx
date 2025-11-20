
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Page Component - FIXED PRICING LOGIC

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { BuzzInstructions } from '@/components/buzz/BuzzInstructions';
import { BuzzRewardHandler } from '@/components/buzz/BuzzRewardHandler';
import { useBuzzStats } from '@/hooks/useBuzzStats';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { createVortexSound } from '@/utils/audioSynthesis';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import M1UPill from '@/features/m1u/M1UPill';
import { useDebugFlag } from '@/debug/useDebugFlag';
import { DebugBuzzPanel } from '@/debug/DebugBuzzPanel';

export const BuzzPage: React.FC = () => {
  const { stats, loading, loadBuzzStats } = useBuzzStats();
  const { user } = useUnifiedAuth();
  const { playSound } = useSoundEffects();
  const vortexSoundRef = useRef<ReturnType<typeof createVortexSound> | null>(null);
  const debugEnabled = useDebugFlag();
  
  // 🔥 FIXED: Use centralized pricing logic from useBuzzCounter
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzDisplayCostM1U 
  } = useBuzzCounter(user?.id);

  // 🔥 FIXED: Use only centralized M1U pricing
  const isBlocked = false; // Never blocked, progressive pricing continues
  const currentPriceDisplay = getCurrentBuzzDisplayCostM1U();

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
    // Force immediate stats reload - © 2025 Joseph MULÉ – M1SSION™
    setTimeout(async () => {
      await loadBuzzStats();
      console.log('🔄 Stats aggiornate post-BUZZ - PRICING FIXED');
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#F059FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-[#070818] w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
            {/* Pulsante BUZZ centrato */}
            <div className="text-center mb-6">
              <BuzzActionButton
                isBlocked={isBlocked}
                onSuccess={handleBuzzSuccess}
              />
            </div>

            {/* Container con descrizione - Sistema 200 indizi - RESET COMPLETO 17/07/2025 */}
            <div 
              className="p-4 sm:p-6 mb-6 max-w-3xl w-full mx-4"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025 */}
                <div className="text-white/80 space-y-2">
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 200 indizi totali.</p>
                  <p className="font-semibold">BUZZ oggi: {dailyBuzzCounter} (prezzo progressivo)</p>
                  <p className="font-semibold">BUZZ totali: {stats?.total_count || 0}/200 (target finale)</p>
                  <p className="text-[#00ffff]">Prossimo: {currentPriceDisplay}</p>
                  <p className="text-xs text-white/60">💎 Ogni BUZZ consuma M1U dal tuo saldo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - Uniform positioning like Home */}
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

      {/* Debug Panel (only if enabled) */}
      {debugEnabled && <DebugBuzzPanel />}
    </motion.div>
  );
};

export default BuzzPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
