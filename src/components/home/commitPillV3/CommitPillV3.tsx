/**
 * Commit Pill V3 — central fixed node (iOS Capacitor POC).
 * UI + openCommit() only; state from useTodayDailyState; portal for real viewport fixed.
 */

import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useDclLauncher } from '@/contexts/DclLauncherContext';
import { useTodayDailyState } from '@/hooks/useTodayDailyState';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import {
  COMMIT_PILL_V3_PORTAL_ID,
  COMMIT_PILL_V3_Z_INDEX,
} from './commitPillV3.config';

const BLOB_A = '48% 52% 55% 45% / 52% 48% 46% 54%';
const BLOB_B = '55% 45% 48% 52% / 46% 54% 52% 48%';

export const CommitPillV3: React.FC = () => {
  const { t } = useTranslation();
  const { commit_done } = useTodayDailyState();
  const { openCommit } = useDclLauncher();
  const reduce = useReducedMotion();
  const [tapPulse, setTapPulse] = useState(false);

  const handleTap = useCallback(() => {
    buttonClickFeedback();
    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 420);
    try {
      openCommit();
    } catch {
      /* safe no-op */
    }
  }, [openCommit]);

  const layer = (
    <div
      id={COMMIT_PILL_V3_PORTAL_ID}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: COMMIT_PILL_V3_Z_INDEX,
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        style={{
          bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="relative h-[72px] w-[72px] shrink-0">
          {/* Micro-expansion: one-shot ring on tap (operational feedback, not a menu) */}
          {tapPulse && (
            <motion.span
              className="pointer-events-none absolute inset-[-10px] rounded-full border-2 border-cyan-400/45"
              initial={{ opacity: 0.75, scale: 0.88 }}
              animate={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              aria-hidden
            />
          )}

        <motion.button
          type="button"
          aria-label={t('home_side_pill_commit')}
          onClick={handleTap}
          className="pointer-events-auto relative flex h-[72px] w-[72px] flex-col items-center justify-center border"
          style={{
            borderRadius: reduce ? '50%' : undefined,
            borderColor: commit_done ? 'rgba(52, 211, 153, 0.45)' : 'rgba(0, 209, 255, 0.4)',
            background: commit_done
              ? 'radial-gradient(ellipse at 45% 32%, rgba(52, 211, 153, 0.2) 0%, rgba(6, 20, 16, 0.95) 58%)'
              : 'radial-gradient(ellipse at 45% 32%, rgba(0, 209, 255, 0.2) 0%, rgba(6, 14, 26, 0.95) 58%)',
            boxShadow: commit_done
              ? '0 0 22px rgba(52, 211, 153, 0.28), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 0 20px rgba(0, 209, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
          animate={
            reduce
              ? { borderRadius: '50%' }
              : { borderRadius: [BLOB_A, BLOB_B, BLOB_A] }
          }
          transition={
            reduce
              ? {}
              : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }
          }
          whileTap={{ scale: 0.94 }}
        >
          <span
            className={`absolute -top-1 left-1/2 z-10 max-w-[120px] -translate-x-1/2 truncate rounded-full border px-2 py-0.5 text-[7px] font-bold shadow-md ${
              commit_done
                ? 'border-emerald-400/40 bg-emerald-950/90 text-emerald-100'
                : 'border-cyan-400/40 bg-black/75 text-cyan-100'
            }`}
          >
            {commit_done ? t('home_side_pill_commit_done') : t('home_float_badge_pending')}
          </span>
          {commit_done ? (
            <Check
              className="mt-2 h-7 w-7 text-emerald-300"
              style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.45))' }}
            />
          ) : (
            <Sparkles
              className="mt-2 h-7 w-7 text-cyan-300"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,209,255,0.45))' }}
            />
          )}
          <span
            className="mt-1 max-w-[100px] px-1 text-center text-[8px] font-extrabold uppercase tracking-wide text-white/92"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
          >
            {t('home_side_pill_commit')}
          </span>
        </motion.button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(layer, document.body);
};
