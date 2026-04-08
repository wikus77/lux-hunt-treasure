/**
 * LIVE TARGET™ — Victory modal: Rive animation (unchanged .riv) + continue CTA.
 */

import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';

import { LiveTargetVictoryRive } from '@/components/rive/LiveTargetVictoryRive';

import './LiveTargetVictoryModal.css';

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
        <LiveTargetVictoryRive fallbackText={t('liveTarget.victory_rive_error')} />
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
