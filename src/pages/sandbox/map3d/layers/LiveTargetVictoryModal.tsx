/**
 * LIVE TARGET™ — Victory modal: Rive animation (unchanged .riv) + continue CTA.
 * Rive is lazy-loaded so map/home bundles never execute @rive-app/canvas at startup.
 */

import { Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';

import './LiveTargetVictoryModal.css';

const LiveTargetVictoryRive = lazy(() =>
  import('@/components/rive/LiveTargetVictoryRive').then((m) => ({ default: m.LiveTargetVictoryRive }))
);

export interface LiveTargetVictoryModalProps {
  open: boolean;
  levelId: number;
  onContinue: () => void;
  t: TFunction;
}

export function LiveTargetVictoryModal({ open, levelId, onContinue, t }: LiveTargetVictoryModalProps) {
  if (!open || typeof document === 'undefined') return null;

  const dialogLabel = t('liveTarget.victory_modal_title', { level: levelId });

  return createPortal(
    <div className="lt-rive-victory-root" data-lt-rive-victory="1">
      <div className="lt-rive-victory-backdrop" aria-hidden />
      <div
        className="lt-rive-victory-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Suspense
          fallback={<div className="lt-rive-victory-fallback">{t('liveTarget.victory_rive_loading')}</div>}
        >
          <LiveTargetVictoryRive fallbackText={t('liveTarget.victory_rive_error')} />
        </Suspense>
        <button
          type="button"
          className="lt-rive-victory-continue"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
        >
          {t('liveTarget.victory_continue')}
        </button>
      </div>
    </div>,
    document.body
  );
}
