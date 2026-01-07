// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Intelligence Page - AION Entity + Chat Panel
// Includes Shadow Protocol v2 Intercepts panel

import React, { useRef, Suspense, lazy } from 'react';
// 🔥 CRITICAL: Lazy load AionEntity to prevent THREE.js hook errors during initial load
const AionEntity = lazy(() => import('@/components/aion/AionEntity'));
import type { AionEntityHandle } from '@/components/aion/AionEntity';
import IntelChatPanel from '@/pages/intel/IntelChatPanel';

// Lazy load components for performance
const M1UPill = lazy(() => import('@/features/m1u/M1UPill'));
const ShadowIntercepts = lazy(() => import('@/components/intelligence/ShadowIntercepts'));
import { InactivityHint } from '@/components/first-session';
import { MotivationalPopup } from '@/components/feedback';

const IntelligencePage: React.FC = () => {
  const aionRef = useRef<AionEntityHandle>(null);

  return (
    // 🔧 FIX v2: Outer container blocks iOS bounce scroll (like LeaderboardPage)
    <>
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        overscrollBehavior: 'none',
      }}
    >
    <div 
      className="flex flex-col px-4"
      style={{
        // Altezza ESATTA disponibile = viewport - header - bottom nav - safe areas
        height: 'calc(100dvh - 80px - 80px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        maxHeight: 'calc(100dvh - 80px - 80px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        paddingBottom: '8px',
        overscrollBehavior: 'contain',
      }}
    >
      {/* M1U Pill - Below header - COMPACT */}
      <div 
        data-onboarding="m1u-pill"
        style={{ 
          pointerEvents: 'auto',
          marginBottom: '4px',
          flexShrink: 0
        }}
      >
        <Suspense fallback={<div className="w-28 h-8 bg-gray-800/50 rounded-full animate-pulse" />}>
          <M1UPill showLabel showPlusButton />
        </Suspense>
      </div>

      {/* AION Entity - REDUCED height for mobile */}
      <div 
        style={{ 
          height: '100px',
          minHeight: '80px',
          maxHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Suspense fallback={<div className="w-20 h-20 rounded-full bg-cyan-500/20 animate-pulse" />}>
          <AionEntity 
            ref={aionRef}
            intensity={1.0} 
            idleSpeed={0.7}
            className="mx-auto"
          />
        </Suspense>
      </div>
      
      {/* AION Label - COMPACT */}
      <div 
        className="text-center"
        style={{ 
          flexShrink: 0,
          marginBottom: '8px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <h2 className="text-xl font-bold tracking-wider">
          <span className="text-cyan-400">AI</span>
          <span className="text-white">ON</span>
        </h2>
        <p className="text-[10px] text-gray-500 tracking-wide">Adaptive Intelligence ON</p>
      </div>

      {/* Shadow Protocol v2 - Hidden on mobile to save space */}
      <div className="hidden md:block">
        <Suspense fallback={null}>
          <ShadowIntercepts />
        </Suspense>
      </div>

      {/* Chat Panel - Takes ALL remaining space, scrolls internally */}
      <div 
        data-onboarding="ai-chat"
        style={{ 
          flex: 1,
          minHeight: 0, // CRITICAL: allows flex child to shrink
          maxWidth: '100%', 
          width: '100%', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <IntelChatPanel 
          aionEntityRef={aionRef}
          className="flex-1"
          style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}
        />
      </div>
      {/* Hint nascosto su mobile per risparmiare spazio */}
      <div className="hidden md:block">
        <InactivityHint type="aion" />
      </div>
    </div>
    </div>
    
    {/* 🎯 Motivational Popup - Shows once per session for AION page */}
    <MotivationalPopup pageType="aion" />
    </>
  );
};

export default IntelligencePage;
