/**
 * GIOCA play modal V6 — readability-first, cyan/blue CTA, dynamic guidance on secondary tap.
 * @see index.css `#m1-floating-pills-v3-portal` — fixes sn-page .text-white → dark on this portal.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, Check, Clock, Swords } from 'lucide-react';
import { NextActionModalHeader } from '@/components/feedback/NextActionModalHeader';

const RM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_OUT: [number, number, number, number] = [0, 0, 0.55, 1];

const T_SCRIM_IN = 0.13;
const T_SCRIM_OUT = 0.15;

const T_TOP_IN = 0.26;
const Y_TOP = 72;

const D_BOTTOM_AFTER_TOP = 0.11;
const T_BOTTOM_IN = 0.3;
const Y_BOTTOM = 72;

const T_BOTTOM_OUT = 0.3;
const T_TOP_OUT = 0.26;
const D_SCRIM_AFTER_BOTTOM_AND_TOP = T_BOTTOM_OUT + T_TOP_OUT;

const D_CTA_AFTER_BOTTOM = 0.075;
const T_CTA_SETTLE = 0.24;

/** CTA: controlled cyan → blue (no green/violet drift) */
const CTA_BG =
  'linear-gradient(165deg, #0c4a6e 0%, #0369a1 24%, #0284c7 52%, #1d4ed8 82%, #172554 100%)';
const CTA_BORDER = 'rgba(255,255,255,0.42)';

/** Stronger dual pulse: wider glow swing, 1.78s (within 1.6–2.2s) */
const CTA_PULSE_DURATION = 1.78;
const CTA_GLOW_SOFT =
  'inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -5px 14px rgba(0,0,0,0.48), 0 0 0 1px rgba(56,189,248,0.35), 0 12px 32px rgba(0,0,0,0.55), 0 0 40px rgba(14,165,233,0.28), 0 0 72px rgba(37,99,235,0.18)';
const CTA_GLOW_STRONG =
  'inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -5px 14px rgba(0,0,0,0.42), 0 0 0 1px rgba(125,211,252,0.55), 0 14px 40px rgba(0,0,0,0.6), 0 0 64px rgba(56,189,248,0.52), 0 0 96px rgba(59,130,246,0.35)';
const CTA_GLOW_TAP =
  'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -4px 12px rgba(0,0,0,0.38), 0 0 0 1px rgba(224,242,254,0.65), 0 10px 36px rgba(0,0,0,0.5), 0 0 80px rgba(56,189,248,0.65), 0 0 120px rgba(96,165,250,0.4)';

export type PlayModalGiochaGuidanceTarget = 'mission' | 'time' | 'agent' | 'commit' | 'battle';

export type PlayModalGiochaLayersProps = {
  reduce: boolean;
  statusLine: string;
  onDismiss: () => void;
  onPrimary: () => void;
  onTime: () => void;
  onAgent: () => void;
  onCommit: () => void;
  onBattle: () => void;
  showCommitTile: boolean;
};

type TopProps = PlayModalGiochaLayersProps & { guidanceTarget: PlayModalGiochaGuidanceTarget };
type BottomProps = PlayModalGiochaLayersProps & {
  onSecondaryGuidance: (t: PlayModalGiochaGuidanceTarget) => void;
};

/** Holds guidance UI state; remount on modal close resets to mission. */
export const PlayModalGiochaModalGroup: React.FC<PlayModalGiochaLayersProps> = (props) => {
  const [guidanceTarget, setGuidanceTarget] = useState<PlayModalGiochaGuidanceTarget>('mission');

  return (
    <>
      <PlayModalGiochaScrim key="m1-giocha-scrim" reduce={props.reduce} />
      <PlayModalGiochaTopSheet key="m1-giocha-top" {...props} guidanceTarget={guidanceTarget} />
      <PlayModalGiochaBottomSheet key="m1-giocha-bottom" {...props} onSecondaryGuidance={setGuidanceTarget} />
    </>
  );
};

