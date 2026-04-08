/**
 * Pill Hint — hub centered on pill (viewport coords); content flips above/below and east/west to stay visible.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePillInfoOverlay, type PillInfoPillId } from '@/contexts/PillInfoOverlayContext';
import { useHomePlaySurface } from '@/contexts/HomePlaySurfaceContext';
import { PILL_INFO_OVERLAY_Z_INDEX } from '@/components/home/floatingPillsV3/floating-pills-v3';
import { computeHintAnchor, PILL_HINT_ACCENT, type HintAnchorLayout } from './layoutGeometry';
import { PillHintBox } from './PillHintBox';
import { usePillHintAnimation } from './usePillHintAnimation';

const DOT_BORDER = '#ffe4e4';

type PillHintLayoutEntry = { pillId: PillInfoPillId; layout: HintAnchorLayout };

export const PillHintOverlayV2: React.FC = () => {
  const { activePillId, closePill } = usePillInfoOverlay();
  const { playGateEnabled, surfaceActive } = useHomePlaySurface();
  const { t } = useTranslation();
  const anim = usePillHintAnimation();

  const playOn = playGateEnabled && surfaceActive;
  const show = Boolean(activePillId && playOn);

  const [layoutEntry, setLayoutEntry] = useState<PillHintLayoutEntry | null>(null);

  const activePillIdRef = useRef(activePillId);
  activePillIdRef.current = activePillId;
  const playOnRef = useRef(playOn);
  playOnRef.current = playOn;

  const remeasure = useCallback(() => {
    const id = activePillIdRef.current;
    if (!id || !playOnRef.current) {
      setLayoutEntry(null);
      return;
    }
    const anchorEl = document.querySelector(`[data-pill-info-anchor="${id}"]`);
    if (!(anchorEl instanceof HTMLElement)) {
      setLayoutEntry(null);
      return;
    }
    const anchor = anchorEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setLayoutEntry({ pillId: id, layout: computeHintAnchor(anchor, vw, vh, id) });
  }, []);

  /** Never paint geometry from a previous pill: Framer initial states would run at the wrong hub. */
  useLayoutEffect(() => {
    if (!activePillId || !playOn) {
      setLayoutEntry(null);
      return;
    }
    const anchorEl = document.querySelector(`[data-pill-info-anchor="${activePillId}"]`);
    if (!(anchorEl instanceof HTMLElement)) {
      setLayoutEntry(null);
      return;
    }
    const anchor = anchorEl.getBoundingClientRect();
    setLayoutEntry({
      pillId: activePillId,
      layout: computeHintAnchor(anchor, window.innerWidth, window.innerHeight, activePillId),
    });
  }, [activePillId, playOn]);

  useEffect(() => {
    if (!show) return;
    const ro = () => remeasure();
    window.addEventListener('resize', ro);
    window.addEventListener('scroll', ro, true);
    const id = window.requestAnimationFrame(() => remeasure());
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('resize', ro);
      window.removeEventListener('scroll', ro, true);
    };
  }, [show, remeasure]);

  useEffect(() => {
    if (!show) return;
    const panelEl = document.querySelector('[data-pill-info-panel="1"]');
    if (!(panelEl instanceof HTMLElement)) return;
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(panelEl);
    return () => ro.disconnect();
  }, [show, activePillId, remeasure]);

  useEffect(() => {
    if (!activePillId || !playOn) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-pill-info-anchor]') || target.closest('[data-pill-info-panel]')) return;
      closePill();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [activePillId, playOn, closePill]);

  const accent = activePillId ? PILL_HINT_ACCENT[activePillId] : PILL_HINT_ACCENT.action;
  const copyKey = activePillId ? (`home_pill_info_${activePillId}` as const) : 'home_pill_info_action';
  const body = t(copyKey);

  const layoutSnapshot =
    show && activePillId && layoutEntry && layoutEntry.pillId === activePillId ? layoutEntry : null;
  const layout = layoutSnapshot?.layout ?? null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {layoutSnapshot && layout && activePillId ? (
        <motion.div
          key={activePillId}
          className="m1-pill-hint-overlay item-hints"
          style={
            {
              '--purple': '#720c8f',
              position: 'fixed',
              inset: 0,
              zIndex: PILL_INFO_OVERLAY_Z_INDEX,
              pointerEvents: 'none',
            } as React.CSSProperties
          }
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: anim.exit.duration, ease: 'ease' } }}
        >
          <div
            className="hint"
            style={{
              position: 'fixed',
              left: layout.cx,
              top: layout.cy,
              width: layout.hubSize,
              height: layout.hubSize,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              className="hint-radius"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 250,
                height: 250,
                margin: '-125px 0 0 -125px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
              initial={anim.reduce ? { scale: 0, opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={
                anim.reduce
                  ? { scale: 0, opacity: 0 }
                  : { scale: anim.radius.scale, opacity: anim.radius.opacity }
              }
              transition={{
                duration: anim.radius.duration,
                times: anim.radius.times,
                ease: 'easeOut',
              }}
            />

            <div
              className="hint-dot"
              style={{
                position: 'relative',
                zIndex: 3,
                width: layout.hubSize,
                height: layout.hubSize,
                border: `1px solid ${DOT_BORDER}`,
                borderRadius: '50%',
                transform: 'translate(0, 0) scale(0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />

            <PillHintBox
              variant={layout.variant}
              horizontal={layout.horizontal}
              contentWidth={layout.contentWidth}
              lineColor={accent.line}
              anim={anim}
            >
              {body}
            </PillHintBox>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};
