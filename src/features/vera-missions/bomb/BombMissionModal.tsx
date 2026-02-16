/**
 * VERA MISSION: BOMBA / DISINNESCO
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * Pattern: MapPillFlipOverlay (NOTE-style)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
import { hapticWarning, hapticSuccess, hapticError } from '@/utils/haptics';
import { toast } from 'sonner';
import {
  BOMB_TIMER_MS,
  getRandomWireConfig,
  type WireConfig,
} from './bombMissionTypes';
import { useBombMissionRun } from './useBombMissionRun';
import { BombDeviceVisual } from './ui/BombDeviceVisual';

interface BombMissionModalProps {
  open: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

type Phase = 'briefing' | 'playing' | 'success' | 'fail' | 'already_played';

export const BombMissionModal: React.FC<BombMissionModalProps> = ({
  open,
  onClose,
  originRect = null,
}) => {
  const { t } = useTranslation();
  const { startRun, finalizeRun, isStarting, isFinalizing } = useBombMissionRun();

  const [phase, setPhase] = useState<Phase>('briefing');
  const [runId, setRunId] = useState<string | null>(null);
  const [wireConfig, setWireConfig] = useState<WireConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState(BOMB_TIMER_MS / 1000);
  const [deltaPe, setDeltaPe] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setPhase('briefing');
    setRunId(null);
    setWireConfig(null);
    setTimeLeft(BOMB_TIMER_MS / 1000);
    setDeltaPe(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleStart = useCallback(async () => {
    if (isStarting) return;
    const res = await startRun();
    if (!res.ok) {
      if (res.error?.code === 'ALREADY_PLAYED_TODAY') {
        setPhase('already_played');
        return;
      }
      if (res.error?.code !== 'IN_FLIGHT') {
        toast.error(res.error?.message || 'Impossibile avviare missione. Riprova.');
        console.error('[VERA_BOMB][START][ERROR]', res.error);
      }
      return;
    }
    if (!res.runId) return;
    console.log('[VERA_BOMB][START][OK]', res.runId);
    setRunId(res.runId);
    setWireConfig(getRandomWireConfig());
    setPhase('playing');
    startTimeRef.current = Date.now();
    hapticWarning();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const left = Math.max(0, Math.ceil((BOMB_TIMER_MS - elapsed) / 1000));
      setTimeLeft(left);
      if (left <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleFail();
      }
    }, 200);
  }, [isStarting, startRun]);

  const handleWireCut = useCallback(
    async (wireIndex: number) => {
      if (!runId || !wireConfig || phase !== 'playing' || isFinalizing) return;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const isCorrect = wireIndex === wireConfig.correctIndex;
      const outcome = isCorrect ? 'success' : 'fail';
      const res = await finalizeRun(runId, outcome, elapsed, {
        wire_cut: wireIndex,
        correct_index: wireConfig.correctIndex,
      });
      if (res?.success && res.deltaPe !== undefined) {
        setDeltaPe(res.deltaPe);
        window.dispatchEvent(new CustomEvent('vera_bomb:completed'));
        if (isCorrect) {
          hapticSuccess();
          setPhase('success');
        } else {
          hapticError();
          setPhase('fail');
        }
      } else if (res?.error) {
        window.dispatchEvent(new CustomEvent('vera_bomb:completed'));
        hapticError();
        setPhase('fail');
      }
    },
    [runId, wireConfig, phase, isFinalizing, finalizeRun]
  );

  const handleFail = useCallback(async () => {
    if (!runId || phase !== 'playing' || isFinalizing) return;
    const elapsed = Date.now() - startTimeRef.current;
    const res = await finalizeRun(runId, 'fail', elapsed, { timeout: true });
    if (res?.success && res.deltaPe !== undefined) {
      setDeltaPe(res.deltaPe);
      window.dispatchEvent(new CustomEvent('vera_bomb:completed'));
      hapticError();
      setPhase('fail');
    } else {
      window.dispatchEvent(new CustomEvent('vera_bomb:completed'));
      setPhase('fail');
    }
  }, [runId, phase, isFinalizing, finalizeRun]);

  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    reset();
    onClose();
  }, [onClose, reset]);

  const accentColor = '#FF4444';

  if (!open) return null;

  return (
    <MapPillFlipOverlay open={open} originRect={originRect} onClose={handleClose}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            flexShrink: 0,
            background: `linear-gradient(180deg, ${accentColor}CC 0%, ${accentColor}66 100%)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handleClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>
            <h1
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              {t('vera_mission.bomb.title')}
            </h1>
            <div style={{ width: '40px' }} />
          </div>
        </div>

        {/* BODY */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 16px',
          }}
        >
          <AnimatePresence mode="wait">
            {phase === 'briefing' && (
              <motion.div
                key="briefing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                  }}
                >
                  {t('vera_mission.bomb.briefing')}
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isStarting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(90deg, ${accentColor}, #CC3333)`,
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: isStarting ? 'not-allowed' : 'pointer',
                    opacity: isStarting ? 0.7 : 1,
                  }}
                >
                  {t('vera_mission.bomb.cta_start')}
                </button>
              </motion.div>
            )}

            {phase === 'already_played' && (
              <motion.div
                key="already_played"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h2
                    style={{
                      color: '#00FF88',
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    {t('vera_mission.bomb.already_played_title')}
                  </h2>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '15px',
                      marginBottom: '24px',
                    }}
                  >
                    {t('vera_mission.bomb.already_played_body')}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(90deg, #00FF88, #00CC6A)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#000',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && wireConfig && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BombDeviceVisual
                  state="armed"
                  secondsLeft={timeLeft}
                  isUrgent={timeLeft <= 5}
                />
                {(() => {
                  const totalSec = BOMB_TIMER_MS / 1000;
                  const progress = Math.max(0, timeLeft / totalSec);
                  const barColor = timeLeft > 10 ? '#00FF88' : timeLeft > 5 ? '#FFD700' : '#FF4444';
                  return (
                    <div style={{ marginBottom: '24px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                          padding: '0 4px',
                        }}
                      >
                        <span style={{ color: barColor, fontSize: '14px', fontWeight: 600 }}>
                          {t('vera_mission.bomb.timer_label')}
                        </span>
                        <motion.span
                          key={timeLeft}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          style={{
                            color: barColor,
                            fontSize: '24px',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                          }}
                        >
                          {timeLeft}s
                        </motion.span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: 'rgba(0,0,0,0.4)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <motion.div
                          initial={false}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.3 }}
                          style={{
                            height: '100%',
                            background: barColor,
                            borderRadius: '4px',
                            boxShadow: `0 0 12px ${barColor}80`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <p
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px',
                    marginBottom: '20px',
                  }}
                >
                  {t('vera_mission.bomb.cut_wire')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...Array(wireConfig.totalWires)].map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => handleWireCut(i)}
                      disabled={isFinalizing}
                      whileHover={!isFinalizing ? { scale: 1.02 } : undefined}
                      whileTap={!isFinalizing ? { scale: 0.96 } : undefined}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      style={{
                        padding: '16px 24px',
                        background: i % 2 === 0
                          ? 'linear-gradient(90deg, #FF4444, #CC2222)'
                          : 'linear-gradient(90deg, #CC2222, #AA1111)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: isFinalizing ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 20px rgba(255,68,68,0.3)',
                      }}
                    >
                      {t('vera_mission.bomb.cut_wire')} #{i + 1}
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {t('vera_mission.bomb.cta_abort')}
                </button>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                  }}
                >
                  <BombDeviceVisual state="disarmed" secondsLeft={0} />
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h2
                    style={{
                      color: '#00FF88',
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    {t('vera_mission.bomb.success_title')}
                  </h2>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '15px',
                      marginBottom: '16px',
                    }}
                  >
                    {t('vera_mission.bomb.success_body')}
                  </p>
                  {deltaPe !== null && deltaPe > 0 && (
                    <p
                      style={{
                        color: '#00FF88',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      +{deltaPe} PE
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'fail' && (
              <motion.div
                key="fail"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                  }}
                >
                  <BombDeviceVisual state="exploded" secondsLeft={0} />
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💥</div>
                  <h2
                    style={{
                      color: '#FF4444',
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    {t('vera_mission.bomb.fail_title')}
                  </h2>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '15px',
                      marginBottom: '16px',
                    }}
                  >
                    {t('vera_mission.bomb.fail_body')}
                  </p>
                  {deltaPe !== null && deltaPe < 0 && (
                    <p
                      style={{
                        color: '#FF4444',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      {deltaPe} PE
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MapPillFlipOverlay>
  );
};
