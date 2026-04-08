/**
 * LIVE TARGET™ Phase 4.3 — level-complete modal (phantom / shard visual language, M1SSION palette).
 */

import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';

export interface LiveTargetVictoryModalProps {
  open: boolean;
  levelId: number;
  onContinue: () => void;
  t: TFunction;
}

export function LiveTargetVictoryModal({ open, levelId, onContinue, t }: LiveTargetVictoryModalProps) {
  if (!open || typeof document === 'undefined') return null;

  const title = t('liveTarget.victory_modal_title', { level: levelId });
  const subtitle = t('liveTarget.victory_modal_subtitle');
  const nextHint = t('liveTarget.victory_modal_next_hint');

  return createPortal(
    <div className="lt-p43-victory-root" data-lt-p43-victory="1">
      <div className="lt-p43-victory-backdrop" aria-hidden />
      <div
        className="lt-p43-phantom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lt-p43-victory-title"
      >
        <div className="lt-p43-ptrig lt-p43-ptrig--1" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--2" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--3" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--4" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--5" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--6" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--7" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--8" aria-hidden />
        <div className="lt-p43-ptrig lt-p43-ptrig--9" aria-hidden />

        <div className="lt-p43-phantom-wrapper">
          <div className="lt-p43-shard-layer lt-p43-shard-layer--1" aria-hidden />
          <div className="lt-p43-shard-layer lt-p43-shard-layer--2" aria-hidden />
          <div className="lt-p43-shard-layer lt-p43-shard-layer--3" aria-hidden />

          <div className="lt-p43-action-star" aria-hidden />

          <div className="lt-p43-heist-content">
            <p className="lt-p43-victory-badge">{t('liveTarget.victory_modal_badge')}</p>

            <div className="lt-p43-ransom-row" aria-hidden>
              {['M', '1', 'S', 'S', 'I', 'O', 'N'].map((ch, i) => (
                <div
                  key={`${ch}-${i}`}
                  className={`lt-p43-note-block ${i % 2 === 0 ? 'lt-p43-note-block--w' : 'lt-p43-note-block--b'}`}
                  style={{ '--lt-p43-i': i } as CSSProperties}
                >
                  <span className="lt-p43-note-txt">{ch}</span>
                </div>
              ))}
            </div>

            <h2 id="lt-p43-victory-title" className="lt-p43-victory-headline">
              {title}
            </h2>
            <p className="lt-p43-victory-sub">{subtitle}</p>
            <p className="lt-p43-victory-next">{nextHint}</p>

            <div className="lt-p43-card-socket">
              <div className="lt-p43-calling-card">
                <div className="lt-p43-card-face lt-p43-card-face--front">
                  <span className="lt-p43-card-label">{t('liveTarget.victory_card_classified')}</span>
                  <span className="lt-p43-card-level">L{levelId}</span>
                </div>
                <div className="lt-p43-card-face lt-p43-card-face--back" aria-hidden />
              </div>
            </div>

            <button
              type="button"
              className="lt-p43-victory-continue"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
            >
              {t('liveTarget.victory_modal_continue')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
