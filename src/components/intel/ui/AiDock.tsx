// © 2025 Joseph MULÉ – M1SSION™ - AI Dock Component
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          aria-label={t('aion_dock_final_shot')}
          type="button"
        >
          <Crosshair className={styles.icon} />
        </button>

        {/* Microphone toggle */}
        <button
          className={`${styles.dockButton} ${micEnabled ? styles.active : ''}`}
          onClick={onMicToggle}
          aria-label={micEnabled ? t('aion_dock_mic_disable') : t('aion_dock_mic_enable')}
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
          aria-label={t('aion_dock_more')}
          type="button"
        >
          <MoreHorizontal className={styles.icon} />
        </button>
      </div>
    </div>
  );
};

export default AiDock;
