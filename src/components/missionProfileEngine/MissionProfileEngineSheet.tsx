/**
 * MISSION PROFILE ENGINE™ — Fullscreen-capable bottom sheet (iOS style).
 * States: Idle → Scan (10–40s) → Report. Safe area, close, abort.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { MissionProfileEngineScan } from './MissionProfileEngineScan';
import { MissionProfileEngineRing } from './MissionProfileEngineRing';
import { getFakeReport } from '@/lib/missionProfileEngine/fakeReport';
import type { AgentPerformanceReport } from '@/lib/missionProfileEngine/types';

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
  const [, setLocation] = useLocation();
  const [state, setState] = useState<SheetState>('idle');
  const [report, setReport] = useState<AgentPerformanceReport | null>(null);
  const [abortMessage, setAbortMessage] = useState<string | null>(null);
  const dataComplexity = 0.4;

  const handleStartScan = useCallback(() => {
    setAbortMessage(null);
    setReport(null);
    setState('scan');
  }, []);

  const handleScanComplete = useCallback(() => {
    const r = getFakeReport();
    setReport(r);
    setState('report');
    const intensity = r.percentage >= 80 ? 'heavy' : r.percentage >= 51 ? 'medium' : 'light';
    hapticImpact(intensity);
  }, []);

  const handleAbortScan = useCallback(() => {
    setState('idle');
    setAbortMessage(t('mission_profile_engine_scan_aborted'));
    setTimeout(() => setAbortMessage(null), 2000);
  }, [t]);

  const handleClose = useCallback(() => {
    setState('idle');
    setReport(null);
    setAbortMessage(null);
    onClose();
  }, [onClose]);

  const goToBuzzMap = useCallback(() => {
    setLocation('/map-3d-tiler');
    handleClose();
  }, [setLocation, handleClose]);

  const handleExtraAnalysis = useCallback(() => {
    toast.info(t('mission_profile_engine_coming_soon'));
  }, [t]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] bg-black/50"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={handleClose}
        aria-hidden
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 right-0 bottom-0 z-[2001] flex max-h-[92vh] flex-col rounded-t-3xl bg-[#0c1426] shadow-2xl"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-2 pb-2">
          <div className="h-1 w-12 rounded-full bg-white/20" />
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-4"
              >
                <h2 className="text-center text-xl font-bold text-white drop-shadow-sm">
                  {t('mission_profile_engine_sheet_title')}
                </h2>
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
              >
                <h2 className="mb-2 text-center text-lg font-bold text-white drop-shadow-sm">
                  {t('mission_profile_engine_sheet_title')}
                </h2>
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
