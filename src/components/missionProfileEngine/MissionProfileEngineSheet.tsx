/**
 * MISSION PROFILE ENGINE™ — Fullscreen-capable bottom sheet (iOS style).
 * States: Idle → Scan (10–40s) → Report. Safe area, close, abort.
 * Drag-to-dismiss (when scroll at top), sticky header, no handle line.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { MissionProfileEngineScan } from './MissionProfileEngineScan';
import { MissionProfileEngineRing } from './MissionProfileEngineRing';
import { buildReportFromSnapshot, type MPESnapshot, type MPEDelta } from '@/lib/missionProfileEngine/buildReportFromSnapshot';
import type { AgentPerformanceReport } from '@/lib/missionProfileEngine/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const DRAG_CLOSE_THRESHOLD_PX = 140;
const VELOCITY_CLOSE_THRESHOLD = 900;
const SPRING = { type: 'spring' as const, damping: 28, stiffness: 300 };

const hapticImpact = async (style: 'light' | 'medium' | 'heavy') => {
  try {
    const { Haptics } = await import('@capacitor/haptics');
    if (Haptics?.impact) await Haptics.impact({ style });
  } catch {
    // no-op
  }
};

type SheetState = 'idle' | 'scan' | 'report';

interface MissionProfileEngineSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionProfileEngineSheet: React.FC<MissionProfileEngineSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [state, setState] = useState<SheetState>('idle');
  const [report, setReport] = useState<AgentPerformanceReport | null>(null);
  const [abortMessage, setAbortMessage] = useState<string | null>(null);
  const dataComplexity = 0.4;

  const sheetY = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);
  const isDragging = useRef(false);

  const backdropOpacity = useTransform(sheetY, [0, DRAG_CLOSE_THRESHOLD_PX], [1, 0]);

  useLayoutEffect(() => {
    if (isOpen) {
      const height = typeof window !== 'undefined' ? window.innerHeight : 600;
      sheetY.set(height);
      animate(sheetY, 0, SPRING);
    }
  }, [isOpen, sheetY]);

  const handleStartScan = useCallback(async () => {
    setAbortMessage(null);
    setReport(null);
    const { data, error } = await supabase.rpc('mpe_check_and_consume_run', { p_is_paid: false });
    if (error) {
      toast.error(t('mission_profile_engine_scan_error'));
      return;
    }
    const allowed = (data as { allowed?: boolean })?.allowed;
    if (!allowed) {
      toast.info(t('mission_profile_engine_one_free_per_day'));
      return;
    }
    setState('scan');
  }, [t]);

  const handleScanComplete = useCallback(async () => {
    const { data: snapshotData, error: snapErr } = await supabase.rpc('mpe_get_inputs_snapshot');
    const snapshot = (snapshotData as MPESnapshot) ?? {};
    if (snapErr) {
      snapshot.error = snapErr.message;
    }
    const reportFromSnapshot = buildReportFromSnapshot(snapshot, null, user?.id);
    const payload = {
      ...snapshot,
      bars: reportFromSnapshot.bars,
      percentage: reportFromSnapshot.percentage,
    };
    const scoreTotal = reportFromSnapshot.percentage;
    await supabase.rpc('mpe_save_daily_snapshot', {
      p_payload: payload,
      p_score_total: scoreTotal,
    });
    const { data: deltaData } = await supabase.rpc('mpe_get_daily_delta');
    const delta = (deltaData as MPEDelta) ?? null;
    const r = buildReportFromSnapshot(snapshot, delta, user?.id);
    setReport(r);
    setState('report');
    const intensity = r.percentage >= 80 ? 'heavy' : r.percentage >= 51 ? 'medium' : 'light';
    hapticImpact(intensity);
  }, [user?.id]);

  const handleAbortScan = useCallback(() => {
    setState('idle');
    setAbortMessage(t('mission_profile_engine_scan_aborted'));
    setTimeout(() => setAbortMessage(null), 2000);
  }, [t]);

  const closeAndUnmount = useCallback(() => {
    setState('idle');
    setReport(null);
    setAbortMessage(null);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 600;
    animate(sheetY, height, { ...SPRING, onComplete: closeAndUnmount });
  }, [sheetY, closeAndUnmount]);

  const handleClose = requestClose;

  const goToBuzzMap = useCallback(() => {
    setLocation('/map-3d-tiler');
    requestClose();
  }, [setLocation, requestClose]);

  const handleExtraAnalysis = useCallback(async () => {
    const { data, error } = await supabase.rpc('mpe_check_and_consume_run', { p_is_paid: true });
    if (error) {
      toast.error(t('mission_profile_engine_scan_error'));
      return;
    }
    const allowed = (data as { allowed?: boolean; reason?: string })?.allowed;
    if (!allowed) {
      const reason = (data as { reason?: string })?.reason;
      if (reason === 'insufficient_m1u') {
        toast.error(t('mission_profile_engine_extra_insufficient_m1u'));
      } else {
        toast.info(t('mission_profile_engine_one_free_per_day'));
      }
      return;
    }
    setAbortMessage(null);
    setReport(null);
    setState('scan');
  }, [t]);


  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isOpen) return;
      dragStartY.current = e.clientY;
      dragStartScrollTop.current = scrollRef.current?.scrollTop ?? 0;
      isDragging.current = false;
    },
    [isOpen]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isOpen) return;
      const allowedButtons = e.buttons === 1 || e.buttons === 0;
      if (!allowedButtons && !isDragging.current) return;
      const scrollTop = scrollRef.current?.scrollTop ?? 0;
      if (!isDragging.current && dragStartScrollTop.current > 0 && scrollTop > 0) return;
      const dy = e.clientY - dragStartY.current;
      if (dy > 10 || isDragging.current) {
        isDragging.current = true;
        sheetY.set(Math.max(0, dy));
      }
    },
    [isOpen, sheetY]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isOpen) return;
      if (!isDragging.current) return;
      const y = sheetY.get();
      const velocityY = (e as unknown as { velocityY?: number }).velocityY ?? 0;
      if (y > DRAG_CLOSE_THRESHOLD_PX || velocityY > VELOCITY_CLOSE_THRESHOLD) {
        const height = typeof window !== 'undefined' ? window.innerHeight : 600;
        animate(sheetY, height, { ...SPRING, onComplete: closeAndUnmount });
      } else {
        animate(sheetY, 0, SPRING);
      }
      isDragging.current = false;
    },
    [isOpen, sheetY, closeAndUnmount]
  );

  const onPointerLeave = useCallback(() => {
    if (isDragging.current) {
      const y = sheetY.get();
      if (y > DRAG_CLOSE_THRESHOLD_PX) {
        const height = typeof window !== 'undefined' ? window.innerHeight : 600;
        animate(sheetY, height, { ...SPRING, onComplete: closeAndUnmount });
      } else {
        animate(sheetY, 0, SPRING);
      }
      isDragging.current = false;
    }
  }, [sheetY, closeAndUnmount]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[2000] bg-black/50"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          opacity: backdropOpacity,
        }}
        onClick={handleClose}
        aria-hidden
      />
      <motion.div
        data-m1-mpe-sheet="true"
        style={{
          y: sheetY,
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
        className="fixed left-0 right-0 bottom-0 z-[2001] flex max-h-[92vh] flex-col rounded-t-3xl bg-[#0c1426] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerLeave}
        onPointerLeave={onPointerLeave}
      >
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 bg-[#0c1426] px-4 pt-1 pb-2">
          <h2 className="min-w-0 flex-1 text-left text-lg font-bold text-white drop-shadow-sm">
            {t('mission_profile_engine_sheet_title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-2"
              >
                <p className="text-center text-sm text-white/90">
                  {t('mission_profile_engine_sheet_subtitle')}
                </p>
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="w-full max-w-xs rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-white shadow-lg active:scale-[0.98]"
                >
                  {t('mission_profile_engine_cta_scan')}
                </button>
                <p className="text-xs text-white/75">{t('mission_profile_engine_one_free_per_day')}</p>
                <button
                  type="button"
                  onClick={handleExtraAnalysis}
                  className="text-sm text-white/80 underline hover:text-white"
                >
                  {t('mission_profile_engine_extra_analysis')}
                </button>
                {abortMessage && (
                  <p className="text-xs text-amber-400">{abortMessage}</p>
                )}
              </motion.div>
            )}

            {state === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-2"
              >
                <MissionProfileEngineScan
                  dataComplexity={dataComplexity}
                  onComplete={handleScanComplete}
                  onAbort={handleAbortScan}
                />
              </motion.div>
            )}

            {state === 'report' && report && (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-4"
              >
                <MissionProfileEngineRing percentage={report.percentage} size={200} strokeWidth={12} />
                <p className="text-center font-medium text-white drop-shadow-sm">{t(report.stateLabelKey)}</p>
                <p className="text-sm text-white/90">
                  {report.dailyDelta >= 0
                    ? t('mission_profile_engine_delta_positive', { delta: report.dailyDelta })
                    : t('mission_profile_engine_delta_negative', { delta: Math.abs(report.dailyDelta) })}
                </p>
                <p className="text-xs text-white/80">{t(report.confidenceLabelKey)}</p>
                <p className="text-center text-xs text-white/70 italic">{t(report.interferenceLineKey)}</p>

                <div className="grid w-full max-w-sm grid-cols-2 gap-2">
                  {(['intelligence', 'geo', 'discipline', 'operational'] as const).map((k) => (
                    <div key={k} className="rounded-lg bg-white/5 p-2">
                      <div className="mb-1 text-xs text-white/90 capitalize">{t(`mission_profile_engine_bar_${k}`)}</div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full bg-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${report.bars[k] * 100}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full max-w-sm rounded-xl bg-white/5 p-4">
                  <div className="mb-1 text-xs font-medium text-cyan-400">{t('mission_profile_engine_priority_action')}</div>
                  <p className="text-sm text-white">{t(report.priorityAction.labelKey)}</p>
                  <p className="mt-1 text-xs text-white/80">
                    {t('mission_profile_engine_expected_delta', {
                      min: report.priorityAction.expectedDeltaRange[0],
                      max: report.priorityAction.expectedDeltaRange[1],
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToBuzzMap}
                  className="w-full max-w-xs rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-6 py-3 font-medium text-cyan-400"
                >
                  {t('mission_profile_engine_cta_buzz_map')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};
