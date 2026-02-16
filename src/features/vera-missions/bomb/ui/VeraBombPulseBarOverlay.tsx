/**
 * VERA BOMB - Pulse Bar overlay after win/lose
 * Shows delta PE with animated bar + CTA CONTINUA
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VeraBombPulseBarOverlayProps {
  deltaPe: number;
  isWin: boolean;
  onContinue: () => void;
  /** i18n label for CONTINUA button */
  ctaLabel: string;
}

export const VeraBombPulseBarOverlay: React.FC<VeraBombPulseBarOverlayProps> = ({
  deltaPe,
  isWin,
  onContinue,
  ctaLabel,
}) => {
  const [displayDelta, setDisplayDelta] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const step = isWin ? 1 : -1;
    const target = deltaPe;
    const duration = 600;
    const steps = Math.min(Math.abs(target), 30);
    const interval = duration / steps;
    let current = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      current += step * (Math.abs(target) / steps);
      if ((isWin && current >= target) || (!isWin && current <= target)) {
        setDisplayDelta(target);
        clearInterval(id);
      } else {
        setDisplayDelta(Math.round(current));
      }
    }, interval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [deltaPe, isWin]);

  const color = isWin ? '#00FF88' : '#FF4444';
  const barPercent = Math.min(100, Math.abs(deltaPe) * 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        marginTop: '24px',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        border: `1px solid ${color}40`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>
          PE
        </span>
        <motion.span
          key={displayDelta}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          style={{
            color,
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'monospace',
          }}
        >
          {displayDelta >= 0 ? '+' : ''}{displayDelta}
        </motion.span>
      </div>
      <div
        style={{
          height: '10px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '5px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: color,
            borderRadius: '5px',
            boxShadow: `0 0 16px ${color}80`,
          }}
        />
      </div>
      <motion.button
        type="button"
        onClick={onContinue}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: `linear-gradient(90deg, ${color}, ${isWin ? '#00CC6A' : '#CC3333'})`,
          border: 'none',
          borderRadius: '12px',
          color: isWin ? '#000' : '#FFF',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {ctaLabel}
      </motion.button>
    </motion.div>
  );
};
