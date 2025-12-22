// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PORTALS BEHAVIOR OVERLAY v1.2 — FINAL PRE-LAUNCH
// 
// Displays portal-specific interactions based on portalsConfig.ts
// Pure front-end logic - no backend modifications

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, AlertTriangle, Radio, Eye, Lock, Unlock, Gift, Sparkles } from 'lucide-react';
import type { PortalDTO } from '@/features/living-map/adapters/readOnlyData';
import {
  getPortalBehavior,
  getRandomLoreFragment,
  getRandomPuzzle,
  getRandomNiceReward,
  type PortalBehaviorConfig,
  type PortalDialogue,
} from '@/config/portalsConfig';
import '@/styles/portal-behaviors.css';

// ============================================================================
// LOCAL STORAGE KEYS FOR ACTIVITY TRACKING
// ============================================================================

const STORAGE_KEY_BUZZ_COUNT = 'm1ssion_portal_buzz_count';
const STORAGE_KEY_BUZZ_MAP_COUNT = 'm1ssion_portal_buzz_map_count';

// ============================================================================
// HOOKS FOR ACTIVITY TRACKING
// ============================================================================

function useActivityTracker() {
  const [buzzCount, setBuzzCount] = useState(0);
  const [buzzMapCount, setBuzzMapCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const storedBuzz = localStorage.getItem(STORAGE_KEY_BUZZ_COUNT);
    const storedBuzzMap = localStorage.getItem(STORAGE_KEY_BUZZ_MAP_COUNT);
    if (storedBuzz) setBuzzCount(parseInt(storedBuzz, 10) || 0);
    if (storedBuzzMap) setBuzzMapCount(parseInt(storedBuzzMap, 10) || 0);

    // Listen for BUZZ events
    const handleBuzz = () => {
      setBuzzCount(prev => {
        const newVal = prev + 1;
        localStorage.setItem(STORAGE_KEY_BUZZ_COUNT, String(newVal));
        return newVal;
      });
    };

    // Listen for BUZZ MAP events
    const handleBuzzMap = () => {
      setBuzzMapCount(prev => {
        const newVal = prev + 1;
        localStorage.setItem(STORAGE_KEY_BUZZ_MAP_COUNT, String(newVal));
        return newVal;
      });
    };

    window.addEventListener('buzzCompleted', handleBuzz);
    window.addEventListener('buzzAreaCreated', handleBuzzMap);

    return () => {
      window.removeEventListener('buzzCompleted', handleBuzz);
      window.removeEventListener('buzzAreaCreated', handleBuzzMap);
    };
  }, []);

  return { buzzCount, buzzMapCount };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const EntitySymbol: React.FC<{ entity: 'MCP' | 'SHADOW' | 'ECHO' }> = ({ entity }) => {
  const colors = {
    MCP: '#00E5FF',
    SHADOW: '#FF3366',
    ECHO: '#9966FF',
  };

  return (
    <div 
      className="portal-entity-symbol"
      style={{ 
        color: colors[entity],
        textShadow: `0 0 20px ${colors[entity]}`,
      }}
    >
      {entity === 'MCP' && <Shield size={24} />}
      {entity === 'SHADOW' && <AlertTriangle size={24} />}
      {entity === 'ECHO' && <Radio size={24} />}
      <span className="ml-2 font-mono text-sm">{entity}://PORTAL</span>
    </div>
  );
};

const DialogueDisplay: React.FC<{ 
  dialogues: PortalDialogue[];
  onComplete?: () => void;
}> = ({ dialogues, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentDialogue = dialogues[currentIndex];
  const fullText = currentDialogue?.lines.join('\n') || '';

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        
        if (currentIndex < dialogues.length - 1) {
          setTimeout(() => setCurrentIndex(prev => prev + 1), 1200);
        } else if (onComplete) {
          setTimeout(onComplete, 400);
        }
      }
    }, 25);

    return () => clearInterval(timer);
  }, [currentIndex, fullText, dialogues.length, onComplete]);

  if (!currentDialogue) return null;

  return (
    <div className="portal-dialogue">
      <EntitySymbol entity={currentDialogue.entity} />
      <pre className="portal-dialogue-text">
        {displayedText}
        {isTyping && <span className="portal-cursor">▌</span>}
      </pre>
    </div>
  );
};

const LockdownTimer: React.FC<{ 
  seconds: number; 
  onComplete: () => void;
}> = ({ seconds, onComplete }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setRemaining(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <div className="portal-lockdown-timer">
      <div className="portal-lockdown-number">{remaining}</div>
      <div className="portal-lockdown-label">SYSTEM LOCKDOWN</div>
    </div>
  );
};

