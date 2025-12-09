// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Intelligence Page - AION Entity + Chat Panel
// Includes Shadow Protocol v2 Intercepts panel

import React, { useRef, Suspense, lazy } from 'react';
import AionEntity, { AionEntityHandle } from '@/components/aion/AionEntity';
import IntelChatPanel from '@/pages/intel/IntelChatPanel';

// Lazy load components for performance
const M1UPill = lazy(() => import('@/features/m1u/M1UPill'));
const ShadowIntercepts = lazy(() => import('@/components/intelligence/ShadowIntercepts'));

const IntelligencePage: React.FC = () => {
  const aionRef = useRef<AionEntityHandle>(null);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 85px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 95px)',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
    >
      {/* M1U Pill - Below header */}
      <div 
        data-onboarding="m1u-pill"
        style={{ 
          pointerEvents: 'auto',
          marginBottom: '8px',
          flexShrink: 0
        }}
      >
        <Suspense fallback={<div className="w-28 h-10 bg-gray-800/50 rounded-full animate-pulse" />}>
          <M1UPill showLabel showPlusButton />
        </Suspense>
      </div>

      {/* AION Entity - Fixed height */}
      <div 
        style={{ 
          height: '25%',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1
        }}
      >
        <AionEntity 
          ref={aionRef}
          intensity={1.0} 
          idleSpeed={0.7}
          className="mx-auto"
        />
      </div>
      
      {/* AION Label - Above animation with z-index */}
      <div 
        className="text-center"
        style={{ 
          flexShrink: 0,
          marginBottom: '20px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <h2 className="text-2xl font-bold tracking-wider">
          <span className="text-cyan-400">AI</span>
          <span className="text-white">ON</span>
        </h2>
        <p className="text-xs text-gray-500 tracking-wide">Adaptive Intelligence ON</p>
      </div>

      {/* Shadow Protocol v2 - Intercepts Panel (collapsible) */}
      <Suspense fallback={null}>
        <ShadowIntercepts />
      </Suspense>

      {/* Chat Panel - Takes remaining space */}
      <div 
        data-onboarding="ai-chat"
        style={{ 
          flex: 1,
          minHeight: '220px',
          maxWidth: '100%', 
          width: '100%', 
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <IntelChatPanel 
          aionEntityRef={aionRef}
          className="flex-1"
          style={{ minHeight: 0 }}
        />
      </div>
    </div>
  );
};

export default IntelligencePage;
