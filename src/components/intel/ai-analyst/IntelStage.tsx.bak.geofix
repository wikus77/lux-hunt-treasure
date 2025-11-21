// © 2025 Joseph MULÉ – M1SSION™ - Intel AI Stage (Siri-style fullscreen)
import React from 'react';
import IntelOrb from './IntelOrb';
import IntelDock from './IntelDock';
import AIEdgeGlow from './SiriWaveOverlay';
import { AnalystStatus } from '@/hooks/useIntelAnalyst';

interface IntelStageProps {
  status: AnalystStatus;
  audioLevel: number;
  isActive: boolean;
  onOrbClick: () => void;
  onMicToggle: () => void;
  micEnabled: boolean;
  ttsEnabled: boolean;
}

const IntelStage: React.FC<IntelStageProps> = ({
  status,
  audioLevel,
  isActive,
  onOrbClick,
  onMicToggle,
  micEnabled,
  ttsEnabled
}) => {
  return (
    <div className="fixed inset-0 z-30 bg-black">
      {/* Subtle radial gradient for depth */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.08), transparent 70%)'
        }}
      />

      {/* Edge Glow */}
      <AIEdgeGlow 
        status={status} 
        isActive={isActive} 
        audioLevel={audioLevel} 
      />

      {/* Main Orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <IntelOrb 
          status={status}
          audioLevel={audioLevel}
          onClick={onOrbClick}
        />
      </div>

      {/* Bottom Dock Controls */}
      <IntelDock 
        onMicToggle={onMicToggle}
        micEnabled={micEnabled}
        ttsEnabled={ttsEnabled}
        onOpenPanel={onOrbClick}
      />
    </div>
  );
};

export default IntelStage;
