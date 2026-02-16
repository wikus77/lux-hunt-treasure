/**
 * VERA BOMB - Real bomb device visual (SVG inline)
 * States: armed | disarmed | exploded
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import './bomb-visual.css';

export type BombVisualState = 'armed' | 'disarmed' | 'exploded';

interface BombDeviceVisualProps {
  state: BombVisualState;
  secondsLeft: number;
  isUrgent?: boolean;
  reducedMotion?: boolean;
}

export const BombDeviceVisual: React.FC<BombDeviceVisualProps> = ({
  state,
  secondsLeft,
  isUrgent = false,
  reducedMotion: reducedMotionProp,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setPrefersReducedMotion(mq.matches);
    const h = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const noMotion = reducedMotionProp ?? prefersReducedMotion;

  const cn = [
    'bomb-visual-root',
    state,
    state === 'armed' && isUrgent && 'urgent',
    noMotion && 'reduced-motion',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn} aria-hidden="true">
      {state === 'exploded' && (
        <>
          <div className="bomb-exploded-flash" />
          <div className="bomb-exploded-smoke" />
        </>
      )}
      <svg
        viewBox="0 0 120 160"
        width={120}
        height={160}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Bomb body - oval/capsule */}
        <ellipse
          cx="60"
          cy="100"
          rx="40"
          ry="50"
          fill={
            state === 'disarmed'
              ? '#1a3d2e'
              : state === 'exploded'
                ? '#2a2a2a'
                : '#2d2d2d'
          }
          stroke={state === 'disarmed' ? '#00FF88' : '#555'}
          strokeWidth="2"
        />
        {/* Top dome */}
        <ellipse
          cx="60"
          cy="52"
          rx="35"
          ry="28"
          fill={
            state === 'disarmed'
              ? '#1a3d2e'
              : state === 'exploded'
                ? '#2a2a2a'
                : '#333'
          }
          stroke={state === 'disarmed' ? '#00FF88' : '#555'}
          strokeWidth="2"
        />
        {/* Fuse / Wick */}
        {state !== 'exploded' && (
          <path
            d="M 58 24 Q 55 18 60 12 Q 65 18 62 24"
            stroke={state === 'armed' ? '#ff4444' : '#00FF88'}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* LED / Lamp (red when armed, green when disarmed) */}
        <circle
          cx="60"
          cy="70"
          r="8"
          fill={state === 'disarmed' ? '#00FF88' : '#FF4444'}
          className="bomb-lamp"
          style={{
            filter:
              state === 'disarmed'
                ? 'drop-shadow(0 0 6px #00FF88)'
                : undefined,
          }}
        />
        {/* Display - seconds */}
        <rect
          x="40"
          y="82"
          width="40"
          height="24"
          rx="4"
          fill="#0a0a0a"
          stroke="#444"
          strokeWidth="1"
        />
        <text
          x="60"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={state === 'disarmed' ? '#00FF88' : isUrgent ? '#FF4444' : '#fff'}
          fontSize="16"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {state === 'disarmed' ? 'SAFE' : String(secondsLeft)}
        </text>
      </svg>
    </div>
  );
};
