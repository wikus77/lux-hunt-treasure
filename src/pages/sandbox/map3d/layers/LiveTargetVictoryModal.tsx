/**
 * LIVE TARGET™ — Victory modal: Rive animation (unchanged .riv) + continue CTA.
 * Rive is lazy-loaded so map/home bundles never execute @rive-app/canvas at startup.
 */

import type { ErrorInfo, ReactNode } from 'react';
import { Component, Suspense, lazy, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';

import './LiveTargetVictoryModal.css';

class VictoryRiveLazyErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[LiveTarget][victory-flow] rive_error', {
      phase: 'lazy_or_render',
      message: error?.message,
      stack: error?.stack,
    });
    console.warn('[LiveTarget][victory-flow] rive_lazy_or_render_failed', info?.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const LiveTargetVictoryRive = lazy(() => {
  console.warn('[LiveTarget][victory-flow] rive_lazy_requested');
  return import('@/components/rive/LiveTargetVictoryRive').then((m) => {
    console.warn('[LiveTarget][victory-flow] rive_chunk_resolved');
    return { default: m.LiveTargetVictoryRive };
  });
});

export interface LiveTargetVictoryModalProps {
  open: boolean;
  levelId: number;
  onContinue: () => void;
  t: TFunction;
}

export function LiveTargetVictoryModal({ open, levelId, onContinue, t }: LiveTargetVictoryModalProps) {
  useEffect(() => {
    if (!open) return;
    console.warn('[LiveTarget][victory-flow] modal_open_true', { levelId });
    console.warn('[LiveTarget][victory-flow] modal_component_mounted', { levelId });
    const frame = requestAnimationFrame(() => {
      const root = document.querySelector('[data-lt-rive-victory="1"]');
      const dialog = root?.querySelector('.lt-rive-victory-dialog');
      const wrap = root?.querySelector('.lt-rive-victory-rive-wrap');
      const dr = dialog?.getBoundingClientRect();
      const wr = wrap?.getBoundingClientRect();
      const btn = root?.querySelector('.lt-rive-victory-continue');
      const br = btn?.getBoundingClientRect();
      console.warn('[LiveTarget][victory-flow] modal_visible_layout', {
        dialog: dr ? { w: Math.round(dr.width), h: Math.round(dr.height), top: Math.round(dr.top) } : null,
        riveWrap: wr ? { w: Math.round(wr.width), h: Math.round(wr.height) } : null,
        continueBtn: br ? { w: Math.round(br.width), h: Math.round(br.height), top: Math.round(br.top) } : null,
      });
      if (br && dr && wr && wr.height < 8 && br.height > 16) {
        console.warn('[LiveTarget][victory-flow] continue_visible_without_modal', {
          note: 'Rive wrap height collapsed — check CSS / canvas sizing',
        });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      console.warn('[LiveTarget][victory-flow] modal_unmounted', { levelId });
    };
  }, [open, levelId]);

  if (!open || typeof document === 'undefined') return null;

  const dialogLabel = t('liveTarget.victory_modal_title', { level: levelId });
  const riveFallback = <div className="lt-rive-victory-fallback">{t('liveTarget.victory_rive_error')}</div>;

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
        <VictoryRiveLazyErrorBoundary fallback={riveFallback}>
          <Suspense
            fallback={<div className="lt-rive-victory-fallback">{t('liveTarget.victory_rive_loading')}</div>}
          >
            <LiveTargetVictoryRive fallbackText={t('liveTarget.victory_rive_error')} />
          </Suspense>
        </VictoryRiveLazyErrorBoundary>
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
