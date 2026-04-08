/**
 * Mount first under VictoryOrchestrationProvider so listener useEffect runs before Global M1U / PE overlays.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  M1U_CREDIT_EVENT,
  PENDING_CREDIT_KEY,
  type M1UCreditEventDetail,
} from '@/features/m1u/m1uCreditEvent';
import { PE_CREDIT_EVENT, type PECreditEventDetail } from '@/features/pulse/peCreditEvent';
import {
  DAILY_BATCH_WAIT_MS,
  DAILY_BATCH_WAIT_REDUCED_MOTION_MS,
  DAILY_M1U_MERGE_WINDOW_MS,
  DEDUP_ID_TTL_MS,
  PE_REWARD_OVERLAY_SETTLED_EVENT,
  RANK_GATE_RELEASE_AFTER_M1U_MS,
  RANK_GATE_RELEASE_AFTER_M1U_REDUCED_MS,
} from './constants';
import { orchLog } from './logging';

export function reducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

interface Props {
  enabled: boolean;
  setBlockRankUpModal: (v: boolean) => void;
}

export function VictoryOrchestrationListeners({ enabled, setBlockRankUpModal }: Props) {
  const m1uBufferRef = useRef<M1UCreditEventDetail | null>(null);
  const waitingM1uAfterPeRef = useRef<M1UCreditEventDetail | null>(null);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayGuardRef = useRef<Map<string, number>>(new Map());
  const sequenceActiveRef = useRef(false);
  /** True after we replay a daily PE until that modal instance settles (ignores spurious settles). */
  const expectingDailyPeSettleRef = useRef(false);

  const setBlockRankUpModalRef = useRef(setBlockRankUpModal);
  setBlockRankUpModalRef.current = setBlockRankUpModal;

  const clearBatchTimer = useCallback(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
  }, []);

  const clearRankTimer = useCallback(() => {
    if (rankReleaseTimerRef.current) {
      clearTimeout(rankReleaseTimerRef.current);
      rankReleaseTimerRef.current = null;
    }
  }, []);

  const pruneReplayGuard = useCallback(() => {
    const now = Date.now();
    const m = replayGuardRef.current;
    for (const [id, ts] of m.entries()) {
      if (now - ts > DEDUP_ID_TTL_MS) m.delete(id);
    }
  }, []);

  const shouldSkipReplay = useCallback(
    (id: string): boolean => {
      pruneReplayGuard();
      const now = Date.now();
      const ts = replayGuardRef.current.get(id);
      if (ts != null && now - ts < DEDUP_ID_TTL_MS) {
        orchLog('replay_guard_skip', { id });
        return true;
      }
      replayGuardRef.current.set(id, now);
      return false;
    },
    [pruneReplayGuard]
  );

  const scheduleRankRelease = useCallback(() => {
    clearRankTimer();
    const rm = reducedMotion();
    const ms = rm ? RANK_GATE_RELEASE_AFTER_M1U_REDUCED_MS : RANK_GATE_RELEASE_AFTER_M1U_MS;
    rankReleaseTimerRef.current = setTimeout(() => {
      rankReleaseTimerRef.current = null;
      sequenceActiveRef.current = false;
      setBlockRankUpModalRef.current(false);
      orchLog('rank_gate_released', { ms });
    }, ms);
  }, [clearRankTimer]);

  const replayM1U = useCallback(
    (d: M1UCreditEventDetail) => {
      if (shouldSkipReplay(d.id)) return;
      const payload: M1UCreditEventDetail = {
        ...d,
        orchestratorReplay: true,
      };
      try {
        (window as unknown as { [key: string]: unknown })[PENDING_CREDIT_KEY] = payload;
      } catch {
        /* no-op */
      }
      window.dispatchEvent(new CustomEvent(M1U_CREDIT_EVENT, { detail: payload }));
      orchLog('replay_m1u', { amount: d.amount, id: d.id });
    },
    [shouldSkipReplay]
  );

  const replayPE = useCallback(
    (d: PECreditEventDetail) => {
      if (shouldSkipReplay(d.id)) return;
      expectingDailyPeSettleRef.current = true;
      const payload: PECreditEventDetail = {
        ...d,
        orchestratorReplay: true,
      };
      window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail: payload }));
      orchLog('replay_pe', { amount: d.amount, id: d.id });
    },
    [shouldSkipReplay]
  );

  const flushM1uOnlyPhase1 = useCallback(() => {
    clearBatchTimer();
    const buf = m1uBufferRef.current;
    m1uBufferRef.current = null;
    if (!buf) return;
    replayM1U(buf);
    scheduleRankRelease();
    orchLog('flush_m1u_only', { id: buf.id });
  }, [clearBatchTimer, replayM1U, scheduleRankRelease]);

  const startBatchTimer = useCallback(() => {
    clearBatchTimer();
    const rm = reducedMotion();
    const wait = rm ? DAILY_BATCH_WAIT_REDUCED_MOTION_MS : DAILY_BATCH_WAIT_MS;
    batchTimerRef.current = setTimeout(() => {
      batchTimerRef.current = null;
      flushM1uOnlyPhase1();
    }, wait);
  }, [clearBatchTimer, flushM1uOnlyPhase1]);

  const onPeSettled = useCallback(
    (_e: Event) => {
      if (!enabled) return;
      if (!expectingDailyPeSettleRef.current) {
        orchLog('pe_settled_ignored_not_expecting');
        return;
      }
      expectingDailyPeSettleRef.current = false;

      const pending = waitingM1uAfterPeRef.current;
      waitingM1uAfterPeRef.current = null;
      if (pending) {
        replayM1U(pending);
        scheduleRankRelease();
        orchLog('pe_settled_then_m1u', { m1uId: pending.id });
      } else {
        sequenceActiveRef.current = false;
        setBlockRankUpModalRef.current(false);
        orchLog('pe_settled_no_m1u');
      }
    },
    [enabled, replayM1U, scheduleRankRelease]
  );

  useEffect(() => {
    if (!enabled) return;

    const m1uHandler = (e: Event) => {
      const ev = e as CustomEvent<M1UCreditEventDetail>;
      const detail = ev.detail;
      if (!detail || detail.orchestratorReplay) return;
      if (detail.source !== 'mission') return;

      e.stopImmediatePropagation();

      if (!sequenceActiveRef.current) {
        sequenceActiveRef.current = true;
        setBlockRankUpModalRef.current(true);
        orchLog('sequence_start_m1u');
      }

      const now = Date.now();
      const buf = m1uBufferRef.current;
      if (buf && now - buf.issuedAt < DAILY_M1U_MERGE_WINDOW_MS) {
        const merged: M1UCreditEventDetail = {
          ...detail,
          amount: buf.amount + detail.amount,
          id: detail.id,
          issuedAt: now,
        };
        m1uBufferRef.current = merged;
        orchLog('merge_m1u_buffer', { amount: merged.amount });
      } else {
        m1uBufferRef.current = detail;
      }

      clearBatchTimer();
      startBatchTimer();
    };

    const peHandler = (e: Event) => {
      const ev = e as CustomEvent<PECreditEventDetail>;
      const detail = ev.detail;
      if (!detail || detail.orchestratorReplay) return;
      if (detail.source !== 'daily_mission') return;

      e.stopImmediatePropagation();

      if (!sequenceActiveRef.current) {
        sequenceActiveRef.current = true;
        setBlockRankUpModalRef.current(true);
        orchLog('sequence_start_pe');
      }

      clearBatchTimer();

      const buffered = m1uBufferRef.current;
      m1uBufferRef.current = null;
      if (buffered) {
        waitingM1uAfterPeRef.current = buffered;
        orchLog('pe_with_buffered_m1u', { peId: detail.id, m1uAmount: buffered.amount });
      } else {
        waitingM1uAfterPeRef.current = null;
      }

      replayPE(detail);
    };

    window.addEventListener(M1U_CREDIT_EVENT, m1uHandler, true);
    window.addEventListener(PE_CREDIT_EVENT, peHandler, true);
    window.addEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onPeSettled);

    orchLog('listeners_registered_capture_first');

    return () => {
      window.removeEventListener(M1U_CREDIT_EVENT, m1uHandler, true);
      window.removeEventListener(PE_CREDIT_EVENT, peHandler, true);
      window.removeEventListener(PE_REWARD_OVERLAY_SETTLED_EVENT, onPeSettled);
      clearBatchTimer();
      clearRankTimer();
      orchLog('listeners_unmounted');
    };
  }, [enabled, clearBatchTimer, clearRankTimer, onPeSettled, replayPE, startBatchTimer]);

  return null;
}
