/**
 * M1SSION Agent — identity / intelligence metaphor (eye + device halo).
 */

import React, { useLayoutEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye } from 'lucide-react';

export interface FloatingAgentPillV3Props {
  mcpActive: boolean;
  badge: string;
  label: string;
  ariaLabel: string;
  onTap: () => void;
}

const AGENT_HUB_CENTER_MOTION = { x: '-50%', y: '-50%' } as const;

const DEBUG_AGENT_PAINT = import.meta.env.DEV;

function logAgentPaint(
  phase: 'mount' | 'raf' | 'tap',
  el: HTMLElement | null
): void {
  if (!DEBUG_AGENT_PAINT || !el) return;
  const rect = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  console.log('[AGENT DEBUG]', {
    phase,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    computedTransform: cs.transform,
    inlineTransform: el.style.transform,
  });
}

export function FloatingAgentPillV3({ mcpActive, badge, label, ariaLabel, onTap }: FloatingAgentPillV3Props) {
  const reduce = useReducedMotion();
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!DEBUG_AGENT_PAINT) return;
    const el = btnRef.current;
    logAgentPaint('mount', el);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => logAgentPaint('raf', btnRef.current));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /**
   * Same rail footprint + centering stack as ActionRadialHubPill / CommitRadialHubPill (embedded):
   * 72×72 shell → 200×200 stage centered with translate → hub absolute at 50%/50%.
   *
   * Centering uses Motion `x`/`y` (-50%) in `initial` + `animate` so Framer never overwrites CSS-only
   * translate on first paint when `animate` drives `boxShadow` (WKWebView / FM12).
   */
  return (
    <div
      data-m1-pill-layout-measure="agent"
      className="relative shrink-0 self-start overflow-visible"
      style={{
        width: 72,
        height: 72,
        pointerEvents: 'none',
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ width: 200, height: 200 }}
      >
        <div className="relative h-full w-full" style={{ pointerEvents: 'none' }}>
          <motion.button
            ref={btnRef}
            type="button"
            layout={false}
            aria-label={ariaLabel}
            initial={AGENT_HUB_CENTER_MOTION}
            onClick={() => {
              onTap();
              if (DEBUG_AGENT_PAINT) {
                requestAnimationFrame(() => logAgentPaint('tap', btnRef.current));
              }
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border"
            style={{
              borderColor: mcpActive ? 'rgba(167, 139, 250, 0.48)' : 'rgba(0, 209, 255, 0.22)',
              background: mcpActive
                ? 'radial-gradient(circle at 45% 35%, rgba(139, 92, 246, 0.28) 0%, rgba(10, 8, 22, 0.95) 62%)'
                : 'radial-gradient(circle at 45% 35%, rgba(0, 209, 255, 0.12) 0%, rgba(10, 12, 20, 0.94) 62%)',
              boxShadow: mcpActive
                ? '0 0 20px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            animate={
              reduce
                ? AGENT_HUB_CENTER_MOTION
                : {
                    ...AGENT_HUB_CENTER_MOTION,
                    boxShadow: mcpActive
                      ? [
                          '0 0 22px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                          '0 0 14px rgba(88, 28, 135, 0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
                          '0 0 22px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        ]
                      : [
                          '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                          '0 0 16px rgba(0, 209, 255, 0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
                          '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                        ],
                  }
            }
            transition={{ duration: mcpActive ? 2.8 : 4, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute -right-0.5 -top-0.5 z-10 max-w-[44px] truncate rounded-full border border-white/15 bg-black/55 px-1 py-0.5 text-[6px] font-bold text-white/90">
              {badge}
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.25) 100%)',
              }}
            >
              <Eye
                className="h-[18px] w-[18px] text-cyan-200/95"
                style={{
                  filter: mcpActive
                    ? 'drop-shadow(0 0 8px rgba(167,139,250,0.6))'
                    : 'drop-shadow(0 0 5px rgba(0,209,255,0.35))',
                }}
              />
            </div>
            <span
              className="mt-0.5 max-w-[60px] px-0.5 text-center text-[6.5px] font-semibold text-white/88"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {label}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
