// © 2025 Joseph MULÉ – M1SSION™ - AI Orb Button Component
import React from 'react';
import { Loader2, Waves, Mic } from 'lucide-react';
import styles from './AiOrbButton.module.css';

interface AiOrbButtonProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel?: number;
  onClick: () => void;
}

const AiOrbButton: React.FC<AiOrbButtonProps> = ({ 
  status, 
  audioLevel = 0, 
  onClick 
}) => {
  const getIcon = () => {
    switch (status) {
      case 'thinking':
        return <Loader2 className={`${styles.icon} ${styles.spinning}`} />;
      case 'speaking':
        return <Waves className={`${styles.icon} ${styles.pulsing}`} />;
      case 'listening':
        return <Mic className={styles.icon} />;
      default:
        return null;
    }
  };

  // Dynamic scale based on audio level (only when speaking/listening)
  const scale = (status === 'speaking' || status === 'listening') && audioLevel > 0
    ? 1 + (audioLevel * 0.15)
    : 1;

  return (
    <button
      onClick={onClick}
      className={styles.orbContainer}
      style={{ transform: `scale(${scale})` }}
      aria-label="Open AI Analyst"
      aria-pressed={status !== 'idle'}
      type="button"
    >
      {/* Outer rotating glow ring */}
      <div className={`${styles.outerGlow} ${styles[status]}`} />

      {/* Middle blur layer */}
      <div className={styles.middleLayer} />

      {/* Inner core with icon */}
      <div className={`${styles.innerCore} ${styles[status]}`}>
        {getIcon()}
      </div>

      {/* Idle pulsating ring */}
      {status === 'idle' && <div className={styles.idleRing} />}
    </button>
  );
};

export default AiOrbButton;
