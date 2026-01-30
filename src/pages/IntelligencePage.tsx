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
  // 🎨 SOFT NATIVE: Apple-like design update
  return (
      <div 
        className="flex flex-col px-3 sn-page"
        style={{
          position: 'relative',
          zIndex: 0,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
        }}
      >
        {/* 🔧 FIX v8.2: M1UPill is FIXED OVERLAY (see bottom)
            Spacer removed - blob container starts right after header offset */}
        <div className="m1-first-content-offset-compact" />

        {/* AION Entity - BLOB CONTAINER */}
        {/* 🔧 FIX 27/01/2026 v8.2: Container height INCREASED to 280px to fully show blob
            The blob cloud extends ~140px in each direction from center
            Container must be tall enough to show full cloud without clipping */}
        <div 
          style={{ 
            height: '280px',
            minHeight: '260px',
            maxHeight: '320px',
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
        
        {/* AION Label - 🎨 SOFT NATIVE: Clean label */}
        <div 
          className="text-center sn-aion-label"
          style={{ 
            flexShrink: 0,
            marginBottom: '6px',
            position: 'relative',
            zIndex: 10
          }}
        >
          <h2 className="text-lg font-semibold tracking-wider">
            <span style={{ color: 'var(--sn-accent)' }}>AI</span>
            <span style={{ color: 'var(--sn-text-primary)' }}>ON</span>
          </h2>
          <p className="text-[9px] tracking-wide" style={{ color: 'var(--sn-text-tertiary)' }}>Neural Link Established</p>
        </div>

        {/* Shadow Protocol v2 - Hidden on mobile to save space */}
        <div className="hidden md:block">
          <Suspense fallback={null}>
            <ShadowIntercepts />
          </Suspense>
        </div>

        {/* Chat Panel - 🎨 SOFT NATIVE: Clean chat container */}
        <div 
          data-onboarding="ai-chat"
          className="sn-chat-container"
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
        
        {/* 🔧 FIX v8: M1UPill as FIXED OVERLAY (like Map/Home/Buzz pages)
            This prevents clipping of the animated orb rings
            Position: fixed, left side, below header with safe area */}
        <div 
          id="m1u-pill-aion-slot" 
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

export default IntelligencePage;
