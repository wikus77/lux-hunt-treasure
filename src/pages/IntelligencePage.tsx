// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Intelligence Page - AION Entity + Chat Panel
// Includes Shadow Protocol v2 Intercepts panel

import React, { useRef, Suspense, lazy } from 'react';
// 🔥 CRITICAL: Lazy load AionEntity to prevent THREE.js hook errors during initial load
const AionEntity = lazy(() => import('@/components/aion/AionEntity'));
import type { AionEntityHandle } from '@/components/aion/AionEntity';
import IntelChatPanel from '@/pages/intel/IntelChatPanel';
// M1UPill caricato subito (non lazy) per evitare flash al caricamento
import M1UPill from '@/features/m1u/M1UPill';

// Lazy load solo componenti pesanti
const ShadowIntercepts = lazy(() => import('@/components/intelligence/ShadowIntercepts'));
// STANDBY: Sistema hint inattività disabilitato - riattivare se necessario
// import { InactivityHint } from '@/components/first-session';
import { MotivationalPopup } from '@/components/feedback';

const IntelligencePage: React.FC = () => {
  const aionRef = useRef<AionEntityHandle>(null);

  // 🔧 FIX v6 (22/01/2026): AION-LIKE SCROLL UNDER HEADER
  // Content scrolls behind glass header, first element has margin-top
  // 🔧 FIX 27/01/2026 v4: Background handled by ios-native.css ::before gradient layer
  return (
      <div 
        className="flex flex-col px-3"
        style={{
          position: 'relative',
          zIndex: 0,
          // Background transparent - native gradient layer from ios-native.css handles background
        }}
      >
        {/* M1U Pill - SEMPRE VISIBILE subito - z-index alto
            🔧 FIX v6: First content offset for AION-like scroll under header */}
        <div 
          data-onboarding="m1u-pill"
          className="m1-first-content-offset-compact"
          style={{ 
            pointerEvents: 'auto',
            marginBottom: '3px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 50
          }}
        >
          <M1UPill showLabel showPlusButton />
        </div>

        {/* AION Entity - BLOB CONTAINER */}
        {/* 🔧 FIX 27/01/2026 v5: Container height increased to fit 280px blob (was 81px - clipping!)
            Root cause: AionEntity has minHeight:280px but parent limited to 81-97px
            Fix: Increase container to ~180px to show blob without clipping */}
        <div 
          style={{ 
            height: '180px',
            minHeight: '160px',
            maxHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
            overflow: 'visible', // Allow AION cloud/glow to extend beyond container
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

        {/* Chat Panel - si estende fino alla bottom nav */}
        <div 
          data-onboarding="ai-chat"
          style={{ 
            flex: 1,
            minHeight: '200px',
            maxWidth: '100%', 
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <IntelChatPanel 
            aionEntityRef={aionRef}
            className="flex-1"
            style={{ minHeight: 0, maxHeight: '100%' }}
          />
        </div>
        
        {/* STANDBY: Hint per utenti inattivi disabilitato
        <div className="hidden md:block">
          <InactivityHint type="aion" />
        </div>
        */}
      
        {/* 🎯 Motivational Popup - Shows once per session for AION page */}
        <MotivationalPopup pageType="aion" />
      </div>
  );
};

export default IntelligencePage;
