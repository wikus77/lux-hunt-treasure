/**
 * M1SSION™ Long Press Info Modal
 * NOTE-style fullscreen modal via MapPillFlipOverlay
 * Unificato con animazioni, design e leggibilità del modale NOTE
 *
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';

export interface InfoItem {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

interface LongPressInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  /** Per animazione scale-from-origin (NOTE-style) */
  originRect?: DOMRect | null;
  items?: InfoItem[];
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

export const LongPressInfoModal: React.FC<LongPressInfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = '#00D1FF',
  originRect = null,
  items,
  content,
  footer
}) => {
  const { t } = useTranslation();

  if (typeof document === 'undefined') return null;

  return (
    <MapPillFlipOverlay open={isOpen} originRect={originRect ?? null} onClose={onClose}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        {/* HEADER - NOTE-style (gradient, safe-area, X, title, subtitle) */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              onClick={onClose}
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {icon && (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </div>
              )}
              <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{title}</h1>
            </div>
            <div style={{ width: '40px' }} />
          </div>
          {subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* CONTENT - scrollable, high contrast */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {content ? (
            <div>{content}</div>
          ) : items && items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.icon}</span>}
                    <span className="text-sm text-white/90">{item.label}</span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: item.color || accentColor }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/70 text-sm">{t('mapLongPress.noInfo')}</p>
          )}

          {footer && (
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {footer}
            </div>
          )}
        </div>

        {/* Hint - NOTE-style */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 12px)',
            textAlign: 'center',
          }}
        >
          <p className="text-xs text-white/60">{t('mapLongPress.tapOutsideToClose')}</p>
        </div>
      </div>
    </MapPillFlipOverlay>
  );
};

export default LongPressInfoModal;
