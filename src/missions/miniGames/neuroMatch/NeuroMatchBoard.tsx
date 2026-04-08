/**
 * Touch-first memory grid — flip, match, mismatch penalty on timer.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { hapticSelection, isHapticsAvailable } from '@/utils/haptics';
import type { NeuroMatchGameParams, NeuroMatchOutcomePayload } from './neuroMatchTypes';
import { glyphForPairId } from './neuroMatchUtils';
import { expectedMatchedPairsFromBoard } from './neuroMatchLogic';

const FLIP_MISMATCH_MS = 650;

interface Props {
  params: NeuroMatchGameParams;
  roundKey: number;
  onRoundComplete: (payload: NeuroMatchOutcomePayload) => void;
}

export const NeuroMatchBoard: React.FC<Props> = ({ params, roundKey, onRoundComplete }) => {
  const { t } = useTranslation();
  const [remainingSec, setRemainingSec] = useState(params.time_limit_sec);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [faceUp, setFaceUp] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const finishedRef = useRef(false);
  const mismatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movesRef = useRef(0);
  const mismatchesRef = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    finishedRef.current = false;
    setRemainingSec(params.time_limit_sec);
    setMatched(new Set());
    setFaceUp([]);
    setMoves(0);
    setMismatches(0);
    movesRef.current = 0;
    mismatchesRef.current = 0;
    setLockBoard(false);
    setShakeIdx(null);
    setDone(false);
    if (mismatchTimerRef.current) {
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = null;
    }
  }, [roundKey, params]);

  useEffect(() => {
    if (finishedRef.current) return;
    const id = window.setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 0) return 0;
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [roundKey]);

  const submitEnd = useCallback(
    (won: boolean, matchedPairs: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDone(true);
      if (mismatchTimerRef.current) {
        clearTimeout(mismatchTimerRef.current);
        mismatchTimerRef.current = null;
      }
      onRoundComplete({
        seed: params.seed,
        week_index: params.week_index,
        cards_total: params.cards_total,
        pairs_total: params.pairs_total,
        matched_pairs: matchedPairs,
        moves: movesRef.current,
        mismatches: mismatchesRef.current,
        duration_ms: Date.now() - startedAt.current,
        won,
      });
    },
    [onRoundComplete, params]
  );

  const matchedPairsCount = expectedMatchedPairsFromBoard(matched, params.board_layout);

  useEffect(() => {
    if (finishedRef.current) return;
    if (matchedPairsCount >= params.pairs_total && params.pairs_total > 0) {
      submitEnd(true, params.pairs_total);
    }
  }, [matchedPairsCount, params.pairs_total, submitEnd]);

  useEffect(() => {
    if (finishedRef.current) return;
    if (remainingSec <= 0 && matchedPairsCount < params.pairs_total) {
      submitEnd(false, matchedPairsCount);
    }
  }, [remainingSec, matchedPairsCount, params.pairs_total, submitEnd]);

  const resolveMismatch = useCallback(
    (a: number, b: number) => {
      setMismatches((m) => {
        const n = m + 1;
        mismatchesRef.current = n;
        return n;
      });
      setShakeIdx(b);
      setRemainingSec((s) => Math.max(0, s - params.mismatch_penalty_sec));
      mismatchTimerRef.current = setTimeout(() => {
        setFaceUp([]);
        setLockBoard(false);
        setShakeIdx(null);
        mismatchTimerRef.current = null;
      }, FLIP_MISMATCH_MS);
    },
    [params.mismatch_penalty_sec]
  );

  const onCellPress = useCallback(
    (index: number) => {
      if (done || finishedRef.current || lockBoard) return;
      const pairId = params.board_layout[index];
      if (pairId < 0) return;
      if (matched.has(index)) return;
      if (faceUp.includes(index)) return;
      if (faceUp.length >= 2) return;

      if (isHapticsAvailable()) hapticSelection();

      const nextFace = [...faceUp, index];
      setMoves((m) => {
        const n = m + 1;
        movesRef.current = n;
        return n;
      });
      setFaceUp(nextFace);

      if (nextFace.length === 1) return;

      const i0 = nextFace[0];
      const i1 = nextFace[1];
      const p0 = params.board_layout[i0];
      const p1 = params.board_layout[i1];
      if (p0 === p1 && p0 >= 0) {
        setMatched((prev) => new Set([...prev, i0, i1]));
        setFaceUp([]);
        return;
      }
      setLockBoard(true);
      resolveMismatch(i0, i1);
    },
    [done, faceUp, lockBoard, matched, params.board_layout, resolveMismatch]
  );

  const gap = 8;
  const cellAspect = 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 420,
          width: '100%',
          margin: '0 auto 12px',
          padding: '0 4px',
        }}
      >
        <span style={{ color: 'rgba(0, 209, 255, 0.95)', fontSize: 15, fontWeight: 700 }}>
          {t('daily_neuromatch.time', { sec: Math.max(0, Math.ceil(remainingSec)) })}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>
          {t('daily_neuromatch.pairs', { found: matchedPairsCount, total: params.pairs_total })}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${params.grid_cols}, minmax(0, 1fr))`,
          gap,
          maxWidth: 420,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          alignContent: 'center',
        }}
      >
        {params.board_layout.map((pairId, index) => {
          const isEmpty = pairId < 0;
          const isMatched = matched.has(index);
          const showFace = isMatched || faceUp.includes(index);
          const isShake = shakeIdx === index;

          if (isEmpty) {
            return (
              <div
                key={`e-${index}`}
                style={{
                  aspectRatio: cellAspect,
                  borderRadius: 12,
                  border: '1px dashed rgba(0, 209, 255, 0.22)',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                }}
              >
                <span style={{ fontSize: 11, color: 'rgba(0, 209, 255, 0.45)', textAlign: 'center', lineHeight: 1.2 }}>
                  {t('daily_neuromatch.empty_slot')}
                </span>
              </div>
            );
          }

          return (
            <motion.button
              key={`c-${index}-${roundKey}`}
              type="button"
              disabled={done || lockBoard || isMatched}
              onClick={() => onCellPress(index)}
              animate={isShake ? { x: [0, -5, 5, -4, 4, 0] } : {}}
              transition={{ duration: 0.35 }}
              style={{
                aspectRatio: cellAspect,
                borderRadius: 12,
                border: 'none',
                padding: 0,
                cursor: isMatched || lockBoard ? 'default' : 'pointer',
                background: 'transparent',
                perspective: 800,
              }}
            >
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
                animate={{ rotateY: showFace ? 180 : 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: 12,
                    background: 'linear-gradient(145deg, rgba(0, 209, 255, 0.22), rgba(0, 80, 120, 0.35))',
                    border: '1px solid rgba(0, 209, 255, 0.35)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: 12,
                    background: isMatched
                      ? 'linear-gradient(145deg, rgba(0, 255, 180, 0.25), rgba(0, 120, 100, 0.4))'
                      : 'linear-gradient(145deg, rgba(20, 30, 45, 0.95), rgba(10, 18, 32, 0.98))',
                    border: `1px solid ${isMatched ? 'rgba(0, 255, 180, 0.5)' : 'rgba(0, 209, 255, 0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color: isMatched ? 'rgba(0, 255, 200, 0.95)' : 'rgba(0, 220, 255, 0.95)',
                    fontWeight: 700,
                  }}
                >
                  {glyphForPairId(pairId)}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
