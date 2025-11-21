// © 2025 Joseph MULÉ – M1SSION™ - AI Orb Stage Component (Full Screen)
import React from 'react';
import EdgeGlowCanvas from './EdgeGlowCanvas';
import AiOrbButton from './AiOrbButton';
import AiDock from './AiDock';
import styles from './AiOrbStage.module.css';

interface AiOrbStageProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel: number;
  onOrbClick: () => void;
  micEnabled: boolean;
  onMicToggle: () => void;
  onMoreClick?: () => void;
  onFinalShotClick?: () => void;
}

const AiOrbStage: React.FC<AiOrbStageProps> = ({
  status,
  audioLevel,
  onOrbClick,
  micEnabled,
  onMicToggle,
  onMoreClick,
  onFinalShotClick
}) => {
  return (
    <div className={styles.stage}>
      {/* Subtle radial gradient for depth */}
      <div className={styles.gradientOverlay} />

      {/* Edge Glow (reactive to audio) */}
      <EdgeGlowCanvas 
        audioLevel={audioLevel} 
        status={status} 
        isActive={true}
      />

      {/* Main Orb (center) */}
      <div className={styles.orbContainer}>
        <AiOrbButton 
          status={status}
          audioLevel={audioLevel}
          onClick={onOrbClick}
        />
      </div>

      {/* Bottom Dock Controls */}
      <AiDock 
        micEnabled={micEnabled}
        onMicToggle={onMicToggle}
        onMoreClick={onMoreClick}
        onFinalShotClick={onFinalShotClick}
      />
    </div>
  );
};

export default AiOrbStage;
