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
    <>
    {/* 🔧 FIX v5: SAME pattern as LeaderboardPage - double wrapper with 100dvh */}
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        overscrollBehavior: 'none', // BLOCK body-level bounce
      }}
    >
      {/* Inner scrollable container */}
      <div 
        className="flex flex-col px-3"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)', // Header space
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)', // Bottom nav space
          height: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 0,
          overscrollBehavior: 'contain', // Contain scroll within this element
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* M1U Pill - COMPACT */}
        <div 
          data-onboarding="m1u-pill"
          style={{ 
            pointerEvents: 'auto',
            marginBottom: '3px',
            flexShrink: 0
          }}
        >
          <Suspense fallback={<div className="w-24 h-7 bg-gray-800/50 rounded-full animate-pulse" />}>
            <M1UPill showLabel showPlusButton />
          </Suspense>
        </div>

        {/* AION Entity - REDUCED */}
        <div 
          style={{ 
            height: '81px',
            minHeight: '65px',
            maxHeight: '97px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Suspense fallback={<div className="w-18 h-18 rounded-full bg-cyan-500/20 animate-pulse" />}>
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
            marginBottom: '6px',
            position: 'relative',
            zIndex: 10
          }}
        >
          <h2 className="text-lg font-bold tracking-wider">
            <span className="text-cyan-400">AI</span>
            <span className="text-white">ON</span>
          </h2>
          <p className="text-[9px] text-gray-500 tracking-wide">Adaptive Intelligence ON</p>
        </div>

        {/* Shadow Protocol v2 - Hidden on mobile to save space */}
        <div className="hidden md:block">
          <Suspense fallback={null}>
            <ShadowIntercepts />
          </Suspense>
        </div>

        {/* 🔧 Container abbassato del 10% - margin-top per non sovrapporsi ad AION */}
        <div 
          data-onboarding="ai-chat"
          style={{ 
            flex: 1,
            minHeight: '200px',
            maxWidth: '100%', 
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
            marginTop: '10%', // 🔧 Abbassato del 10%
          }}
        >
          <IntelChatPanel 
            aionEntityRef={aionRef}
            className="flex-1"
            style={{ minHeight: 0, maxHeight: '100%' }}
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
