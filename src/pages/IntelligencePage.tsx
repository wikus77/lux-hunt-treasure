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
    {/* 
      🔧 FIX v4: Single container, no extra wrappers
      - Uses height: 100% to fill GlobalLayout's main content area
      - overflow: hidden prevents any scroll at this level
      - All scroll happens INSIDE IntelChatPanel
      - Reduced 10% for responsiveness
    */}
    <div 
      className="flex flex-col px-3"
      style={{
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden', // NO scroll here - prevents bounce
        paddingBottom: '4px',
      }}
    >
      {/* M1U Pill - COMPACT (-10%) */}
      <div 
        data-onboarding="m1u-pill"
        style={{ 
          pointerEvents: 'auto',
          marginBottom: '3px', // Ridotto da 4px
          flexShrink: 0
        }}
      >
        <Suspense fallback={<div className="w-24 h-7 bg-gray-800/50 rounded-full animate-pulse" />}>
          <M1UPill showLabel showPlusButton />
        </Suspense>
      </div>

      {/* AION Entity - REDUCED 10% */}
      <div 
        style={{ 
          height: '81px',      // Ridotto 10% (era 90px)
          minHeight: '65px',   // Ridotto 10% (era 72px)
          maxHeight: '97px',   // Ridotto 10% (era 108px)
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
      
      {/* AION Label - COMPACT (-10%) */}
      <div 
        className="text-center"
        style={{ 
          flexShrink: 0,
          marginBottom: '6px', // Ridotto da 8px
          position: 'relative',
          zIndex: 10
        }}
      >
        <h2 className="text-lg font-bold tracking-wider"> {/* Ridotto da text-xl */}
          <span className="text-cyan-400">AI</span>
          <span className="text-white">ON</span>
        </h2>
        <p className="text-[9px] text-gray-500 tracking-wide">Adaptive Intelligence ON</p> {/* Ridotto da 10px */}
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
          overflow: 'hidden' // Chat panel handles its own scroll
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
    
    {/* 🎯 Motivational Popup - Shows once per session for AION page */}
    <MotivationalPopup pageType="aion" />
    </>
  );
};

export default IntelligencePage;
