/**
 * PULSE BREAKER - Main Game Component
 * 🔒 SECURE & FUNCTIONAL
 * 🎰 PSYCHOLOGICAL HOOKS INTEGRATED
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, AlertTriangle, Coins, Info } from 'lucide-react';
import { usePulseBreaker, BetCurrency } from '../hooks/usePulseBreaker';
import { useAwardPE, type AwardPEResult } from '../../pulse/hooks/useAwardPE';
import { isCapacitorNative } from '@/utils/capacitor';
import { useTranslation } from 'react-i18next';
import { PE_REWARD_OVERLAY_SETTLED_EVENT } from '@/features/victoryOrchestration/constants';
import { PulseBreakerPremiumOutcome } from './PulseBreakerPremiumOutcome';
import {
  PulseBreakerPeFallbackLayer,
  type PulseBreakerPeFallbackMoment,
  type PulseBreakerPeFallbackReason,
} from './PulseBreakerPeFallbackLayer';
import './PulseBreaker.css';

const PE_SETTLE_TIMEOUT_MS = 120_000;

/** Listen for overlay settle BEFORE awardPE dispatches pe-credit-event (avoids missing a fast dismiss on iOS). Abort when no overlay will be shown (delta 0 / limit). */
function waitForNextPeOverlaySettled(signal: AbortSignal): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      window.removeEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onEvt as EventListener);
      window.clearTimeout(tid);
      signal.removeEventListener('abort', onAbort);
      resolve();
    };
    const onEvt = () => cleanup();
    const onAbort = () => cleanup();
    if (signal.aborted) {
      resolve();
      return;
    }
    signal.addEventListener('abort', onAbort);
    window.addEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onEvt as EventListener);
    const tid = window.setTimeout(cleanup, PE_SETTLE_TIMEOUT_MS);
  });
}

function peAwardShowsFullscreen(r: { success: boolean; deltaPE?: number }): boolean {
  if (!r.success) return false;
  const d = Number(r.deltaPE ?? 0);
  return Number.isFinite(d) && d > 0;
}

function peFallbackReasonFromAward(r: AwardPEResult): PulseBreakerPeFallbackReason {
  if (r.limitReached) return 'limit';
  if (r.success && !peAwardShowsFullscreen(r)) return 'nocredit';
  return 'generic';
}

const PeRewardBridgeLayer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/78 backdrop-blur-md px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <p className="text-lg font-semibold text-white">{t('pulseBreaker.peBridgeLine1')}</p>
      <p className="mt-2 text-sm text-white/72">{t('pulseBreaker.peBridgeLine2')}</p>
    </motion.div>
  );
};

interface PulseBreakerProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, render only inner content (no overlay). Used when wrapped by M1UShopFlipOverlay for same fullscreen behavior as "+ M1U" modal. */
  renderAsContentOnly?: boolean;
}

const BET_PRESETS = [5, 10, 25, 50, 100];

