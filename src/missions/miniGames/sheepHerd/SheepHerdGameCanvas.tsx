/**
 * Sheep Herd — Canvas 2D, touch-first (pointer events). Dog follows finger; sheep flee.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SheepHerdGameParams, RoundOutcomePayload } from './sheepHerdTypes';
import type { SheepAgent } from './sheepHerdTypes';
import { createSeededRng, len } from './sheepHerdUtils';
import {
  clampDog,
  getPenCenter,
  getPenRadius,
  sham,
  spawnSheepOutsidePen,
  stepFlock,
} from './sheepHerdPhysics';
import { drawDog, drawPenTarget, drawSheep, drawSheepSpeechBubble } from './sheepHerdDraw';

const SHEEP_BAA_DURATION_FRAMES = 52;
import { hapticSelection, isHapticsAvailable } from '@/utils/haptics';

export interface SheepHerdGameCanvasProps {
  params: SheepHerdGameParams;
  onRoundComplete: (payload: RoundOutcomePayload) => void;
  /** Increment to reset round (same params). */
  roundKey: number;
}

export const SheepHerdGameCanvas: React.FC<SheepHerdGameCanvasProps> = ({
  params,
  onRoundComplete,
  roundKey,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheepRef = useRef<SheepAgent[]>([]);
  const dogRef = useRef({ x: 0.5, y: 0.78 });
  const targetRef = useRef({ x: 0.5, y: 0.78 });
  const startMsRef = useRef(0);
  const endedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const pointerDownRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  const [hud, setHud] = useState({ remainSec: params.time_limit_sec, trapped: 0, lost: 0 });

  const cbRef = useRef(onRoundComplete);
  cbRef.current = onRoundComplete;

  useEffect(() => {
    endedRef.current = false;
    const rng = createSeededRng(`${params.seed}|${roundKey}`);
    const penR = getPenRadius(params);
    sheepRef.current = spawnSheepOutsidePen(params.sheep_total, rng, penR);
    dogRef.current = { x: 0.5, y: 0.78 };
    targetRef.current = { x: 0.5, y: 0.78 };
    startMsRef.current = Date.now();
    setHud({ remainSec: params.time_limit_sec, trapped: 0, lost: 0 });

    const finalize = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const sheep = sheepRef.current;
      const trapped = sheep.filter((s) => s.trapped).length;
      let lost = sheep.filter((s) => s.lost).length;
      const active = params.sheep_total - trapped - lost;
      if (active > 0) lost += active;
      const duration_ms = Math.max(0, Date.now() - startMsRef.current);
      cbRef.current({
        seed: params.seed,
        duration_ms,
        sheep_trapped: trapped,
        sheep_lost: lost,
        week_index: params.week_index,
      });
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2.5);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(280, rect.width);
      const h = Math.max(320, rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);

    const { cx, cy } = getPenCenter();
    let penPulseFrames = 0;
    let lostPulseFrames = 0;
    let greenSafe01 = 0;
    let prevTrapped = 0;
    let prevLost = 0;
    let dogAimRad = -Math.PI / 2;
    let simFrame = 0;
    let nextBaaFrames = 78;

    const loop = () => {
      if (endedRef.current) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 16 || h < 16) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const elapsed = (Date.now() - startMsRef.current) / 1000;
      const remain = Math.max(0, params.time_limit_sec - elapsed);

      const dg = dogRef.current;
      const tg = targetRef.current;
      dg.x += (tg.x - dg.x) * 0.52;
      dg.y += (tg.y - dg.y) * 0.52;

      const adx = tg.x - dg.x;
      const ady = tg.y - dg.y;
      if (len(adx, ady) > 0.003) {
        dogAimRad = Math.atan2(ady, adx);
      }

      const dt = 1 / 60;
      stepFlock(sheepRef.current, dg.x, dg.y, dt, params);

      const sheep = sheepRef.current;
      for (const s of sheep) {
        if (s.baaCooldownFrames > 0) s.baaCooldownFrames -= 1;
      }
      simFrame += 1;
      const freeList = sheep.filter((s) => !s.trapped && !s.lost);
      if (freeList.length > 0) {
        nextBaaFrames -= 1;
        if (nextBaaFrames <= 0) {
          const speakingN = freeList.filter((s) => s.baaDisplayFrames > 0).length;
          const eligible = freeList.filter((s) => s.baaCooldownFrames <= 0 && s.baaDisplayFrames <= 0);
          const rGate = sham(freeList[0], simFrame & 2047);
          if (speakingN < 2 && eligible.length > 0 && rGate > 0.36) {
            const pick = Math.floor(sham(freeList[0], (simFrame + 3) & 2047) * eligible.length);
            const es = eligible[Math.min(pick, eligible.length - 1)];
            es.baaDisplayFrames = SHEEP_BAA_DURATION_FRAMES;
            es.baaCooldownFrames = 200 + Math.floor(sham(freeList[0], (simFrame + 7) & 2047) * 240);
          }
          nextBaaFrames = 68 + Math.floor(sham(freeList[0], (simFrame + 13) & 2047) * 140);
        }
      }
      const trapped = sheep.filter((s) => s.trapped).length;
      const lost = sheep.filter((s) => s.lost).length;
      const doneAll = trapped + lost >= params.sheep_total;

      if (remain <= 0 && !doneAll) {
        for (const s of sheep) {
          if (!s.trapped && !s.lost) s.lost = true;
        }
      }

      const afterT = sheep.filter((s) => s.trapped).length;
      const afterL = sheep.filter((s) => s.lost).length;
      const doneNow = afterT + afterL >= params.sheep_total;

      if (afterT > prevTrapped) {
        penPulseFrames = 30;
        greenSafe01 = Math.min(1, greenSafe01 + 0.42 + 0.08 * (afterT - prevTrapped - 1));
        if (isHapticsAvailable()) {
          hapticSelection();
        }
      }
      if (afterL > prevLost) lostPulseFrames = 26;
      prevTrapped = afterT;
      prevLost = afterL;
      penPulseFrames = Math.max(0, penPulseFrames - 1);
      lostPulseFrames = Math.max(0, lostPulseFrames - 1);
      greenSafe01 = Math.max(0, greenSafe01 - 0.028);

      const nextSec = Math.ceil(remain);
      setHud((prev) => {
        if (prev.remainSec === nextSec && prev.trapped === afterT && prev.lost === afterL) return prev;
        return { remainSec: nextSec, trapped: afterT, lost: afterL };
      });

      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a0e16');
      g.addColorStop(1, '#141c2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const penRpx = getPenRadius(params) * Math.min(w, h);
      const pcx = cx * w;
      const pcy = cy * h;
      const penPulse01 = penPulseFrames > 0 ? penPulseFrames / 30 : 0;
      drawPenTarget(ctx, pcx, pcy, penRpx, penPulse01, greenSafe01);

      const lostPulse01 = lostPulseFrames > 0 ? lostPulseFrames / 26 : 0;
      if (lostPulse01 > 0) {
        const rg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.85);
        rg.addColorStop(0, 'rgba(255,60,80,0)');
        rg.addColorStop(1, `rgba(255,70,90,${0.14 * lostPulse01})`);
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, w, h);
      }

      const base = Math.min(w, h);
      const sheepR = base * 0.034;
      const dogR = base * 0.042;

      for (const s of sheep) {
        const sx = s.x * w;
        const sy = s.y * h;
        const mode = s.lost ? 'lost' : s.trapped ? 'trapped' : 'free';
        drawSheep(ctx, sx, sy, sheepR, mode, mode === 'free' ? s.hopAccent : 0);
      }

      for (const s of sheep) {
        if (!s.trapped && !s.lost && s.baaDisplayFrames > 0) {
          const sx = s.x * w;
          const sy = s.y * h;
          drawSheepSpeechBubble(
            ctx,
            sx,
            sy,
            sheepR,
            t('daily_sheep.baa'),
            s.baaDisplayFrames,
            SHEEP_BAA_DURATION_FRAMES
          );
        }
      }

      const dx = dg.x * w;
      const dy = dg.y * h;
      drawDog(ctx, dx, dy, dogR, dogAimRad);

      for (const s of sheep) {
        if (s.baaDisplayFrames > 0) s.baaDisplayFrames -= 1;
      }

      if (doneNow || remain <= 0) {
        finalize();
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [params, roundKey, t]);

  const normFromEvent = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    return clampDog(nx, ny);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerDownRef.current = true;
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* WKWebView: capture may fail in edge cases; move still tracked by pointer id */
    }
    const p = normFromEvent(e);
    if (p) targetRef.current = p;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const id = activePointerIdRef.current;
    if (id != null && e.pointerId !== id) return;
    if (!pointerDownRef.current) return;
    const p = normFromEvent(e);
    if (p) targetRef.current = p;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current != null && e.pointerId !== activePointerIdRef.current) return;
    pointerDownRef.current = false;
    activePointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ color: '#00D1FF', fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {t('daily_sheep.timer', { seconds: hud.remainSec })}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          {t('daily_sheep.trapped', { count: hud.trapped, total: params.sheep_total })}
        </span>
        <span style={{ color: 'rgba(255,160,170,0.95)', fontSize: 13 }}>
          {t('daily_sheep.lost', { count: hud.lost, max: params.max_lost })}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: '100%',
          height: 'min(52vh, 420px)',
          minHeight: 300,
          borderRadius: 16,
          border: '1px solid rgba(0, 209, 255, 0.35)',
          touchAction: 'none',
          display: 'block',
          background: '#0a0c12',
        }}
      />
    </div>
  );
};
