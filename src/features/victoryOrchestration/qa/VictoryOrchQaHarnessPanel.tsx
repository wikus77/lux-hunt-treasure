/**
 * Victory Orchestration QA harness — synthetic PE/M1U/rank presentation only (no server).
 * Mounted only when isVictoryOrchQaHarnessEnabled() is true.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  isVictoryOrchestrationConductorEnabled,
  isVictoryOrchQaHarnessEnabled,
} from '@/config/featureFlags';
import {
  emitM1UCreditEvent,
  M1U_CREDIT_EVENT,
  type M1UCreditEventDetail,
} from '@/features/m1u/m1uCreditEvent';
import { emitPECreditEvent } from '@/features/pulse/peCreditEvent';
import {
  PE_REWARD_OVERLAY_SETTLED_EVENT,
  RANK_GATE_RELEASE_AFTER_M1U_MS,
} from '@/features/victoryOrchestration/constants';
import { RankUpVideoModal } from '@/components/rank/RankUpVideoModal';
import { VICTORY_ORCH_QA_MOCK_RANK } from './victoryOrchQaMockRank';
import { qaOrchLog } from './victoryOrchQaHarnessLog';

const QA_M1U_AMOUNT = 7;
const QA_PE_AMOUNT = 11;
const DEBOUNCE_MS = 450;
const FULL_FALLBACK_RANK_MS = 9500;

type Scenario = 'm1u' | 'pe' | 'pe_m1u' | 'full';

function VictoryOrchQaHarnessPanelInner() {
  const orchOn = isVictoryOrchestrationConductorEnabled();
  const [minimized, setMinimized] = useState(false);
  const [mockRankOpen, setMockRankOpen] = useState(false);
  const debounceRef = useRef(false);
  const fullCleanupRef = useRef<(() => void) | null>(null);
  const fullFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankAfterM1uTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankShownRef = useRef(false);

  const clearFullTimers = useCallback(() => {
    if (fullFallbackTimerRef.current) {
      clearTimeout(fullFallbackTimerRef.current);
      fullFallbackTimerRef.current = null;
    }
    if (rankAfterM1uTimerRef.current) {
      clearTimeout(rankAfterM1uTimerRef.current);
      rankAfterM1uTimerRef.current = null;
    }
    if (fullCleanupRef.current) {
      fullCleanupRef.current();
      fullCleanupRef.current = null;
    }
  }, []);

  useEffect(() => () => clearFullTimers(), [clearFullTimers]);

  const openMockRank = useCallback((reason: string) => {
    if (rankShownRef.current) return;
    rankShownRef.current = true;
    qaOrchLog('rank_qa_show', { reason });
    setMockRankOpen(true);
  }, []);

  const runScenario = useCallback(
    (scenario: Scenario) => {
      if (debounceRef.current) {
        qaOrchLog('scenario_skipped_debounce', { scenario });
        return;
      }
      debounceRef.current = true;
      window.setTimeout(() => {
        debounceRef.current = false;
      }, DEBOUNCE_MS);

      clearFullTimers();
      rankShownRef.current = false;
      setMockRankOpen(false);

      qaOrchLog('scenario_start', { scenario, orchOn });

      if (scenario === 'm1u') {
        qaOrchLog('dispatch_m1u_raw', { amount: QA_M1U_AMOUNT, source: 'mission' });
        emitM1UCreditEvent(QA_M1U_AMOUNT, 'mission', {
          metadata: { qaHarness: true, scenario: 'm1u' },
        });
        qaOrchLog('scenario_end_m1u_only', { note: orchOn ? 'conductor may batch→replay' : 'legacy bubble' });
        return;
      }

      if (scenario === 'pe') {
        qaOrchLog('dispatch_pe_raw', { amount: QA_PE_AMOUNT, source: 'daily_mission' });
        emitPECreditEvent(QA_PE_AMOUNT, 'daily_mission', { qaHarness: true, scenario: 'pe' });
        qaOrchLog('scenario_end_pe_only', '');
        return;
      }

      if (scenario === 'pe_m1u') {
        qaOrchLog('dispatch_m1u_then_pe', { orchOn });
        emitM1UCreditEvent(QA_M1U_AMOUNT, 'mission', {
          metadata: { qaHarness: true, scenario: 'pe_m1u' },
        });
        emitPECreditEvent(QA_PE_AMOUNT, 'daily_mission', { qaHarness: true, scenario: 'pe_m1u' });
        qaOrchLog('scenario_dispatched_pe_m1u', { expect: orchOn ? 'PE→settle→M1U' : 'legacy order' });
        return;
      }

      /* full */
      qaOrchLog('full_rank_pending', { orchOn });

      const onM1uReplay = (e: Event) => {
        const d = (e as CustomEvent<M1UCreditEventDetail>).detail;
        if (!d?.orchestratorReplay || d.metadata?.qaRankFollowup !== true) return;
        qaOrchLog('intercept_m1u_replay', { id: d.id });
        window.removeEventListener(M1U_CREDIT_EVENT, onM1uReplay, true);
        fullCleanupRef.current = null;
        if (fullFallbackTimerRef.current) {
          clearTimeout(fullFallbackTimerRef.current);
          fullFallbackTimerRef.current = null;
        }
        qaOrchLog('schedule_rank_after_gate', { ms: RANK_GATE_RELEASE_AFTER_M1U_MS + 120 });
        rankAfterM1uTimerRef.current = window.setTimeout(() => {
          rankAfterM1uTimerRef.current = null;
          qaOrchLog('release_rank_qa_mock', '');
          openMockRank('after_m1u_replay_gate');
        }, RANK_GATE_RELEASE_AFTER_M1U_MS + 120);
      };

      const onPeSettled = (e: Event) => {
        const ev = e as CustomEvent<{ id?: string }>;
        qaOrchLog('pe_overlay_settled', { id: ev.detail?.id });
      };

      window.addEventListener(M1U_CREDIT_EVENT, onM1uReplay, true);
      window.addEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onPeSettled);
      fullCleanupRef.current = () => {
        window.removeEventListener(M1U_CREDIT_EVENT, onM1uReplay, true);
        window.removeEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onPeSettled);
      };

      fullFallbackTimerRef.current = window.setTimeout(() => {
        fullFallbackTimerRef.current = null;
        if (!rankShownRef.current) {
          qaOrchLog('full_fallback_rank', { reason: 'no_m1u_replay_seen_orch_off_or_stuck' });
          openMockRank('fallback_timer');
        }
      }, FULL_FALLBACK_RANK_MS);

      emitM1UCreditEvent(QA_M1U_AMOUNT, 'mission', {
        metadata: { qaHarness: true, scenario: 'full', qaRankFollowup: true },
      });
      emitPECreditEvent(QA_PE_AMOUNT, 'daily_mission', { qaHarness: true, scenario: 'full' });
      qaOrchLog('full_dispatched', '');
    },
    [clearFullTimers, openMockRank, orchOn]
  );

  const closeMockRank = useCallback(() => {
    qaOrchLog('rank_qa_dismiss', '');
    rankShownRef.current = false;
    setMockRankOpen(false);
    clearFullTimers();
  }, [clearFullTimers]);

  const qaRankPremiumLayer = (
    <RankUpVideoModal
      isOpen={mockRankOpen}
      newRank={VICTORY_ORCH_QA_MOCK_RANK}
      onComplete={closeMockRank}
    />
  );

  if (minimized) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="fixed left-2 z-[1000000] rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase"
          style={{
            bottom: 'max(12px, env(safe-area-inset-bottom))',
            background: 'rgba(255,80,80,0.85)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
          }}
        >
          QA Orch
        </button>
        {qaRankPremiumLayer}
      </>
    );
  }

  return (
    <>
      <div
        className="fixed left-2 z-[1000000] flex flex-col gap-1.5 rounded-xl border p-2 max-w-[200px]"
        style={{
          bottom: 'max(12px, env(safe-area-inset-bottom))',
          background: 'rgba(18,12,24,0.94)',
          borderColor: 'rgba(255,80,80,0.5)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wide text-red-400 leading-tight">Victory Orch QA</p>
            <p className="text-[8px] text-white/45 mt-0.5">
              Orch: <span className="text-white/80">{orchOn ? 'ON' : 'OFF'}</span> · Harness: ON
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="shrink-0 text-[9px] text-white/50 px-1"
            aria-label="Minimize QA panel"
          >
            −
          </button>
        </div>

        <button
          type="button"
          onClick={() => runScenario('m1u')}
          className="rounded-lg py-2 px-2 text-left text-[11px] font-semibold text-white/90"
          style={{ background: 'rgba(0,209,255,0.18)', border: '1px solid rgba(0,209,255,0.35)' }}
        >
          QA • M1U
        </button>
        <button
          type="button"
          onClick={() => runScenario('pe')}
          className="rounded-lg py-2 px-2 text-left text-[11px] font-semibold text-white/90"
          style={{ background: 'rgba(180,120,255,0.2)', border: '1px solid rgba(180,120,255,0.35)' }}
        >
          QA • PE
        </button>
        <button
          type="button"
          onClick={() => runScenario('pe_m1u')}
          className="rounded-lg py-2 px-2 text-left text-[11px] font-semibold text-white/90"
          style={{ background: 'rgba(255,200,80,0.15)', border: '1px solid rgba(255,200,80,0.35)' }}
        >
          QA • PE + M1U
        </button>
        <button
          type="button"
          onClick={() => runScenario('full')}
          className="rounded-lg py-2 px-2 text-left text-[11px] font-semibold text-white/90"
          style={{ background: 'rgba(255,80,120,0.18)', border: '1px solid rgba(255,80,120,0.4)' }}
        >
          QA • FULL
        </button>
      </div>
      {qaRankPremiumLayer}
    </>
  );
}

/** Renders nothing unless QA harness flag is enabled (no hooks before check — subcomponent owns hooks). */
export function VictoryOrchQaHarnessPanel(): React.ReactElement | null {
  if (!isVictoryOrchQaHarnessEnabled()) return null;
  return <VictoryOrchQaHarnessPanelInner />;
}
