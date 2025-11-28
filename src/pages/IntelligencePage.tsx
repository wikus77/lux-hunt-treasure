// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Intelligence Page - AION Entity + Chat Panel

import React, { useRef, Suspense, lazy } from 'react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import BottomNavigation from '@/components/layout/BottomNavigation';
import AionEntity, { AionEntityHandle } from '@/components/aion/AionEntity';
import IntelChatPanel from '@/pages/intel/IntelChatPanel';

// Lazy load M1U Pill for performance
const M1UPill = lazy(() => import('@/features/m1u/M1UPill'));

const IntelligencePage: React.FC = () => {
  const aionRef = useRef<AionEntityHandle>(null);

  return (
    <SafeAreaWrapper className="relative isolate min-h-screen flex flex-col bg-[#070818]">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(0, 212, 255, 0.1) 0%, transparent 50%)',
        }}
      />
      
      {/* M1U Pill - Fixed top left (same position as Home) */}
      <div 
        className="fixed top-4 left-4 z-50 flex flex-col items-start gap-2" 
        style={{ 
          marginTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'max(0rem, env(safe-area-inset-left, 0px))'
        }}
      >
        <Suspense fallback={<div className="w-28 h-10 bg-gray-800/50 rounded-full animate-pulse" />}>
          <M1UPill showLabel showPlusButton />
        </Suspense>
      </div>

      {/* AION Entity */}
      <div 
        className="relative z-10"
        style={{
          height: 'clamp(280px, 35vh, 420px)',
          marginTop: 'clamp(100px, 12vh, 140px)',
        }}
      >
        <AionEntity 
          ref={aionRef}
          intensity={1.0} 
          idleSpeed={0.7}
          className="mx-auto"
        />
        
        {/* AION Label */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold tracking-wider">
            <span className="text-cyan-400">AI</span>
            <span className="text-white">ON</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 tracking-wide">Adaptive Intelligence ON</p>
        </div>
      </div>

      {/* Chat Panel */}
      <div 
        className="relative z-10 flex-1 px-4 mt-8 pb-24"
        style={{ maxWidth: '48rem', margin: '2rem auto 0', width: '100%' }}
      >
        <IntelChatPanel 
          aionEntityRef={aionRef}
          className="h-full"
        />
      </div>

      {/* Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <BottomNavigation />
      </div>
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;