export const PulseBreaker: React.FC<PulseBreakerProps> = ({ isOpen, onClose, renderAsContentOnly = false }) => {
  const {
    gameState,
    isLoading,
    startRound,
    cashout,
    resetGame,
    userBalance,
    refreshBalance,
    crashHistory,
  } = usePulseBreaker();
  const { t } = useTranslation();

  const isNativePEOnly = isCapacitorNative();
  const [betAmount, setBetAmount] = useState(10);
  const [betCurrency, setBetCurrency] = useState<BetCurrency>(() => (isNativePEOnly ? 'PE' : 'M1U'));
  const [showCrashEffect, setShowCrashEffect] = useState(false);
  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [currentSpeedZone, setCurrentSpeedZone] = useState<'normal' | 'fast' | 'supersonic' | 'warp'>('normal');
  const [sonicBoomEffect, setSonicBoomEffect] = useState<'none' | 'supersonic-enter' | 'warp-enter'>('none');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [postRunPhase, setPostRunPhase] = useState<'none' | 'pe_bridge' | 'pe_fallback' | 'outcome'>('none');
  const [peFallbackPayload, setPeFallbackPayload] = useState<{
    reason: PulseBreakerPeFallbackReason;
    moment: PulseBreakerPeFallbackMoment;
  } | null>(null);
  const peFallbackResolverRef = useRef<(() => void) | null>(null);
  const requestPeFallbackRef = useRef(
    (_reason: PulseBreakerPeFallbackReason, _moment: PulseBreakerPeFallbackMoment) => Promise.resolve()
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastZoneRef = useRef<string>('normal');
  
  // Stars for cosmic warp effect
  const starsRef = useRef<Array<{x: number; y: number; z: number; size: number}>>([]);
  const starsInitialized = useRef(false);

  const balance = betCurrency === 'M1U' ? userBalance.m1u : userBalance.pe;
  
  // 🔋 PE System Hook
  const { awardPE } = useAwardPE();
  const peAwardedRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    requestPeFallbackRef.current = (reason, moment) =>
      new Promise<void>((resolve) => {
        peFallbackResolverRef.current = () => {
          peFallbackResolverRef.current = null;
          resolve();
        };
        setPeFallbackPayload({ reason, moment });
        setPostRunPhase('pe_fallback');
      });
  }, []);

  const dismissPeFallbackStep = useCallback(() => {
    setPeFallbackPayload(null);
    setPostRunPhase('pe_bridge');
    const r = peFallbackResolverRef.current;
    peFallbackResolverRef.current = null;
    r?.();
  }, []);

  // Track speed zone changes and trigger effects
  useEffect(() => {
    if (gameState.status !== 'running') {
      setCurrentSpeedZone('normal');
      lastZoneRef.current = 'normal';
      return;
    }
    
    const mult = gameState.currentMultiplier;
    let newZone: 'normal' | 'fast' | 'supersonic' | 'warp' = 'normal';
    
    if (mult >= 4) newZone = 'warp';
    else if (mult >= 3) newZone = 'supersonic';
    else if (mult >= 2) newZone = 'fast';
    
    // Trigger sonic boom on zone change
    if (newZone !== lastZoneRef.current) {
      if (newZone === 'supersonic' && lastZoneRef.current !== 'warp') {
        setSonicBoomEffect('supersonic-enter');
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setSonicBoomEffect('none'), 400);
      } else if (newZone === 'warp') {
        setSonicBoomEffect('warp-enter');
        if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
        setTimeout(() => setSonicBoomEffect('none'), 500);
      }
      lastZoneRef.current = newZone;
    }
    
    setCurrentSpeedZone(newZone);
  }, [gameState.currentMultiplier, gameState.status]);
  
  // 🎰 REGOLA 4: Celebrazione vincite con effetti
  useEffect(() => {
    if (gameState.status === 'cashed_out') {
      setShowWinCelebration(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]);
      }
      setTimeout(() => setShowWinCelebration(false), 2000);
    }
  }, [gameState.status]);

  // 🎰 REGOLA 5: Crash drammatico
  useEffect(() => {
    if (gameState.status === 'crashed') {
      setShowCrashEffect(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      setTimeout(() => setShowCrashEffect(false), 1500);
    }
  }, [gameState.status]);

  // 🔋 PE: sequential PLAY → (settle overlay if PE shown) → WIN if cashout → settle → final outcome modal (not legacy CelebrationModal).
  useEffect(() => {
    const terminal = gameState.status === 'cashed_out' || gameState.status === 'crashed';
    const roundId = gameState.roundId;
    if (!terminal || !roundId) return;
    if (peAwardedRef.current === roundId) return;

    const snap = {
      status: gameState.status,
      roundId: gameState.roundId!,
      betAmount: gameState.betAmount,
      betCurrency: gameState.betCurrency,
      crashPoint: gameState.crashPoint,
      payout: gameState.payout,
      cashoutMultiplier: gameState.cashoutMultiplier,
    };
    const win = snap.status === 'cashed_out';

    let cancelled = false;
    const tid = window.setTimeout(() => {
      void (async () => {
        if (cancelled) return;
        if (peAwardedRef.current === roundId) return;
        peAwardedRef.current = roundId;
        setPostRunPhase('pe_bridge');
        try {
          const acPlay = new AbortController();
          const waitPlay = waitForNextPeOverlaySettled(acPlay.signal);
          const rPlay = await awardPE('PULSE_BREAKER_PLAY', undefined, {
            roundId: snap.roundId,
            betAmount: snap.betAmount,
            betCurrency: snap.betCurrency,
            crashPoint: snap.crashPoint,
          });
          if (cancelled) {
            acPlay.abort();
            return;
          }
          if (peAwardShowsFullscreen(rPlay)) await waitPlay;
          else {
            acPlay.abort();
            await requestPeFallbackRef.current(peFallbackReasonFromAward(rPlay), 'play');
          }
          if (cancelled) return;

          if (win) {
            const acWin = new AbortController();
            const waitWin = waitForNextPeOverlaySettled(acWin.signal);
            const rWin = await awardPE('PULSE_BREAKER_WIN', undefined, {
              roundId: snap.roundId,
              payout: snap.payout,
              multiplier: snap.cashoutMultiplier,
            });
            if (cancelled) {
              acWin.abort();
              return;
            }
            if (peAwardShowsFullscreen(rWin)) await waitWin;
            else {
              acWin.abort();
              await requestPeFallbackRef.current(peFallbackReasonFromAward(rWin), 'win');
            }
          }
        } catch (e) {
          console.warn('[PulseBreaker] PE pipeline error:', e);
        }
        if (!cancelled) setPostRunPhase('outcome');
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [
    gameState.status,
    gameState.roundId,
    gameState.betAmount,
    gameState.betCurrency,
    gameState.crashPoint,
    gameState.payout,
    gameState.cashoutMultiplier,
    awardPE,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setPostRunPhase('none');
      peAwardedRef.current = null;
      setPeFallbackPayload(null);
      peFallbackResolverRef.current = null;
    }
  }, [isOpen]);

  // Canvas drawing - COSMIC WARP STYLE with Stars
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize stars once
    if (!starsInitialized.current || starsRef.current.length === 0) {
      starsRef.current = [];
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * width * 3,
          y: (Math.random() - 0.5) * height * 3,
          z: Math.random() * width,
          size: Math.random() * 1.5 + 0.5
        });
      }
      starsInitialized.current = true;
    }

    // Deep space background
    ctx.fillStyle = '#000508';
    ctx.fillRect(0, 0, width, height);

    // Calculate PROGRESSIVE warp speed based on multiplier zones
    const mult = gameState.currentMultiplier;
    let warpSpeed: number;
    let warpZone: string;
    let trailColor: string;
    
    if (gameState.status !== 'running') {
      warpSpeed = 0.1;
      warpZone = 'idle';
      trailColor = 'rgba(200, 220, 255, ';
    } else if (mult < 2) {
      // NORMALE: 1x-2x - Stelle lente
      warpSpeed = 0.5 + (mult - 1) * 1;
      warpZone = 'normal';
      trailColor = 'rgba(200, 220, 255, ';
    } else if (mult < 3) {
      // VELOCE: 2x-3x - Stelle veloci
      warpSpeed = 1.5 + (mult - 2) * 3;
      warpZone = 'fast';
      trailColor = 'rgba(100, 200, 255, ';
    } else if (mult < 4) {
      // SUPERSONICA: 3x-4x - Stelle sfrecciano
      warpSpeed = 4.5 + (mult - 3) * 6;
      warpZone = 'supersonic';
      trailColor = 'rgba(150, 100, 255, ';
    } else {
      // WARP: 4x+ - Iperspazio totale!
      warpSpeed = 10.5 + (mult - 4) * 4;
      warpZone = 'warp';
      trailColor = 'rgba(255, 100, 255, ';
    }

    // Draw and update stars (cosmic warp effect)
    const stars = starsRef.current;
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      
      // Move stars toward viewer
      star.z -= warpSpeed;
      
      // Reset star if it passes the viewer
      if (star.z <= 0) {
        star.x = (Math.random() - 0.5) * width * 3;
        star.y = (Math.random() - 0.5) * height * 3;
        star.z = width;
      }
      
      // Project 3D to 2D
      const perspective = width / star.z;
      const screenX = centerX + star.x * perspective;
      const screenY = centerY + star.y * perspective;
      
      // Only draw if on screen
      if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
        const size = star.size * perspective * 0.5;
        const alpha = Math.min(1, (width - star.z) / width);
        
        // Star trail (warp effect) - longer trails at higher speeds
        if (gameState.status === 'running' && warpSpeed > 0.5) {
          const trailLength = Math.min(size * warpSpeed * 3, warpZone === 'warp' ? 80 : 40);
          const gradient = ctx.createLinearGradient(
            screenX, screenY,
            screenX - (star.x * perspective * 0.15), screenY - (star.y * perspective * 0.15)
          );
          gradient.addColorStop(0, trailColor + alpha + ')');
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = warpZone === 'warp' ? size * 0.8 : size * 0.5;
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX - trailLength * (star.x / width), screenY - trailLength * (star.y / height));
          ctx.stroke();
        }
        
        // Star point - brighter in warp mode
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, size), 0, Math.PI * 2);
        const starBrightness = warpZone === 'warp' ? 255 : 220;
        ctx.fillStyle = `rgba(${starBrightness}, ${starBrightness}, 255, ${alpha})`;
        ctx.fill();
      }
    }
    
    // Warp zone indicator flash
    if (warpZone === 'warp' && gameState.status === 'running') {
      const flashAlpha = 0.02 + Math.sin(Date.now() / 50) * 0.02;
      ctx.fillStyle = `rgba(255, 100, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Graph margins
    const marginLeft = 35;
    const marginBottom = 25;
    const marginTop = 20;
    const marginRight = 10;
    const graphWidth = width - marginLeft - marginRight;
    const graphHeight = height - marginTop - marginBottom;

    // Draw axes
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, height - marginBottom);
    ctx.stroke();
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - marginBottom);
    ctx.lineTo(width - marginRight, height - marginBottom);
    ctx.stroke();

    // Y axis labels (1x to 20x)
    ctx.font = '9px Orbitron, monospace';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 20; i += 5) {
      const y = height - marginBottom - (i / 20) * graphHeight;
      ctx.fillText(`${i}x`, marginLeft - 5, y + 3);
      // Grid line
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(width - marginRight, y);
      ctx.stroke();
    }
    // Zone markers
    const zones = [
      { y: 2, label: 'FAST', color: 'rgba(100, 200, 255, 0.3)' },
      { y: 3, label: 'SONIC', color: 'rgba(150, 100, 255, 0.3)' },
      { y: 4, label: 'WARP', color: 'rgba(255, 100, 255, 0.3)' },
    ];
    zones.forEach(zone => {
      const zoneY = height - marginBottom - (zone.y / 20) * graphHeight;
      ctx.strokeStyle = zone.color;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, zoneY);
      ctx.lineTo(width - marginRight, zoneY);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // X axis labels (time markers)
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
    for (let i = 0; i <= 4; i++) {
      const x = marginLeft + (i / 4) * graphWidth;
      ctx.fillText(`${i * 5}s`, x, height - 8);
    }

    // Draw game curve
    if (gameState.status === 'running' || gameState.status === 'cashed_out' || gameState.status === 'crashed') {
      const progress = Math.min((mult - 1) / 19, 1); // Max 20x
      
      const startX = marginLeft;
      const startY = height - marginBottom;
      const endX = marginLeft + progress * graphWidth;
      const endY = height - marginBottom - (progress * graphHeight);

      // M1SSION colors based on speed zones
      let mainColor: string;
      let glowIntensity: number;
      
      if (mult < 2) {
        // NORMALE: Cyan
        mainColor = '#00e5ff';
        glowIntensity = 0.3;
      } else if (mult < 3) {
        // VELOCE: Light Blue
        mainColor = '#64c8ff';
        glowIntensity = 0.5;
      } else if (mult < 4) {
        // SUPERSONICA: Violet
        mainColor = '#9664ff';
        glowIntensity = 0.7;
      } else if (mult < 10) {
        // WARP: Magenta
        mainColor = '#ff64ff';
        glowIntensity = 0.9;
      } else {
        // EXTREME WARP: Hot Pink/White
        mainColor = '#ff88ff';
        glowIntensity = 1;
      }
      
      if (gameState.status === 'crashed') {
        mainColor = '#ff1744';
        glowIntensity = 1;
      }

      // Control points
      const cp1x = startX + (endX - startX) * 0.4;
      const cp1y = startY;
      const cp2x = startX + (endX - startX) * 0.8;
      const cp2y = endY + (startY - endY) * 0.3;

      // Filled area under curve
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      ctx.lineTo(endX, height - marginBottom);
      ctx.lineTo(startX, height - marginBottom);
      ctx.closePath();
      
      const areaGradient = ctx.createLinearGradient(0, endY, 0, height - marginBottom);
      // Convert hex to rgba
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      areaGradient.addColorStop(0, hexToRgba(mainColor, 0.2));
      areaGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = areaGradient;
      ctx.fill();

      // Pulsing glow (intensity increases with multiplier)
      const pulsePhase = Math.sin(Date.now() / (200 - mult * 15)) * 0.5 + 0.5;
      const glowWidth = 3 + glowIntensity * 4 * pulsePhase;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      ctx.strokeStyle = mainColor + Math.floor(40 + pulsePhase * 40).toString(16);
      ctx.lineWidth = glowWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Ultra thin main line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Small marker (like rewards marker)
      const markerPulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;
      const markerSize = 3 + markerPulse;
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(endX, endY, markerSize + 2, 0, Math.PI * 2);
      ctx.fillStyle = mainColor + '40';
      ctx.fill();
      
      // Main dot
      ctx.beginPath();
      ctx.arc(endX, endY, markerSize, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
      
      // Center white
      ctx.beginPath();
      ctx.arc(endX, endY, markerSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Crash glitch effect
      if (gameState.status === 'crashed') {
        ctx.fillStyle = 'rgba(255, 0, 50, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 4; i++) {
          const glitchY = Math.random() * height;
          ctx.fillStyle = `rgba(255, 23, 68, ${0.05 + Math.random() * 0.1})`;
          ctx.fillRect(0, glitchY, width, 1);
        }
      }
    }

    if (gameState.status === 'running') {
      animationRef.current = requestAnimationFrame(drawCanvas);
    }
  }, [gameState.status, gameState.currentMultiplier]);

  useEffect(() => {
    if (gameState.status === 'running') {
      drawCanvas();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawCanvas();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.status, drawCanvas]);

  useEffect(() => {
    if (gameState.status !== 'running') {
      drawCanvas();
    }
  }, [gameState.currentMultiplier, drawCanvas]);

  const handleStart = async () => {
    if (betAmount > balance || betAmount < 1) return;
    await startRound(betAmount, betCurrency);
  };

  /** After premium outcome CTA / header X: reset run only. Do NOT call onClose() — that is closePulseBreaker and dismisses the whole PB shell (reads as Home). */
  const handleFinishOutcomeFlow = useCallback(() => {
    peAwardedRef.current = null;
    setPostRunPhase('none');
    resetGame();
  }, [resetGame]);

  const handleClose = useCallback(() => {
    if (gameState.status === 'running') return;
    if (postRunPhase === 'pe_bridge' || postRunPhase === 'pe_fallback') return;
    if (postRunPhase === 'outcome') {
      handleFinishOutcomeFlow();
      return;
    }
    resetGame();
    onClose();
  }, [gameState.status, postRunPhase, resetGame, onClose, handleFinishOutcomeFlow]);

  useEffect(() => {
    refreshBalance();
  }, [betCurrency, refreshBalance]);

  // Native: lock to PE-only (no M1U)
  useEffect(() => {
    if (isNativePEOnly && betCurrency === 'M1U') setBetCurrency('PE');
  }, [isNativePEOnly, betCurrency]);

  useEffect(() => {
    if (isOpen) {
      refreshBalance();
    }
  }, [isOpen, refreshBalance]);

  /* Body scroll lock while Pulse Breaker is open (same pattern as GlassModal). Skip when renderAsContentOnly: parent M1UShopFlipOverlay does it. */
  useEffect(() => {
    if (!isOpen || renderAsContentOnly) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.classList.add('m1-modal-open');
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
      document.body.classList.remove('m1-modal-open');
    };
  }, [isOpen, renderAsContentOnly]);

  /* When renderAsContentOnly: STESSO layout del modale IMPOSTAZIONI = header (m1-folder-glass--graphite) + body scrollabile a tutta pagina. */
  if (renderAsContentOnly) {
    const shellStyle: React.CSSProperties = {
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      overflow: 'hidden',
    };
    const bodyStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      padding: 16,
      paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
      WebkitOverflowScrolling: 'touch',
    };
    return (
      <>
        <AnimatePresence>
          {showCrashEffect && (
            <motion.div className="pb-crash-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showWinCelebration && (
            <motion.div
              className="pb-win-celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0.6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.3), rgba(0, 231, 255, 0.2), transparent)', pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>
        <div style={shellStyle} className="settings-modal">
          {/* HEADER — identico al modale Impostazioni: m1-folder-glass--graphite + X + titolo + spacer + sottotitolo */}
          <div
            className="m1-folder-glass--graphite"
            style={{ flexShrink: 0, width: '100%', position: 'relative', padding: 0, borderRadius: '24px 24px 0 0', overflow: 'hidden' }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="m1-panel relative"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
                paddingBottom: '20px',
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: '16px 16px 0 0',
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  disabled={gameState.status === 'running' || postRunPhase === 'pe_bridge' || postRunPhase === 'pe_fallback'}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  type="button"
                >
                  <X style={{ width: 20, height: 20, color: '#FFFFFF' }} />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px', margin: 0 }}>
                    PULSE BREAKER
                  </h1>
                </div>
                <div style={{ width: 40 }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                Simulation game – entertainment only
              </p>
            </motion.div>
          </div>
          {/* CONTENT — come Impostazioni: flex 1, overflowY auto, padding + safe-area bottom */}
          <div style={bodyStyle}>
            <div className="pb-container pb-container--fullscreen">
              <>
                  <div className="pb-header-section">
                    <div className="pb-logo">
                      <Zap className="pb-logo-icon" />
                      <span className="pb-logo-text">PULSE BREAKER</span>
                    </div>
                    {!isNativePEOnly && (
                      <div className="pb-balance-pill">
                        <Coins className="pb-pill-icon" />
                        <span className="pb-pill-value">{Math.floor(userBalance.m1u)}</span>
                        <span className="pb-pill-label">M1U</span>
                      </div>
                    )}
                    <div className="pb-balance-pill">
                      <Zap className="pb-pill-icon" />
                      <span className="pb-pill-value">{Math.floor(userBalance.pe)}</span>
                      <span className="pb-pill-label">PE</span>
                    </div>
                  </div>
                  <div className={`pb-game-area ${gameState.status === 'crashed' ? 'crashed' : ''}`}>
                    <canvas ref={canvasRef} className="pb-canvas" />
                    {gameState.status === 'running' && (
                      <div className={`pb-speed-indicator ${currentSpeedZone}`}>
                        {currentSpeedZone === 'normal' && '● NORMAL'}
                        {currentSpeedZone === 'fast' && '●● FAST'}
                        {currentSpeedZone === 'supersonic' && '●●● SONIC'}
                        {currentSpeedZone === 'warp' && '◆ WARP'}
                      </div>
                    )}
                    {sonicBoomEffect !== 'none' && <div className={`pb-sonic-boom ${sonicBoomEffect}`} />}
                    <div className={`pb-multiplier-display ${gameState.status}`}>
                      {gameState.status === 'crashed' ? (
                        <motion.div className="pb-crashed-display" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <span className="pb-crash-text">CRASH!</span>
                          <span className="pb-crash-mult">{gameState.crashPoint?.toFixed(2)}×</span>
                        </motion.div>
                      ) : gameState.status === 'cashed_out' ? (
                        <motion.div className="pb-win-display" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <span className="pb-win-text">ESTRATTO!</span>
                          <span className="pb-win-mult">{gameState.cashoutMultiplier?.toFixed(2)}×</span>
                          <span className="pb-win-amount">+{Math.floor(gameState.payout || 0)} {gameState.betCurrency}</span>
                        </motion.div>
                      ) : (
                        <motion.span className="pb-live-mult" key={gameState.currentMultiplier} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                          {gameState.currentMultiplier.toFixed(2)}×
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="pb-controls-section">
                    {gameState.status === 'idle' && (
                      <motion.div className="pb-idle-controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {crashHistory.length > 0 && (
                          <div className="pb-crash-history">
                            <span className="pb-history-label">Ultimi crash:</span>
                            <div className="pb-history-pills">
                              {crashHistory.slice(-6).map((crash, i) => (
                                <span key={i} className={`pb-history-pill ${crash >= 2 ? 'high' : crash >= 1.5 ? 'mid' : 'low'}`}>{crash.toFixed(2)}×</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {!isNativePEOnly && (
                          <div className="pb-currency-selector">
                            <button className={`pb-curr-btn ${betCurrency === 'M1U' ? 'active' : ''}`} onClick={() => setBetCurrency('M1U')}><Coins size={16} /> M1U</button>
                            <button className={`pb-curr-btn ${betCurrency === 'PE' ? 'active' : ''}`} onClick={() => setBetCurrency('PE')}><Zap size={16} /> PE</button>
                          </div>
                        )}
                        <div className="pb-bet-presets">
                          {BET_PRESETS.map(preset => (
                            <button key={preset} className={`pb-preset ${betAmount === preset ? 'active' : ''}`} onClick={() => setBetAmount(preset)} disabled={preset > balance}>{preset}</button>
                          ))}
                        </div>
                        <div className="pb-bet-input-wrapper">
                          <input type="number" className="pb-bet-input" value={betAmount} onChange={(e) => setBetAmount(Math.max(1, Math.min(Number(e.target.value), Math.min(balance, 1000))))} min={1} max={Math.min(balance, 1000)} />
                          <span className="pb-input-currency">{betCurrency}</span>
                        </div>
                        <motion.button className="pb-start-btn" onClick={handleStart} disabled={isLoading || betAmount < 1 || betAmount > balance} whileTap={{ scale: 0.97 }}><Zap size={22} /> START</motion.button>
                      </motion.div>
                    )}
                    {gameState.status === 'running' && (
                      <motion.div className="pb-running-controls" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="pb-potential-win">Vincita: <strong>{Math.floor(betAmount * gameState.currentMultiplier)} {betCurrency}</strong></div>
                        <motion.button className="pb-extract-btn" onClick={cashout} disabled={isLoading} whileTap={{ scale: 0.95 }} animate={{ boxShadow: ['0 0 20px rgba(0, 255, 136, 0.4)', '0 0 40px rgba(0, 255, 136, 0.7)', '0 0 20px rgba(0, 255, 136, 0.4)'] }} transition={{ duration: 0.6, repeat: Infinity }}><TrendingUp size={24} /> ESTRAI {Math.floor(betAmount * gameState.currentMultiplier)}</motion.button>
                        <div className="pb-warning-text"><AlertTriangle size={14} /> Estrai prima del CRASH!</div>
                      </motion.div>
                    )}
                    {gameState.error && <div className="pb-error-msg">⚠️ {gameState.error}</div>}
                  </div>
                  <div className="pb-disclaimer-footer">
                    <span className="pb-disclaimer-text">⚡ ENTERTAINMENT ONLY – No real money, no cash prizes, no withdrawals.</span>
                    <button className="pb-disclaimer-info-btn" onClick={() => setShowDisclaimer(true)} aria-label="More info about game disclaimer"><Info size={14} /></button>
                  </div>
              </>
            </div>
          </div>
          <AnimatePresence>
            {postRunPhase === 'pe_bridge' && <PeRewardBridgeLayer key="pb-pe-bridge" />}
            {postRunPhase === 'pe_fallback' && peFallbackPayload && (
              <PulseBreakerPeFallbackLayer
                key="pb-pe-fallback"
                reason={peFallbackPayload.reason}
                moment={peFallbackPayload.moment}
                onContinue={dismissPeFallbackStep}
              />
            )}
            {postRunPhase === 'outcome' && (
              <PulseBreakerPremiumOutcome
                key="pb-outcome"
                win={gameState.status === 'cashed_out'}
                payout={Math.floor(gameState.payout || 0)}
                betCurrency={gameState.betCurrency}
                crashPoint={gameState.crashPoint ?? 0}
                cashoutMultiplier={gameState.cashoutMultiplier ?? null}
                betAmount={gameState.betAmount}
                showNearMiss={!!gameState.nearMissMultiplier}
                potentialWinAtCrash={
                  gameState.potentialWinAtCrash != null ? Math.floor(gameState.potentialWinAtCrash) : null
                }
                onContinue={handleFinishOutcomeFlow}
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {showDisclaimer && (
            <motion.div className="pb-disclaimer-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDisclaimer(false)}>
              <motion.div className="pb-disclaimer-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <button className="pb-disclaimer-close" onClick={() => setShowDisclaimer(false)}><X size={18} /></button>
                <h3 className="pb-disclaimer-title">🎮 PULSE BREAKER — SIMULATION GAME</h3>
                <div className="pb-disclaimer-content">
                  <p className="pb-disclaimer-intro">This game is provided for <strong>ENTERTAINMENT PURPOSES ONLY</strong>.</p>
                  <div className="pb-disclaimer-section"><h4>❌ NO GAMBLING</h4><p>This is NOT a gambling application. No real money is wagered, won, or lost.</p></div>
                  <div className="pb-disclaimer-section"><h4>❌ NO REAL-MONEY REWARDS</h4><p>{isNativePEOnly ? t('pulseBreaker.disclaimerPeOnly') : 'All currencies (M1U, PE) are virtual, in-app currencies with no monetary value.'}</p></div>
                  <div className="pb-disclaimer-section"><h4>❌ NO CASH-OUT / WITHDRAWALS</h4><p>Virtual currencies cannot be exchanged or withdrawn for real money.</p></div>
                  <div className="pb-disclaimer-section"><h4>✔️ ENTERTAINMENT ONLY</h4><p>This simulation is designed for fun within the M1SSION™ experience.</p></div>
                  <div className="pb-disclaimer-section"><h4>⚠️ RESPONSIBLE PLAY</h4><p>Not intended to encourage repetitive paid play or simulate gambling behavior.</p></div>
                </div>
                <p className="pb-disclaimer-legal">By playing, you acknowledge this is a simulation game with no real-world monetary implications.</p>
                <p className="pb-disclaimer-copyright">© 2025 NIYVORA KFT – M1SSION™</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pb-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && gameState.status !== 'running') {
              handleClose();
            }
          }}
        >
        {/* Crash flash */}
        <AnimatePresence>
          {showCrashEffect && (
            <motion.div
              className="pb-crash-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        
        {/* 🎰 REGOLA 4: Win celebration */}
        <AnimatePresence>
          {showWinCelebration && (
            <motion.div
              className="pb-win-celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0.6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.3), rgba(0, 231, 255, 0.2), transparent)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="pb-container"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Close Button */}
          <button 
            className="pb-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleClose();
            }}
            disabled={gameState.status === 'running' || postRunPhase === 'pe_bridge' || postRunPhase === 'pe_fallback'}
            type="button"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="pb-header-section">
            <div className="pb-logo">
              <Zap className="pb-logo-icon" />
              <span className="pb-logo-text">PULSE BREAKER</span>
            </div>
            
            {/* Balance: on native PE-only, show only PE pill */}
            {!isNativePEOnly && (
              <div className="pb-balance-pill">
                <Coins className="pb-pill-icon" />
                <span className="pb-pill-value">{Math.floor(userBalance.m1u)}</span>
                <span className="pb-pill-label">M1U</span>
              </div>
            )}
            <div className="pb-balance-pill">
              <Zap className="pb-pill-icon" />
              <span className="pb-pill-value">{Math.floor(userBalance.pe)}</span>
              <span className="pb-pill-label">PE</span>
            </div>
          </div>

          {/* Game Area */}
          <div className={`pb-game-area ${gameState.status === 'crashed' ? 'crashed' : ''}`}>
            <canvas ref={canvasRef} className="pb-canvas" />
            
            {/* Speed Zone Indicator */}
            {gameState.status === 'running' && (
              <div className={`pb-speed-indicator ${currentSpeedZone}`}>
                {currentSpeedZone === 'normal' && '● NORMAL'}
                {currentSpeedZone === 'fast' && '●● FAST'}
                {currentSpeedZone === 'supersonic' && '●●● SONIC'}
                {currentSpeedZone === 'warp' && '◆ WARP'}
              </div>
            )}
            
            {/* Sonic Boom Effect */}
            {sonicBoomEffect !== 'none' && (
              <div className={`pb-sonic-boom ${sonicBoomEffect}`} />
            )}
            
            {/* Multiplier */}
            <div className={`pb-multiplier-display ${gameState.status}`}>
              {gameState.status === 'crashed' ? (
                <motion.div 
                  className="pb-crashed-display"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="pb-crash-text">CRASH!</span>
                  <span className="pb-crash-mult">{gameState.crashPoint?.toFixed(2)}×</span>
                </motion.div>
              ) : gameState.status === 'cashed_out' ? (
                <motion.div 
                  className="pb-win-display"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <span className="pb-win-text">ESTRATTO!</span>
                  <span className="pb-win-mult">{gameState.cashoutMultiplier?.toFixed(2)}×</span>
                  <span className="pb-win-amount">+{Math.floor(gameState.payout || 0)} {gameState.betCurrency}</span>
                </motion.div>
              ) : (
                <motion.span 
                  className="pb-live-mult"
                  key={gameState.currentMultiplier}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {gameState.currentMultiplier.toFixed(2)}×
                </motion.span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="pb-controls-section">
            {gameState.status === 'idle' && (
              <motion.div 
                className="pb-idle-controls"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* 🎰 REGOLA 2: Storico Crash (Gambler's Fallacy) */}
                {crashHistory.length > 0 && (
                  <div className="pb-crash-history">
                    <span className="pb-history-label">Ultimi crash:</span>
                    <div className="pb-history-pills">
                      {crashHistory.slice(-6).map((crash, i) => (
                        <span 
                          key={i} 
                          className={`pb-history-pill ${crash >= 2 ? 'high' : crash >= 1.5 ? 'mid' : 'low'}`}
                        >
                          {crash.toFixed(2)}×
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Currency: on native PE-only, no selector (only PE) */}
                {!isNativePEOnly && (
                  <div className="pb-currency-selector">
                    <button
                      className={`pb-curr-btn ${betCurrency === 'M1U' ? 'active' : ''}`}
                      onClick={() => setBetCurrency('M1U')}
                    >
                      <Coins size={16} />
                      M1U
                    </button>
                    <button
                      className={`pb-curr-btn ${betCurrency === 'PE' ? 'active' : ''}`}
                      onClick={() => setBetCurrency('PE')}
                    >
                      <Zap size={16} />
                      PE
                    </button>
                  </div>
                )}

                {/* Presets */}
                <div className="pb-bet-presets">
                  {BET_PRESETS.map(preset => (
                    <button
                      key={preset}
                      className={`pb-preset ${betAmount === preset ? 'active' : ''}`}
                      onClick={() => setBetAmount(preset)}
                      disabled={preset > balance}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="pb-bet-input-wrapper">
                  <input
                    type="number"
                    className="pb-bet-input"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, Math.min(Number(e.target.value), Math.min(balance, 1000))))}
                    min={1}
                    max={Math.min(balance, 1000)}
                  />
                  <span className="pb-input-currency">{betCurrency}</span>
                </div>

                {/* Start */}
                <motion.button
                  className="pb-start-btn"
                  onClick={handleStart}
                  disabled={isLoading || betAmount < 1 || betAmount > balance}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap size={22} />
                  START
                </motion.button>
              </motion.div>
            )}

            {/* 🎰 REGOLA 3: Urgenza con potenziale vincita */}
            {gameState.status === 'running' && (
              <motion.div 
                className="pb-running-controls"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="pb-potential-win">
                  Vincita: <strong>{Math.floor(betAmount * gameState.currentMultiplier)} {betCurrency}</strong>
                </div>
                <motion.button
                  className="pb-extract-btn"
                  onClick={cashout}
                  disabled={isLoading}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(0, 255, 136, 0.4)',
                      '0 0 40px rgba(0, 255, 136, 0.7)',
                      '0 0 20px rgba(0, 255, 136, 0.4)'
                    ]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <TrendingUp size={24} />
                  ESTRAI {Math.floor(betAmount * gameState.currentMultiplier)}
                </motion.button>
                <div className="pb-warning-text">
                  <AlertTriangle size={14} />
                  Estrai prima del CRASH!
                </div>
              </motion.div>
            )}

            {gameState.error && (
              <div className="pb-error-msg">⚠️ {gameState.error}</div>
            )}
          </div>

          {/* ⚖️ LEGAL DISCLAIMER FOOTER */}
          <div className="pb-disclaimer-footer">
            <span className="pb-disclaimer-text">
              ⚡ ENTERTAINMENT ONLY – No real money, no cash prizes, no withdrawals.
            </span>
            <button 
              className="pb-disclaimer-info-btn"
              onClick={() => setShowDisclaimer(true)}
              aria-label="More info about game disclaimer"
            >
              <Info size={14} />
            </button>
          </div>

          <AnimatePresence>
            {postRunPhase === 'pe_bridge' && <PeRewardBridgeLayer key="pb-pe-bridge" />}
            {postRunPhase === 'pe_fallback' && peFallbackPayload && (
              <PulseBreakerPeFallbackLayer
                key="pb-pe-fallback"
                reason={peFallbackPayload.reason}
                moment={peFallbackPayload.moment}
                onContinue={dismissPeFallbackStep}
              />
            )}
            {postRunPhase === 'outcome' && (
              <PulseBreakerPremiumOutcome
                key="pb-outcome"
                win={gameState.status === 'cashed_out'}
                payout={Math.floor(gameState.payout || 0)}
                betCurrency={gameState.betCurrency}
                crashPoint={gameState.crashPoint ?? 0}
                cashoutMultiplier={gameState.cashoutMultiplier ?? null}
                betAmount={gameState.betAmount}
                showNearMiss={!!gameState.nearMissMultiplier}
                potentialWinAtCrash={
                  gameState.potentialWinAtCrash != null ? Math.floor(gameState.potentialWinAtCrash) : null
                }
                onContinue={handleFinishOutcomeFlow}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* ⚖️ FULL DISCLAIMER MODAL */}
        <AnimatePresence>
          {showDisclaimer && (
            <motion.div
              className="pb-disclaimer-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
            >
              <motion.div
                className="pb-disclaimer-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="pb-disclaimer-close"
                  onClick={() => setShowDisclaimer(false)}
                >
                  <X size={18} />
                </button>
                
                <h3 className="pb-disclaimer-title">
                  🎮 PULSE BREAKER — SIMULATION GAME
                </h3>
                
                <div className="pb-disclaimer-content">
                  <p className="pb-disclaimer-intro">
                    This game is provided for <strong>ENTERTAINMENT PURPOSES ONLY</strong>.
                  </p>
                  
                  <div className="pb-disclaimer-section">
                    <h4>❌ NO GAMBLING</h4>
                    <p>This is NOT a gambling application. No real money is wagered, won, or lost.</p>
                  </div>
                  
                  <div className="pb-disclaimer-section">
                    <h4>❌ NO REAL-MONEY REWARDS</h4>
                    <p>{isNativePEOnly ? t('pulseBreaker.disclaimerPeOnly') : 'All currencies (M1U, PE) are virtual, in-app currencies with no monetary value.'}</p>
                  </div>
                  
                  <div className="pb-disclaimer-section">
                    <h4>❌ NO CASH-OUT / WITHDRAWALS</h4>
                    <p>Virtual currencies cannot be exchanged or withdrawn for real money.</p>
                  </div>
                  
                  <div className="pb-disclaimer-section">
                    <h4>✔️ ENTERTAINMENT ONLY</h4>
                    <p>This simulation is designed for fun within the M1SSION™ experience.</p>
                  </div>
                  
                  <div className="pb-disclaimer-section">
                    <h4>⚠️ RESPONSIBLE PLAY</h4>
                    <p>Not intended to encourage repetitive paid play or simulate gambling behavior.</p>
                  </div>
                </div>
                
                <p className="pb-disclaimer-legal">
                  By playing, you acknowledge this is a simulation game with no real-world monetary implications.
                </p>
                
                <p className="pb-disclaimer-copyright">
                  © 2025 NIYVORA KFT – M1SSION™
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