export const PlayModalGiochaScrim: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <motion.div
    aria-hidden
    className="pointer-events-none fixed inset-0 bg-black/[0.58]"
    style={{ zIndex: 2 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={
      reduce
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, transition: { delay: D_SCRIM_AFTER_BOTTOM_AND_TOP, duration: T_SCRIM_OUT, ease: EASE_OUT } }
    }
    transition={
      reduce
        ? { duration: 0.01 }
        : { duration: T_SCRIM_IN, ease: EASE_OUT }
    }
  />
);

const GUIDANCE_LEAD: React.CSSProperties = {
  color: '#f8fafc',
  textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,1)',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
};

const GUIDANCE_MISSION_MAIN: React.CSSProperties = {
  color: '#ecfdf5',
  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.35,
};

const GUIDANCE_HINT: React.CSSProperties = {
  color: '#e2e8f0',
  textShadow: '0 1px 3px rgba(0,0,0,0.85)',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.4,
};

const GUIDANCE_SECOND_TITLE: React.CSSProperties = {
  color: '#fef9c3',
  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
};

const GUIDANCE_SECOND_BODY: React.CSSProperties = {
  color: '#f0fdf4',
  textShadow: '0 1px 3px rgba(0,0,0,0.88)',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.4,
};

const GUIDANCE_SECOND_WHEN: React.CSSProperties = {
  color: '#cbd5e1',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.35,
};

