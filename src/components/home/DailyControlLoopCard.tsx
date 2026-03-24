/**
 * DailyControlLoopCard — M1SSION DAILY CONTROL LOOP™ (Phase 1 minimal)
 * Unified daily checklist: Commit, Streak, Mission + 3/3 bonus.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useTodayDailyState, DAILY_BONUS_M1U_AMOUNT } from '@/hooks/useTodayDailyState';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import { hapticLight } from '@/utils/haptics';
import { toast } from 'sonner';
import { persistDclReminderState, scheduleDclEveningReminder } from '@/hooks/useDailyControlLoopReminder';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useDclLauncher } from '@/contexts/DclLauncherContext';
import { useLocation } from 'wouter';

const SCROLL_OPTIONS: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

function scrollToCommit() {
  document.getElementById('home-daily-commit')?.scrollIntoView(SCROLL_OPTIONS);
}

function scrollToStreak() {
  document.getElementById('home-daily-streak')?.scrollIntoView(SCROLL_OPTIONS);
}

function scrollToMission() {
  document.getElementById('home-daily-mission')?.scrollIntoView(SCROLL_OPTIONS);
}

const DCL_COMMIT_DONE = 'dcl-commit-done';
const DCL_MISSION_DONE = 'dcl-mission-done';

export const DailyControlLoopCard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUnifiedAuth();
  const {
    commit_done,
    streak_done,
    daily_mission_done,
    daily_completion_count,
    daily_bonus_claimed,
    can_claim_daily_bonus,
    weeklyClaimCount,
    loading,
    refetch,
    markBonusClaimed,
  } = useTodayDailyState();
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const m1uBalance = unitsData?.balance ?? 0;
  const { getCurrentBuzzCostM1U } = useBuzzCounter(user?.id);
  const [, navigate] = useLocation();
  const { openCommit, openStreak, openMission } = useDclLauncher();
  const buzzCostReal = getCurrentBuzzCostM1U();

  const [claiming, setClaiming] = useState(false);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState(DAILY_BONUS_M1U_AMOUNT);
  const reminderCleanupRef = useRef<(() => void) | void>(undefined);

  // Phase A: realtime — refetch when Commit / Streak / Mission complete
  useEffect(() => {
    const handler = () => { refetch(); };
    window.addEventListener(DCL_COMMIT_DONE, handler);
    window.addEventListener('streak-updated', handler);
    window.addEventListener(DCL_MISSION_DONE, handler);
    return () => {
      window.removeEventListener(DCL_COMMIT_DONE, handler);
      window.removeEventListener('streak-updated', handler);
      window.removeEventListener(DCL_MISSION_DONE, handler);
    };
  }, [refetch]);

  useEffect(() => {
    try {
      persistDclReminderState(daily_completion_count);
      if (reminderCleanupRef.current) {
        reminderCleanupRef.current();
        reminderCleanupRef.current = undefined;
      }
      if (daily_completion_count < 3) {
        reminderCleanupRef.current = scheduleDclEveningReminder(daily_completion_count);
      }
    } catch {
      // fail-safe: never throw from effect (iOS WKWebView / storage)
    }
    return () => {
      try {
        if (reminderCleanupRef.current) reminderCleanupRef.current();
      } catch {
        // ignore
      }
    };
  }, [daily_completion_count]);

  const handleClaimBonus = useCallback(async () => {
    if (!user || !can_claim_daily_bonus || claiming) return;
    setClaiming(true);
    buttonClickFeedback();
    try {
      const { data, error } = await supabase.rpc('claim_daily_control_loop_bonus');
      if (error) {
        toast.error(t('home_error_toast'));
        return;
      }
      const result = data as { ok?: boolean; already_claimed?: boolean; amount?: number } | null;
      if (result?.already_claimed) {
        markBonusClaimed();
        refetch();
        return;
      }
      if (result?.ok) {
        const amount = result?.amount ?? DAILY_BONUS_M1U_AMOUNT;
        setCelebrationAmount(amount);
        markBonusClaimed();
        setShowCelebrationOverlay(true);
        refetch();
      } else {
        toast.error(t('home_error_toast'));
      }
    } catch {
      toast.error(t('home_error_toast'));
    } finally {
      setClaiming(false);
    }
  }, [user, can_claim_daily_bonus, claiming, markBonusClaimed, refetch, t]);

  const handleGoCommit = useCallback(() => {
    buttonClickFeedback();
    if (!openCommit()) scrollToCommit();
  }, [openCommit]);

  const handleGoStreak = useCallback(() => {
    buttonClickFeedback();
    if (!openStreak()) scrollToStreak();
  }, [openStreak]);

  const handleGoMission = useCallback(() => {
    buttonClickFeedback();
    if (!openMission()) scrollToMission();
  }, [openMission]);

  const handleCloseCelebration = useCallback(() => {
    hapticLight();
    setShowCelebrationOverlay(false);
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          background: 'linear-gradient(160deg, rgba(8,12,20,0.75) 0%, rgba(10,16,28,0.70) 50%, rgba(8,12,20,0.75) 100%)',
          border: '1px solid rgba(0, 209, 255, 0.2)',
        }}
      >
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        <div className="mt-3 space-y-2">
          <div className="h-10 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const subtitleText =
    daily_completion_count === 3
      ? daily_bonus_claimed
        ? t('home_daily_control_loop_completed_all_done')
        : t('home_daily_control_loop_completed_bonus_ready')
      : daily_completion_count === 2
        ? t('home_daily_control_loop_missing_one')
        : daily_completion_count === 1
          ? t('home_daily_control_loop_completed_one')
          : t('home_daily_control_loop_day_not_started');

  /* Readability: same pattern as AppHome pill labels + iosReadabilityHotfix — high-opacity white + text-shadow on dark glass */
  const textShadowReadable = '0 1px 2px rgba(0,0,0,0.5)';
  const textShadowStrong = '0 1px 4px rgba(0,0,0,0.6)';
  const colorWhiteHigh = 'rgba(255,255,255,0.95)';
  const colorWhiteSub = 'rgba(255,255,255,0.92)';
  const colorCyanReadable = 'rgba(0,229,255,0.95)';

  const celebrationOverlay =
    typeof document !== 'undefined' &&
    showCelebrationOverlay &&
    createPortal(
      <AnimatePresence>
        <motion.div
          key="dcl-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(8, 12, 20, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'env(safe-area-inset-top, 0)',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
            paddingLeft: 'env(safe-area-inset-left, 0)',
            paddingRight: 'env(safe-area-inset-right, 0)',
          }}
          onClick={handleCloseCelebration}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{ textAlign: 'center', maxWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
              style={{
                width: 72,
                height: 72,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.35) 0%, rgba(34, 197, 94, 0.4) 100%)',
                border: '1px solid rgba(0, 209, 255, 0.4)',
                boxShadow: '0 0 24px rgba(0, 209, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.98)' }} />
            </motion.div>
            <p
              style={{
                color: 'rgba(255,255,255,0.98)',
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: 8,
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {t('dcl_celebration_title')}
            </p>
            <p
              style={{
                color: 'rgba(0, 229, 255, 0.98)',
                fontSize: '20px',
                fontWeight: 800,
                marginBottom: 6,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {t('dcl_celebration_m1u', { amount: celebrationAmount })}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontSize: '14px',
                marginBottom: 8,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {t('dcl_celebration_resources')}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: '13px',
                marginBottom: 20,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {m1uBalance + celebrationAmount >= buzzCostReal
                ? t('dcl_celebration_buzz_ready')
                : t('dcl_celebration_build')}
            </p>
            <button
              type="button"
              onClick={handleCloseCelebration}
              className="rounded-xl font-medium text-sm px-6 py-2.5 border transition-colors"
              style={{
                background: 'rgba(0, 209, 255, 0.18)',
                borderColor: 'rgba(0, 209, 255, 0.5)',
                color: 'rgba(255,255,255,0.95)',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {t('dcl_celebration_close')}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );

  return (
    <>
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
        background: 'linear-gradient(160deg, rgba(8,12,20,0.75) 0%, rgba(10,16,28,0.70) 50%, rgba(8,12,20,0.75) 100%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(0, 209, 255, 0.25)',
        boxShadow: '0 0 18px rgba(0, 209, 255, 0.12), 0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: colorWhiteHigh, textShadow: textShadowReadable }}
          >
            {t('home_daily_control_loop_title')}
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: colorWhiteSub, textShadow: textShadowReadable }}
          >
            {subtitleText}
          </p>
        </div>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: colorCyanReadable, textShadow: textShadowReadable }}
          aria-label={t('home_daily_control_loop_count', { current: daily_completion_count })}
        >
          {t('home_daily_control_loop_count', { current: daily_completion_count })}
        </span>
      </div>

      <ul className="space-y-2 mt-3">
        <Row
          label={t('home_daily_control_loop_commit')}
          done={commit_done}
          onGo={handleGoCommit}
          ctaKey="home_daily_control_loop_cta_commit"
          isNextAction={!commit_done}
          isNearCompletion={daily_completion_count === 2}
          textShadowReadable={textShadowReadable}
          colorWhiteHigh={colorWhiteHigh}
          colorCyanReadable={colorCyanReadable}
        />
        <Row
          label={t('home_daily_control_loop_streak')}
          done={streak_done}
          onGo={handleGoStreak}
          ctaKey="home_daily_control_loop_cta_streak"
          isNextAction={commit_done && !streak_done}
          isNearCompletion={daily_completion_count === 2}
          textShadowReadable={textShadowReadable}
          colorWhiteHigh={colorWhiteHigh}
          colorCyanReadable={colorCyanReadable}
        />
        <Row
          label={t('home_daily_control_loop_mission')}
          done={daily_mission_done}
          onGo={handleGoMission}
          ctaKey="home_daily_control_loop_cta_mission"
          isNextAction={commit_done && streak_done && !daily_mission_done}
          isNearCompletion={daily_completion_count === 2}
          textShadowReadable={textShadowReadable}
          colorWhiteHigh={colorWhiteHigh}
          colorCyanReadable={colorCyanReadable}
        />
      </ul>

      {daily_completion_count === 3 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          {daily_bonus_claimed ? (
            <p
              className="text-sm flex items-center gap-2"
              style={{ color: colorWhiteSub, textShadow: textShadowReadable }}
            >
              <Check className="w-4 h-4" style={{ color: colorCyanReadable }} />
              {t('home_daily_control_loop_bonus_claimed')}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleClaimBonus}
              disabled={claiming}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              style={{ color: colorCyanReadable, textShadow: textShadowStrong }}
            >
              {claiming ? '...' : t('home_daily_control_loop_claim_bonus')} +{DAILY_BONUS_M1U_AMOUNT} M1U
            </button>
          )}
        </div>
      )}

      {weeklyClaimCount >= 0 && (
        <p
          className="text-xs mt-3 pt-2 border-t border-white/10"
          style={{ color: colorWhiteSub, textShadow: textShadowReadable }}
        >
          {t('home_daily_control_loop_weekly', { current: weeklyClaimCount })}
        </p>
      )}

      {daily_completion_count === 3 && (
        <>
          <p
            className="text-xs mt-2"
            style={{ color: colorWhiteSub, textShadow: textShadowReadable }}
          >
            {m1uBalance >= buzzCostReal
              ? t('home_daily_control_loop_m1u_ready')
              : t('home_daily_control_loop_m1u_build')}
          </p>
          {m1uBalance >= buzzCostReal && (
            <button
              type="button"
              onClick={() => {
                buttonClickFeedback();
                navigate('/buzz');
              }}
              className="mt-2 w-full py-2 px-4 rounded-xl text-xs font-medium border border-cyan-400/50 bg-cyan-500/15 flex items-center justify-center gap-2"
              style={{ color: colorCyanReadable, textShadow: textShadowReadable }}
            >
              {t('home_daily_control_loop_go_buzz')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
    {celebrationOverlay}
    </>
  );
};

function Row({
  label,
  done,
  onGo,
  ctaKey,
  isNextAction,
  isNearCompletion,
  textShadowReadable,
  colorWhiteHigh,
  colorCyanReadable,
}: {
  label: string;
  done: boolean;
  onGo: () => void;
  ctaKey: string;
  isNextAction: boolean;
  isNearCompletion: boolean;
  textShadowReadable: string;
  colorWhiteHigh: string;
  colorCyanReadable: string;
}) {
  const { t } = useTranslation();
  const rowStyle: React.CSSProperties = {
    background: isNextAction ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
    border: isNextAction ? '1px solid rgba(0, 209, 255, 0.32)' : '1px solid transparent',
    boxShadow: isNextAction && isNearCompletion ? '0 0 14px rgba(0, 209, 255, 0.14)' : undefined,
  };
  return (
    <motion.li
      className="flex items-center justify-between py-2 px-3 rounded-xl"
      style={rowStyle}
      initial={false}
      transition={{ duration: 0.2 }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: colorWhiteHigh, textShadow: textShadowReadable }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span
              key="done"
              className="text-xs flex items-center gap-1"
              style={{ color: colorCyanReadable, textShadow: textShadowReadable }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Check className="w-3.5 h-3.5" />
              {t('home_daily_control_loop_done')}
            </motion.span>
          ) : (
            <motion.button
              key="cta"
              type="button"
              onClick={onGo}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: colorCyanReadable, textShadow: textShadowReadable }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {t(ctaKey)}
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