const AgentMirrorPanel: React.FC<{
  buzzCount: number;
  buzzMapCount: number;
}> = ({ buzzCount, buzzMapCount }) => {
  return (
    <div className="portal-mirror-panel">
      <div className="portal-mirror-title">
        <Eye size={20} className="mr-2" />
        AGENT MIRROR
      </div>
      <div className="portal-mirror-stats">
        <div className="portal-mirror-stat">
          <span className="portal-mirror-label">BUZZ Actions</span>
          <span className="portal-mirror-value">{buzzCount}</span>
        </div>
        <div className="portal-mirror-stat">
          <span className="portal-mirror-label">BUZZ MAP Areas</span>
          <span className="portal-mirror-value">{buzzMapCount}</span>
        </div>
        <div className="portal-mirror-stat">
          <span className="portal-mirror-label">Estimated Rank</span>
          <span className="portal-mirror-value">Top {Math.max(5, 100 - (buzzCount * 3 + buzzMapCount * 10))}%</span>
        </div>
      </div>
    </div>
  );
};

const RewardDisplay: React.FC<{
  reward: { type: string; amount?: number; label: string; visualOnly: boolean };
  isRandom?: boolean;
}> = ({ reward, isRandom }) => {
  const [randomReward] = useState(() => isRandom ? getRandomNiceReward() : null);
  const displayLabel = isRandom && randomReward ? randomReward.label : reward.label;

  return (
    <motion.div 
      className="portal-reward"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {isRandom ? <Sparkles size={24} className="portal-reward-icon" /> : <Gift size={24} className="portal-reward-icon" />}
      <div className="portal-reward-label">{displayLabel}</div>
      {reward.visualOnly && (
        <div className="portal-reward-note">(Visual preview)</div>
      )}
    </motion.div>
  );
};

const PulseBreakerPlaceholder: React.FC = () => {
  return (
    <div className="portal-placeholder">
      <div className="portal-placeholder-icon">⚡</div>
      <h3 className="portal-placeholder-title">PULSE BREAKER</h3>
      <p className="portal-placeholder-text">Prototype module detected.</p>
      <p className="portal-placeholder-sub">Full feature coming soon.</p>
    </div>
  );
};

