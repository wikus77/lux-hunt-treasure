/**
 * Premium "GIOCA" CTA — fixed above BottomNav, opens Home play surface (same dim as radial hub).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { useHomePlaySurface } from '@/contexts/HomePlaySurfaceContext';
import { FLOATING_PILLS_V3_Z_INDEX } from '@/components/home/floatingPillsV3/floating-pills-v3';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import '@/styles/buzz/BuzzTronDisc.css';

/** Above floating pills layer, below BottomNavigation (10000). */
const GIOCA_Z = FLOATING_PILLS_V3_Z_INDEX + 80;

/** Leggibilità + glow breathing (UI); static when reduced motion. */
const GIOCA_LABEL_SHADOW_SOFT =
  '0 1px 2px rgba(0,0,0,0.92), 0 0 8px rgba(255,255,255,0.55), 0 0 16px rgba(255,180,180,0.5), 0 0 24px rgba(255,60,60,0.45)';
const GIOCA_LABEL_SHADOW_BRIGHT =
  '0 1px 2px rgba(0,0,0,0.92), 0 0 12px rgba(255,255,255,0.85), 0 0 22px rgba(255,210,210,0.75), 0 0 34px rgba(255,70,70,0.6)';

export const HomeGiocaCta: React.FC = () => {
  const { t } = useTranslation();
  const { playGateEnabled, surfaceActive, openSurface } = useHomePlaySurface();
  const reduce = useReducedMotion();

  const visible = playGateEnabled && !surfaceActive;

  const portalTarget = useMemo(() => (typeof document !== 'undefined' ? document.body : null), []);

  if (!portalTarget || !visible) return null;

  /** Tighter gap above BottomNav (88px tab bar + safe); was +14px — too high on device. */
  const bottomOffset = 'calc(88px + env(safe-area-inset-bottom, 0px) + 6px)';

  return createPortal(
    <motion.div
      className="pointer-events-none fixed left-0 right-0 flex justify-center px-5"
      style={{
        bottom: bottomOffset,
        zIndex: GIOCA_Z,
      }}
      initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 380, damping: 28, delay: 0.12 }
      }
    >
      <motion.button
        type="button"
        onClick={() => {
          buttonClickFeedback();
          openSurface();
        }}
        className="pointer-events-auto relative z-20 border-0 bg-transparent p-0"
        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        aria-label={t('home_gioca_cta')}
        whileTap={{ scale: 0.97 }}
      >
        {/* Stesso pattern visivo di BuzzMapButtonSecure: tron-disc + tron-disc-red (UI only). */}
        <div className="tron-disc tron-disc-red tron-disc--home-gioca">
          <div className="tron-disc-rotating">
            <div className="tron-led-ring" />
            <div className="tron-disc-dots" />
            <div className="tron-disc-dots-sides" />
          </div>
          <div className="tron-disc-content">
            <div className="flex flex-col items-center gap-0.5">
              <motion.div
                aria-hidden
                animate={
                  reduce
                    ? undefined
                    : {
                        filter: [
                          'drop-shadow(0 0 5px rgba(255,255,255,0.35)) drop-shadow(0 0 10px rgba(255,60,60,0.55))',
                          'drop-shadow(0 0 8px rgba(255,255,255,0.55)) drop-shadow(0 0 16px rgba(255,70,70,0.75))',
                          'drop-shadow(0 0 5px rgba(255,255,255,0.35)) drop-shadow(0 0 10px rgba(255,60,60,0.55))',
                        ],
                      }
                }
                transition={
                  reduce
                    ? undefined
                    : { duration: 2.75, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <Play
                  className="h-3.5 w-3.5 shrink-0 text-white"
                  style={{
                    filter: reduce
                      ? 'drop-shadow(0 0 6px rgba(255,255,255,0.45)) drop-shadow(0 0 12px rgba(255,55,55,0.65))'
                      : undefined,
                  }}
                />
              </motion.div>
              <motion.span
                className="font-extrabold"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 'clamp(11px, 2.85vw, 14px)',
                  letterSpacing: '0.08em',
                  color: '#ffffff',
                  textShadow: reduce ? GIOCA_LABEL_SHADOW_BRIGHT : GIOCA_LABEL_SHADOW_SOFT,
                }}
                animate={
                  reduce
                    ? undefined
                    : {
                        textShadow: [GIOCA_LABEL_SHADOW_SOFT, GIOCA_LABEL_SHADOW_BRIGHT, GIOCA_LABEL_SHADOW_SOFT],
                      }
                }
                transition={
                  reduce
                    ? undefined
                    : { duration: 2.75, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                {t('home_gioca_cta')}
              </motion.span>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>,
    portalTarget
  );
};
