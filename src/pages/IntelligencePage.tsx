// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useEffect, useState } from 'react';
import { Brain, Target } from 'lucide-react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import FinalShotPage from '@/components/intelligence/FinalShotPage';
import AIAnalystButton from '@/components/intel/AIAnalystButton';
import AIAnalystPanel from '@/components/intel/AIAnalystPanel';
import BottomNavigation from '@/components/layout/BottomNavigation';

const IntelligencePage: React.FC = () => {
  const [showAIAnalyst, setShowAIAnalyst] = useState(false);

  useEffect(() => {
    console.log('🧠 Intel Page mounted - AI Analyst + Final Shot');
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <SafeAreaWrapper className="min-h-screen bg-background">
      <div 
        className="min-h-screen bg-[#070818]" 
        style={{ 
          paddingTop: '140px', 
          paddingBottom: '120px',
          width: '100vw',
          maxWidth: '100vw',
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <div className="container mx-auto px-3">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-cyan-400 glow-text">M1</span>
              <span className="text-white">SSION INTELLIGENCE PANEL™</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              AI Analyst & Final Shot - Advanced Tactical Intelligence
            </p>
          </div>
        </div>

        {/* Two-Section Layout: AI Analyst + Final Shot */}
        <div className="space-y-6 py-6">
          
          {/* Section A: AI Analyst */}
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#F213A4]/30 shadow-[0_0_30px_rgba(242,19,164,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-[#F213A4]" />
                  AI ANALYST
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Intelligence analysis, classification, and decoding support
                </p>
              </div>
            </div>
            <div className="text-sm text-white/80 mb-4">
              <p>
                • Analyze and classify your collected clues<br />
                • Detect patterns and correlations<br />
                • Decode basic ciphers (Caesar, Base64, ASCII)<br />
                • Assess probability and tactical risks<br />
                • Receive guidance without spoilers
              </p>
            </div>
          </div>

          {/* Section B: Final Shot (UNCHANGED - existing component) */}
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  FINAL SHOT
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Interactive map for final coordinate selection
                </p>
              </div>
            </div>
            
            {/* Final Shot Component - UNCHANGED */}
            <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
              <FinalShotPage />
            </div>
          </div>

        </div>
        </div>
      </div>
      
      {/* AI Analyst Floating Button */}
      <AIAnalystButton 
        onClick={() => setShowAIAnalyst(true)}
        isActive={showAIAnalyst}
      />

      {/* AI Analyst Panel */}
      {showAIAnalyst && (
        <AIAnalystPanel onClose={() => setShowAIAnalyst(false)} />
      )}
      
      {/* Bottom Navigation */}
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
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;