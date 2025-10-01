// © 2025 Joseph MULÉ – M1SSION™ - AI Dock Component
import React from 'react';
import { Video, Mic, MicOff, MoreHorizontal } from 'lucide-react';
import styles from './AiDock.module.css';

interface AiDockProps {
  micEnabled: boolean;
  onMicToggle: () => void;
  onMoreClick?: () => void;
}

const AiDock: React.FC<AiDockProps> = ({ 
  micEnabled, 
  onMicToggle,
  onMoreClick 
}) => {
  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {/* Video button (placeholder) */}
        <button
          className={styles.dockButton}
          aria-label="Toggle video"
          type="button"
          disabled
        >
          <Video className={styles.icon} />
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
