/**
 * Phase 3 — Sunday Super Reward: full-screen modal, 60s reading, server-consumed once.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const READING_SECONDS = 60;

interface SundaySuperRewardModalProps {
  onClose: () => void;
}

export function SundaySuperRewardModal({ onClose }: SundaySuperRewardModalProps) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(READING_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      onClose();
    }
  }, [secondsLeft, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(180deg, #0a0e17 0%, #1a1f2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label={t('daily_engine.sunday_close')}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X style={{ width: '20px', height: '20px' }} />
      </button>

      <h2 style={{ color: '#FFD700', fontSize: '22px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
        {t('daily_engine.sunday_reward_title')}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: 1.5, textAlign: 'center', maxWidth: '320px' }}>
        {t('daily_engine.sunday_reward_body')}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '24px' }}>
        {secondsLeft > 0
          ? t('daily_engine.sunday_reading_time', { count: secondsLeft })
          : t('daily_engine.sunday_closing')}
      </p>
    </div>
  );
}
