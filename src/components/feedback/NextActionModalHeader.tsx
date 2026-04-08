/**
 * Shared header for “PROSSIMA AZIONE” / Next Action surfaces (NextActionContent + GIOCA play modal).
 * Visual structure matches the existing Next Action modal — do not redesign; only extract for reuse.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Target } from 'lucide-react';
import { useMissionStatus } from '@/hooks/useMissionStatus';

export type NextActionModalHeaderProps = {
  onClose: () => void;
  /** When false, panel is a plain div (parent supplies slide-in motion). Default: inner motion for legacy sheet. */
  wrapWithMotion?: boolean;
  /** Optional id on the title for aria-labelledby (e.g. GIOCA bottom sheet). */
  headingId?: string;
  /** Omit high z-index when embedding in another stacking context (e.g. floating pill portal). */
  omitStackingZIndex?: boolean;
  /** GIOCA / high-glare: slightly brighter subtitle for WKWebView + blur stacks. */
  subtitleContrastBoost?: boolean;
};

export const NextActionModalHeader: React.FC<NextActionModalHeaderProps> = ({
  onClose,
  wrapWithMotion = true,
  headingId,
  omitStackingZIndex = false,
  subtitleContrastBoost = false,
}) => {
  const { t } = useTranslation();
  const { missionStatus } = useMissionStatus();
  const daysRemaining = missionStatus?.daysRemaining ?? null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3;

  const panelStyle: React.CSSProperties = {
    paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
    paddingBottom: '16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderRadius: '16px 16px 0 0',
  };

  const inner = (
    <>
      <div className="absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('mission.popup.close')}
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

        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <Target style={{ width: '20px', height: '20px', color: '#22C55E' }} />
            <h1
              id={headingId}
              style={{
                color: isUrgent ? '#FF4444' : '#22C55E',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              🎯 {t('home_next_action_title')}
            </h1>
          </div>
          <p
            style={{
              color: subtitleContrastBoost ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)',
              fontSize: subtitleContrastBoost ? '14px' : '13px',
              marginTop: '4px',
              fontWeight: subtitleContrastBoost ? 600 : 500,
              textShadow: subtitleContrastBoost ? '0 1px 3px rgba(0,0,0,0.65)' : undefined,
            }}
          >
            {isUrgent
              ? `⚠️ ${t('home_next_action_subtitle_urgent', { count: daysRemaining })}`
              : t('home_next_action_subtitle')}
          </p>
        </div>

        <div style={{ width: '40px' }} />
      </div>
    </>
  );

  const outerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '100%',
    position: 'relative',
    padding: 0,
    borderRadius: '24px 24px 0 0',
    overflow: 'hidden',
    ...(omitStackingZIndex ? {} : { zIndex: 10002 }),
  };

  return (
    <div className="m1-folder-glass--graphite" style={outerStyle}>
      {wrapWithMotion ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="m1-panel relative"
          style={panelStyle}
        >
          {inner}
        </motion.div>
      ) : (
        <div className="m1-panel relative" style={panelStyle}>
          {inner}
        </div>
      )}
    </div>
  );
};
