/**
 * Pin rotator — AA-style: place all pins without collision; angle at win for server only.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeDegrees } from './pinRotatorAngles';

const TWO_PI = Math.PI * 2;
const WORLD_BOTTOM = Math.PI / 2;
const TAP_COOLDOWN_MS = 180;
const FLIGHT_MS = 220;
const BASE_SPEED_RAD = 1.05;
const BASE_THRESHOLD_RAD = 0.14;

function normalizeRad(r: number): number {
  let x = r % TWO_PI;
  if (x < 0) x += TWO_PI;
  return x;
}

function angularDistanceRad(a: number, b: number): number {
  const x = normalizeRad(a);
  const y = normalizeRad(b);
  let d = Math.abs(x - y);
  return Math.min(d, TWO_PI - d);
}

function attachPhi(discRotRad: number): number {
  return normalizeRad(WORLD_BOTTOM - discRotRad);
}

function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export interface PinRotatorGameCanvasProps {
  phase: 1 | 2;
  pinsTarget: number;
  paused: boolean;
  onRoundSuccess: (angleDeg: number) => void;
}

export const PinRotatorGameCanvas: React.FC<PinRotatorGameCanvasProps> = ({
  phase,
  pinsTarget,
  paused,
  onRoundSuccess,
}) => {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const discRotRef = useRef(0);
  const pinsRef = useRef<number[]>([]);
  const flyingRef = useRef<{ start: number; duration: number } | null>(null);
  const lastTapRef = useRef(0);
  const lastFrameRef = useRef(0);
  const shakeEndRef = useRef(0);
  const flashEndRef = useRef(0);
  const glowRef = useRef(0);
  const successFiredRef = useRef(false);
  const onSuccessRef = useRef(onRoundSuccess);
  const pinsTargetRef = useRef(pinsTarget);
  const [, renderTick] = useState(0);

  onSuccessRef.current = onRoundSuccess;
  pinsTargetRef.current = pinsTarget;

  const bump = useCallback(() => renderTick((n) => n + 1), []);

  const [size, setSize] = useState(300);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setSize(Math.min(Math.max(w, 240), 340));
    });
    ro.observe(el);
    const w = el.clientWidth;
    setSize(Math.min(Math.max(w, 240), 340));
    return () => ro.disconnect();
  }, []);

  const resetRound = useCallback(() => {
    pinsRef.current = [];
    flyingRef.current = null;
    successFiredRef.current = false;
    const t = performance.now();
    shakeEndRef.current = t + 320;
    flashEndRef.current = t + 200;
    bump();
  }, [bump]);

  useEffect(() => {
    pinsRef.current = [];
    flyingRef.current = null;
    discRotRef.current = performance.now() * 0.0004;
    successFiredRef.current = false;
    lastFrameRef.current = performance.now();
    bump();
  }, [phase, pinsTarget, bump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    const drawFrame = (now: number) => {
      const docHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const prev = lastFrameRef.current;
      lastFrameRef.current = now;
      const dtSec = docHidden ? 0 : Math.min(0.055, prev ? (now - prev) / 1000 : 1 / 60);

      const S = size;
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(S * dpr);
      canvas.style.width = `${S}px`;
      canvas.style.height = `${S}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pinsPlaced = pinsRef.current.length;
      if (!paused && !docHidden) {
        const wobble = Math.sin(now / 1000 * 2) * 0.05;
        const phaseMul = phase === 2 ? 1.14 : 1;
        const speed = BASE_SPEED_RAD * phaseMul * (1 + pinsPlaced * 0.04);
        discRotRef.current += speed * dtSec + wobble * dtSec * 18;
      }

      const cx = S / 2;
      const cy = S / 2;
      const R = S * 0.36;
      const hubR = S * 0.12;

      const fly = flyingRef.current;
      if (fly && !docHidden) {
        const tFly = Math.min(1, (now - fly.start) / fly.duration);
        if (tFly >= 1) {
          flyingRef.current = null;
          const phiNew = attachPhi(discRotRef.current);
          const thresh = Math.max(0.045, BASE_THRESHOLD_RAD - pinsPlaced * 0.002);
          let hit = false;
          for (const p of pinsRef.current) {
            if (angularDistanceRad(phiNew, p) < thresh) {
              hit = true;
              break;
            }
          }
          if (hit) {
            resetRound();
          } else {
            pinsRef.current = [...pinsRef.current, phiNew];
            glowRef.current = now;
            bump();
            if (pinsRef.current.length >= pinsTarget && !successFiredRef.current) {
              successFiredRef.current = true;
              const deg = Math.round(normalizeDegrees(radToDeg(discRotRef.current)));
              queueMicrotask(() => onSuccessRef.current(deg));
            }
          }
        }
      }

      let shakePx = 0;
      if (now < shakeEndRef.current) {
        const left = shakeEndRef.current - now;
        shakePx = Math.sin(now * 0.12) * 7 * Math.min(1, left / 320);
      }
      let flashAlpha = 0;
      if (now < flashEndRef.current) {
        const left = flashEndRef.current - now;
        flashAlpha = Math.min(0.42, (left / 200) * 0.42);
      }

      const glowAge = now - glowRef.current;
      const glowBoost = glowAge < 600 ? 1 + 0.35 * (1 - glowAge / 600) + pinsPlaced * 0.04 : 1 + pinsPlaced * 0.04;

      ctx.clearRect(0, 0, S, S);

      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 60, 80, ${flashAlpha})`;
        ctx.fillRect(0, 0, S, S);
      }

      ctx.save();
      ctx.translate(cx + shakePx, cy);
      const g0 = ctx.createRadialGradient(0, 0, R * 0.15, 0, 0, R * 1.4);
      g0.addColorStop(0, `rgba(0, 209, 255, ${0.12 * glowBoost})`);
      g0.addColorStop(0.6, 'rgba(0, 209, 255, 0.04)');
      g0.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g0;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.4, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(cx + shakePx, cy);
      ctx.rotate(discRotRef.current);

      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TWO_PI);
      const discG = ctx.createRadialGradient(0, 0, hubR, 0, 0, R);
      discG.addColorStop(0, 'rgba(18, 28, 40, 0.98)');
      discG.addColorStop(0.65, 'rgba(10, 16, 28, 0.98)');
      discG.addColorStop(1, 'rgba(6, 10, 20, 0.98)');
      ctx.fillStyle = discG;
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 209, 255, ${0.35 + 0.15 * (glowBoost - 1)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const pinLen = R * 0.42;
      for (const phi of pinsRef.current) {
        drawPinLine(ctx, phi, R, hubR, pinLen, 1);
      }

      if (fly) {
        const tFly = Math.min(1, (now - fly.start) / fly.duration);
        const ease = 1 - (1 - tFly) * (1 - tFly);
        const phiFly = attachPhi(discRotRef.current);
        const px0 = Math.cos(phiFly) * (R + S * 0.12);
        const py0 = Math.sin(phiFly) * (R + S * 0.12);
        const px1 = Math.cos(phiFly) * (R - pinLen * 0.12);
        const py1 = Math.sin(phiFly) * (R - pinLen * 0.12);
        const px = px0 + (px1 - px0) * ease;
        const py = py0 + (py1 - py0) * ease;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(phiFly) * hubR * 1.05, Math.sin(phiFly) * hubR * 1.05);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 209, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, TWO_PI);
        ctx.fill();
      }

      ctx.restore();

      ctx.save();
      ctx.translate(cx + shakePx, cy);
      ctx.beginPath();
      ctx.arc(0, 0, hubR, 0, TWO_PI);
      const hubG = ctx.createRadialGradient(0, 0, 0, 0, 0, hubR);
      hubG.addColorStop(0, 'rgba(30, 44, 62, 1)');
      hubG.addColorStop(1, 'rgba(12, 18, 30, 1)');
      ctx.fillStyle = hubG;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 209, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx + shakePx, cy);
      ctx.strokeStyle = 'rgba(0, 209, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(WORLD_BOTTOM) * hubR * 1.15, Math.sin(WORLD_BOTTOM) * hubR * 1.15);
      ctx.lineTo(Math.cos(WORLD_BOTTOM) * (R + S * 0.08), Math.sin(WORLD_BOTTOM) * (R + S * 0.08));
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [size, paused, pinsTarget, phase, resetRound, bump]);

  const tryLaunch = useCallback(() => {
    if (paused || successFiredRef.current) return;
    const now = performance.now();
    if (now - lastTapRef.current < TAP_COOLDOWN_MS) return;
    if (flyingRef.current) return;
    if (pinsRef.current.length >= pinsTargetRef.current) return;
    lastTapRef.current = now;
    flyingRef.current = { start: now, duration: FLIGHT_MS };
  }, [paused]);

  const placed = pinsRef.current.length;
  const remaining = Math.max(0, pinsTarget - placed);

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: 340, touchAction: 'manipulation' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div
          style={{
            fontSize: Math.min(72, size * 0.22),
            fontWeight: 800,
            lineHeight: 1,
            color: '#fff',
            textShadow: '0 0 28px rgba(0, 209, 255, 0.45), 0 2px 12px rgba(0,0,0,0.5)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {remaining}
        </div>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(0, 209, 255, 0.85)',
            letterSpacing: 0.3,
          }}
        >
          {t('daily_pin_rotator.remaining', { count: remaining })}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t('daily_pin_rotator.game_aria')}
        onPointerDown={(e) => {
          e.preventDefault();
          tryLaunch();
        }}
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: '50%',
          cursor: paused ? 'default' : 'pointer',
          boxShadow: '0 0 36px rgba(0, 209, 255, 0.14), inset 0 0 50px rgba(0,0,0,0.35)',
        }}
      />
      <p
        style={{
          textAlign: 'center',
          margin: '12px 0 0',
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {t('daily_pin_rotator.tap_to_place')}
      </p>
    </div>
  );
};

function drawPinLine(
  ctx: CanvasRenderingContext2D,
  phi: number,
  R: number,
  hubR: number,
  pinLen: number,
  pulse: number
) {
  const px = Math.cos(phi) * (R - pinLen * 0.12);
  const py = Math.sin(phi) * (R - pinLen * 0.12);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.2;
  ctx.shadowColor = 'rgba(0, 209, 255, 0.45)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(Math.cos(phi) * hubR * 1.05, Math.sin(phi) * hubR * 1.05);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 209, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(px, py, 4.2 * pulse, 0, TWO_PI);
  ctx.fill();
}