const HollywoodGatePlaceholder: React.FC = () => {
  return (
    <div className="portal-placeholder hollywood">
      <div className="portal-placeholder-icon">🎬</div>
      <h3 className="portal-placeholder-title">HOLLYWOOD GATE</h3>
      <p className="portal-placeholder-text">Coming Soon.</p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PortalBehaviorOverlayProps {
  portal: PortalDTO | null;
  isVisible: boolean;
  onClose: () => void;
  mapRef?: React.RefObject<any>;
}

export const PortalBehaviorOverlay: React.FC<PortalBehaviorOverlayProps> = ({
  portal,
  isVisible,
  onClose,
  mapRef,
}) => {
  const { buzzCount, buzzMapCount } = useActivityTracker();
  const [phase, setPhase] = useState<'dialogue' | 'content' | 'lockdown'>('dialogue');
  const [isLocked, setIsLocked] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [loreFragment, setLoreFragment] = useState('');
  const [puzzle, setPuzzle] = useState('');

  const behavior = useMemo(() => {
    if (!portal) return undefined;
    return getPortalBehavior(portal.id);
  }, [portal]);

  // Reset state when portal changes
  useEffect(() => {
    if (isVisible && portal) {
      setPhase('dialogue');
      setShowReward(false);
    }
  }, [isVisible, portal]);

  // Check requirements
  useEffect(() => {
    if (!behavior?.requirement) {
      setIsLocked(false);
      return;
    }

    const req = behavior.requirement;
    
    if (req.type === 'buzz_count') {
      // Nice portal: needs 5 BUZZ + 1 BUZZ MAP
      const needsBuzz = req.minBuzz || 5;
      const needsBuzzMap = req.minBuzzMap || 1;
      setIsLocked(buzzCount < needsBuzz || buzzMapCount < needsBuzzMap);
    } else if (req.type === 'buzz_map_count') {
      // LA portal: needs 19 BUZZ MAP areas
      const needsBuzzMap = req.minBuzzMap || 19;
      setIsLocked(buzzMapCount < needsBuzzMap);
    } else {
      setIsLocked(false);
    }
  }, [behavior, buzzCount, buzzMapCount]);

  // Load random content
  useEffect(() => {
    if (!portal || !isVisible) return;

    if (behavior?.type === 'ECHO_ARCHIVE') {
      setLoreFragment(getRandomLoreFragment(portal.id));
    }
    if (behavior?.type === 'LOST_FREQUENCY') {
      setPuzzle(getRandomPuzzle(portal.id));
    }
  }, [portal, behavior, isVisible]);

  // Apply effects
  useEffect(() => {
    if (!isVisible || !behavior) return;

    // Apply glitch effect
    if (behavior.effects.glitch === 'heavy' || behavior.effects.glitch === 'global') {
      document.body.classList.add('shadow-glitch-active');
      setTimeout(() => document.body.classList.remove('shadow-glitch-active'), 1500);
    }

    // Camera swirl for GEO_VORTEX
    if (behavior.effects.cameraSwirl && mapRef?.current) {
      const map = mapRef.current;
      try {
        map.easeTo({
          bearing: 360,
          duration: 2000,
          easing: (t: number) => t * (2 - t),
        });
        setTimeout(() => {
          map.easeTo({
            bearing: 0,
            duration: 1000,
          });
        }, 2000);
      } catch (e) {
        console.warn('[Portal] Camera swirl failed:', e);
      }
    }

    // Handle lockdown
    if (behavior.effects.lockdown && behavior.type === 'GLOBAL_GLITCH_LOCKDOWN') {
      setPhase('lockdown');
      document.body.classList.add('portal-lockdown-active');
    }

    return () => {
      document.body.classList.remove('shadow-glitch-active');
      document.body.classList.remove('portal-lockdown-active');
    };
  }, [isVisible, behavior, mapRef]);

  const handleDialogueComplete = useCallback(() => {
    setPhase('content');
    if (behavior?.reward && !isLocked) {
      setTimeout(() => setShowReward(true), 400);
    }
  }, [behavior, isLocked]);

  const handleLockdownComplete = useCallback(() => {
    document.body.classList.remove('portal-lockdown-active');
    setPhase('content');
    onClose();
  }, [onClose]);

  if (!isVisible || !portal || !behavior) return null;

  const dialogues = isLocked ? behavior.dialogueLocked : behavior.dialogueUnlocked;
  const portalColor = behavior.type.includes('SHADOW') || behavior.type === 'GATEWAY_ZERO'
    ? '#FF3366'
    : behavior.type === 'ECHO_ARCHIVE'
    ? '#9966FF'
    : '#00E5FF';

  return (
    <AnimatePresence>
      <motion.div
        className="portal-behavior-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="portal-behavior-backdrop" 
          onClick={phase !== 'lockdown' ? onClose : undefined}
        />

        <motion.div
          className="portal-behavior-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{ borderColor: `${portalColor}40` }}
        >
          {phase !== 'lockdown' && (
            <button className="portal-behavior-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}

          <div className="portal-behavior-header">
            <div className="portal-behavior-icon" style={{ borderColor: `${portalColor}50`, color: portalColor }}>
              {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
            </div>
            <h2 className="portal-behavior-title" style={{ color: portalColor }}>{behavior.cityLabel}</h2>
            <div className="portal-behavior-type">{behavior.type.replace(/_/g, ' ')}</div>
          </div>

          <div className="portal-behavior-content">
            {phase === 'lockdown' && behavior.effects.lockdown && (
              <LockdownTimer 
                seconds={behavior.effects.lockdown} 
                onComplete={handleLockdownComplete}
              />
            )}

            {phase === 'dialogue' && dialogues && dialogues.length > 0 && (
              <DialogueDisplay 
                dialogues={dialogues}
                onComplete={handleDialogueComplete}
              />
            )}

            {phase === 'content' && (
              <>
                {behavior.type === 'AGENT_MIRROR' && (
                  <AgentMirrorPanel 
                    buzzCount={buzzCount} 
                    buzzMapCount={buzzMapCount} 
                  />
                )}

                {behavior.type === 'ECHO_ARCHIVE' && loreFragment && (
                  <div className="portal-lore">
                    <Radio size={20} className="portal-lore-icon" />
                    <p className="portal-lore-text">{loreFragment}</p>
                  </div>
                )}

                {behavior.type === 'LOST_FREQUENCY' && puzzle && (
                  <div className="portal-puzzle">
                    <Zap size={20} className="portal-puzzle-icon" />
                    <p className="portal-puzzle-text">{puzzle}</p>
                  </div>
                )}

                {behavior.type === 'PULSE_BREAKER' && (
                  <PulseBreakerPlaceholder />
                )}

                {behavior.type === 'HOLLYWOOD_GATE' && !isLocked && (
                  <HollywoodGatePlaceholder />
                )}

                {behavior.type === 'GATEWAY_ZERO' && (
                  <div className="portal-sealed">
                    <Lock size={28} className="portal-sealed-icon" />
                    <p>Gateway remains sealed until Protocol Zero.</p>
                  </div>
                )}

                {showReward && behavior.reward && (
                  <RewardDisplay 
                    reward={behavior.reward} 
                    isRandom={behavior.reward.type === 'random'}
                  />
                )}
              </>
            )}
          </div>

          <div className="portal-behavior-footer">
            <div className="portal-coords">
              {portal.lat.toFixed(4)}, {portal.lng.toFixed(4)}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PortalBehaviorOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