export const PlayModalGiochaTopSheet: React.FC<TopProps> = ({ reduce, onDismiss, statusLine, guidanceTarget }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 px-2"
      style={{
        zIndex: 3,
        paddingTop: 'max(6px, env(safe-area-inset-top, 0px))',
        filter: reduce ? undefined : 'drop-shadow(0 20px 40px rgba(0,0,0,0.58))',
      }}
      initial={reduce ? false : { opacity: 0, y: -Y_TOP }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.01 } }
          : {
              opacity: 0,
              y: -Y_TOP,
              transition: { delay: T_BOTTOM_OUT, duration: T_TOP_OUT, ease: RM_EASE },
            }
      }
      transition={
        reduce
          ? { duration: 0.01 }
          : { duration: T_TOP_IN, ease: RM_EASE }
      }
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[100vw]" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <NextActionModalHeader
          onClose={onDismiss}
          wrapWithMotion={false}
          headingId="play-modal-giocha-title"
          omitStackingZIndex
          subtitleContrastBoost
        />
        <div
          className="m1-folder-glass--graphite relative overflow-hidden rounded-b-[20px] border-t border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{ marginTop: -1 }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/35 via-emerald-400/40 to-amber-500/35 opacity-90"
            aria-hidden
          />
          <div className="relative px-4 pb-4 pt-3.5">
            <p style={GUIDANCE_LEAD}>{t('play_modal_giocha_guidance_lead')}</p>

            {guidanceTarget === 'mission' ? (
              <>
                <p className="mt-2 line-clamp-3" style={GUIDANCE_MISSION_MAIN}>
                  {statusLine}
                </p>
                <p className="mt-2" style={GUIDANCE_HINT}>
                  {t('play_modal_giocha_guidance_hint')}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 line-clamp-2" style={GUIDANCE_SECOND_TITLE}>
                  {t(`play_modal_giocha_guide_${guidanceTarget}_title`)}
                </p>
                <p className="mt-1.5 line-clamp-4" style={GUIDANCE_SECOND_BODY}>
                  {t(`play_modal_giocha_guide_${guidanceTarget}_body`)}
                </p>
                <p className="mt-2 line-clamp-3" style={GUIDANCE_SECOND_WHEN}>
                  {t(`play_modal_giocha_guide_${guidanceTarget}_when`)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PlayModalGiochaBottomSheet: React.FC<BottomProps> = ({
  reduce,
  onPrimary,
  onTime,
  onAgent,
  onCommit,
  onBattle,
  showCommitTile,
  onSecondaryGuidance,
}) => {
  const { t } = useTranslation();
  const ctaEnterDelay = reduce ? 0 : D_BOTTOM_AFTER_TOP + T_BOTTOM_IN + D_CTA_AFTER_BOTTOM;

  const wrapSecondary = (target: PlayModalGiochaGuidanceTarget, fn: () => void) => () => {
    onSecondaryGuidance(target);
    fn();
  };

  const QUICK_DECK: React.CSSProperties = {
    color: '#fef3c7',
    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textAlign: 'center',
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-modal-giocha-title"
      className="pointer-events-none fixed bottom-0 left-0 right-0 px-2 pb-2"
      style={{
        zIndex: 4,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        filter: reduce ? undefined : 'drop-shadow(0 -22px 48px rgba(0,0,0,0.65))',
      }}
      initial={reduce ? false : { opacity: 0, y: Y_BOTTOM }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.01 } }
          : {
              opacity: 0,
              y: Y_BOTTOM,
              transition: { duration: T_BOTTOM_OUT, ease: RM_EASE },
            }
      }
      transition={
        reduce
          ? { duration: 0.01 }
          : { delay: D_BOTTOM_AFTER_TOP, duration: T_BOTTOM_IN, ease: RM_EASE }
      }
    >
      <motion.div
        className="pointer-events-auto relative mx-auto w-full max-w-[100vw] overflow-hidden rounded-t-[1.85rem]"
        initial={reduce ? false : { scale: 0.987, opacity: 0.96 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0.01 }
            : { delay: D_BOTTOM_AFTER_TOP + T_BOTTOM_IN * 0.35, duration: 0.24, ease: RM_EASE }
        }
        style={{
          WebkitTapHighlightColor: 'transparent',
          background:
            'radial-gradient(90% 50% at 50% 0%, rgba(56,189,248,0.1) 0%, transparent 50%), radial-gradient(70% 40% at 50% 100%, rgba(30,58,138,0.12) 0%, transparent 55%), linear-gradient(180deg, #1a2332 0%, #111827 40%, #0b0f18 100%)',
          boxShadow:
            '0 -24px 72px rgba(0,0,0,0.78), 0 -2px 0 rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 0 0 1px rgba(255,255,255,0.04)',
          minHeight: 'min(52vh, 440px)',
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[12%] h-48 w-[90%] -translate-x-1/2 rounded-full opacity-[0.5] blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(37,99,235,0.1) 40%, transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden
        />

        <div className="relative px-4 pb-5 pt-6">
          <div className="relative">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                reduce
                  ? { duration: 0.01 }
                  : { delay: ctaEnterDelay, duration: T_CTA_SETTLE, ease: RM_EASE }
              }
            >
              <motion.button
                type="button"
                aria-label={t('play_modal_primary_cta')}
                onClick={onPrimary}
                className="relative z-[1] flex w-full items-center justify-center overflow-hidden rounded-[22px] px-5 py-5 text-[18px] font-extrabold leading-tight tracking-wide"
                style={{
                  minHeight: 72,
                  background: CTA_BG,
                  border: `2px solid ${CTA_BORDER}`,
                  color: '#ffffff',
                  textShadow: '0 2px 5px rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.35)',
                  boxShadow: CTA_GLOW_SOFT,
                  WebkitFontSmoothing: 'antialiased',
                }}
                whileTap={
                  reduce
                    ? { scale: 0.98 }
                    : { scale: 0.968, boxShadow: CTA_GLOW_TAP, transition: { duration: 0.11, ease: 'easeOut' } }
                }
                animate={
                  reduce
                    ? { boxShadow: CTA_GLOW_SOFT }
                    : { boxShadow: [CTA_GLOW_SOFT, CTA_GLOW_STRONG, CTA_GLOW_SOFT] }
                }
                transition={
                  reduce
                    ? { duration: 0.01 }
                    : { boxShadow: { duration: CTA_PULSE_DURATION, repeat: Infinity, ease: 'easeInOut' } }
                }
              >
                {!reduce && (
                  <>
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[20px]"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 65%)',
                      }}
                      animate={{ opacity: [0.28, 0.5, 0.28] }}
                      transition={{ duration: CTA_PULSE_DURATION, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]"
                    >
                      <motion.div
                        className="absolute left-0 top-0 h-full w-[55%]"
                        style={{
                          background:
                            'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 45%, transparent 78%)',
                        }}
                        initial={false}
                        animate={{ x: ['-40%', '220%'] }}
                        transition={{
                          duration: CTA_PULSE_DURATION,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          repeatDelay: 0.25,
                        }}
                      />
                    </motion.div>
                  </>
                )}
                <span className="relative z-[2]" style={{ color: '#ffffff' }}>
                  {t('play_modal_primary_cta')}
                </span>
              </motion.button>
            </motion.div>
          </div>

          <p className="mb-3 mt-6" style={QUICK_DECK}>
            {t('play_modal_giocha_quick_deck')}
          </p>
          <SecondaryStrip
            showCommitTile={showCommitTile}
            onTime={wrapSecondary('time', onTime)}
            onAgent={wrapSecondary('agent', onAgent)}
            onCommit={wrapSecondary('commit', onCommit)}
            onBattle={wrapSecondary('battle', onBattle)}
            labels={{
              time: t('home_side_pill_time'),
              agent: t('home_side_pill_agent'),
              commit: t('home_side_pill_commit'),
              battle: t('home_side_pill_battle'),
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const SECONDARY_LABEL: React.CSSProperties = {
  color: '#fafafa',
  textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.55)',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.25,
  WebkitFontSmoothing: 'antialiased',
};

function SecondaryIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-center text-[#ecfeff]" style={{ color: '#ecfeff' }}>
      {children}
    </span>
  );
}

const SecondaryStrip: React.FC<{
  showCommitTile: boolean;
  onTime: () => void;
  onAgent: () => void;
  onCommit: () => void;
  onBattle: () => void;
  labels: { time: string; agent: string; commit: string; battle: string };
}> = ({ showCommitTile, onTime, onAgent, onCommit, onBattle, labels }) => {
  const items = showCommitTile
    ? [
        {
          key: 't',
          icon: (
            <SecondaryIcon>
              <Clock className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.time,
          onClick: onTime,
        },
        {
          key: 'a',
          icon: (
            <SecondaryIcon>
              <Bot className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.agent,
          onClick: onAgent,
        },
        {
          key: 'c',
          icon: (
            <SecondaryIcon>
              <Check className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.commit,
          onClick: onCommit,
        },
        {
          key: 'b',
          icon: (
            <SecondaryIcon>
              <Swords className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.battle,
          onClick: onBattle,
        },
      ]
    : [
        {
          key: 't',
          icon: (
            <SecondaryIcon>
              <Clock className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.time,
          onClick: onTime,
        },
        {
          key: 'a',
          icon: (
            <SecondaryIcon>
              <Bot className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.agent,
          onClick: onAgent,
        },
        {
          key: 'b',
          icon: (
            <SecondaryIcon>
              <Swords className="h-[22px] w-[22px]" strokeWidth={2.35} />
            </SecondaryIcon>
          ),
          label: labels.battle,
          onClick: onBattle,
        },
      ];

  return (
    <div className={`grid gap-3 ${items.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          aria-label={it.label}
          onClick={it.onClick}
          className="group relative flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl px-2 py-2.5 active:scale-[0.97]"
          style={{
            WebkitTapHighlightColor: 'transparent',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.16), 0 8px 24px rgba(0,0,0,0.42), 0 0 0 1px rgba(0,0,0,0.3), 0 0 20px rgba(56,189,248,0.06)',
          }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform group-active:scale-95"
            style={{
              border: '1px solid rgba(147,197,253,0.45)',
              background: 'linear-gradient(165deg, rgba(56,189,248,0.28) 0%, rgba(30,64,175,0.22) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(56,189,248,0.2)',
            }}
          >
            {it.icon}
          </span>
          <span className="line-clamp-2 px-1 text-center tracking-tight" style={SECONDARY_LABEL}>
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
};
