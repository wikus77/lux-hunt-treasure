// © 2025 Joseph MULÉ – M1SSION™ - AI Dock Component
import React from 'react';
import { Video, Mic, MicOff, MoreHorizontal, Crosshair } from 'lucide-react';
import { useLocation } from 'wouter';
import styles from './AiDock.module.css';

interface AiDockProps {
  micEnabled: boolean;
  onMicToggle: () => void;
  onMoreClick?: () => void;
  onFinalShotClick?: () => void;
}

const AiDock: React.FC<AiDockProps> = ({ 
  micEnabled, 
  onMicToggle,
  onMoreClick,
  onFinalShotClick
}) => {
  const [, setLocation] = useLocation();
  
  const handleFinalShot = () => {
    if (onFinalShotClick) {
      onFinalShotClick();
    } else {
      setLocation('/intelligence/final-shot');
    }
  };
  
  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {/* Final Shot button */}
        <button
          className={styles.dockButton}
          onClick={handleFinalShot}
          aria-label="Open Final Shot"
          type="button"
        >
          <Crosshair className={styles.icon} />
        </button>

        {/* Microphone toggle */}
        <button
          className={`${styles.dockButton} ${micEnabled ? styles.active : ''}`}
          onClick={onMicToggle}
          aria-label={micEnabled ? 'Disable microphone' : 'Enable microphone'}
          aria-pressed={micEnabled}
          type="button"
        >
          {micEnabled ? (
            <Mic className={styles.icon} />
          ) : (
            <MicOff className={styles.icon} />
          )}
        </button>

        {/* More options */}
        <button
          className={styles.dockButton}
          onClick={onMoreClick}
          aria-label="More options"
          type="button"
        >
          <MoreHorizontal className={styles.icon} />
        </button>
      </div>
    </div>
  );
};

export default AiDock;
