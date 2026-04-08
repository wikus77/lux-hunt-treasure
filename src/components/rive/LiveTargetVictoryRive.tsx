/**
 * LIVE TARGET — Rive canvas vittoria: buffer load + OKAY via RiveEvent (General/OpenUrl) + pointer sul canvas.
 * Fallback: bottone HTML nel modale (non rimosso).
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect, useState } from 'react';

import { attachVictoryRiveOkayListener } from '@/components/rive/attachVictoryRiveOkayListener';
import { loadLiveTargetVictoryRivBytes } from '@/components/rive/liveTargetVictoryRivAsset';
import { logRiveInstanceForensics } from '@/components/rive/logRiveInstanceForensics';

const RIVE_ARTBOARD_FALLBACKS = ['Menu Main', 'Menu', 'Post Session Menu'] as const;

class LiveTargetRiveErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[LiveTarget][Rive][error]', error, info.componentStack);
    console.warn('[LiveTarget][victory-rive][render-error]', {
      phase: 'react_boundary',
      message: error?.message,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function scheduleVictoryPlayback(rive: Rive): void {
  const run = () => {
    try {
      logRiveInstanceForensics(rive);

      const sms = [...rive.stateMachineNames];
      console.warn('[LiveTarget][victory-rive][inputs]', {
        artboard: rive.activeArtboard,
        stateMachines: sms,
        preview: sms.slice(0, 6).map((n) => {
          try {
            return {
              sm: n,
              inputs: rive.stateMachineInputs(n).map((i) => ({ name: i.name, type: i.type })),
            };
          } catch {
            return { sm: n, inputs: [] as { name: string; type: string }[] };
          }
        }),
      });

      const logDiscovered = (phase: string) => {
        console.warn('[LiveTarget][rive-forensic][discovered]', {
          phase,
          artboard: rive.activeArtboard,
          stateMachines: [...rive.stateMachineNames],
          animations: [...rive.animationNames],
        });
      };

      const tryPlay = (): boolean => {
        const smList = [...rive.stateMachineNames];
        const anims = [...rive.animationNames];
        if (smList.length > 0) {
          rive.reset({ stateMachines: smList[0], autoplay: true });
          return true;
        }
        if (anims.length > 0) {
          rive.reset({ animations: anims[0], autoplay: true });
          return true;
        }
        return false;
      };

      logDiscovered('initial');
      let ok = tryPlay();
      if (!ok) {
        for (const artboard of RIVE_ARTBOARD_FALLBACKS) {
          try {
            rive.reset({ artboard, autoplay: false });
            logDiscovered(`artboard_${artboard}`);
            ok = tryPlay();
            if (ok) break;
          } catch {
            /* invalid artboard name */
          }
        }
      }

      if (ok) {
        console.warn('[RIVE][forensic][playback-start]', {
          artboard: rive.activeArtboard,
          stateMachines: [...rive.stateMachineNames],
          animations: [...rive.animationNames],
        });
      } else {
        console.warn('[RIVE][forensic][parse-error]', {
          phase: 'no_sm_no_anim',
          artboard: rive.activeArtboard,
        });
      }

      rive.resizeDrawingSurfaceToCanvas();
      rive.resizeToCanvas();
    } catch (e) {
      console.warn('[LiveTarget][victory-rive][render-error]', { phase: 'playback_or_resize', e });
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

function LiveTargetVictoryRiveCanvas({
  buffer,
  onRiveOkayContinue,
}: {
  buffer: ArrayBuffer;
  onRiveOkayContinue: () => void;
}) {
  const { RiveComponent, rive } = useRive(
    {
      buffer,
      autoplay: true,
      shouldDisableRiveListeners: false,
      automaticallyHandleEvents: false,
      isTouchScrollEnabled: true,
      layout: new Layout({
        fit: Fit.Cover,
        alignment: Alignment.Center,
      }),
      onRiveReady: (instance: Rive) => {
        console.warn('[LiveTarget][victory-rive][ready]', {
          artboard: instance.activeArtboard,
          stateMachines: [...instance.stateMachineNames],
        });
        scheduleVictoryPlayback(instance);
      },
      onLoadError: (err: unknown) => {
        console.warn('[LiveTarget][victory-rive][parse-error]', { phase: 'rive_onLoadError', err });
      },
    },
    {
      shouldResizeCanvasToContainer: true,
      useOffscreenRenderer: false,
    }
  );

  useEffect(() => {
    if (!rive) return;
    const detach = attachVictoryRiveOkayListener(rive, onRiveOkayContinue);
    return detach;
  }, [rive, onRiveOkayContinue]);

  return (
    <div className="lt-rive-victory-rive-wrap lt-rive-victory-rive-wrap--interactive">
      <RiveComponent className="lt-rive-victory-canvas" />
    </div>
  );
}

function LiveTargetVictoryRiveInner({
  fallbackText,
  loadingText,
  onRiveOkayContinue,
}: {
  fallbackText: string;
  loadingText: string;
  onRiveOkayContinue: () => void;
}) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await loadLiveTargetVictoryRivBytes();
      if (cancelled) return;
      if (r.ok) setBuffer(r.buffer);
      else setFetchFailed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (fetchFailed) {
    return <div className="lt-rive-victory-fallback">{fallbackText}</div>;
  }
  if (!buffer) {
    return <div className="lt-rive-victory-fallback">{loadingText}</div>;
  }

  return <LiveTargetVictoryRiveCanvas buffer={buffer} onRiveOkayContinue={onRiveOkayContinue} />;
}

export interface LiveTargetVictoryRiveProps {
  fallbackText: string;
  loadingText: string;
  /** Chiamato quando Rive emette RiveEvent (General/OpenUrl) — il modale applica guard anti-doppio. */
  onRiveOkayContinue: () => void;
}

export function LiveTargetVictoryRive({
  fallbackText,
  loadingText,
  onRiveOkayContinue,
}: LiveTargetVictoryRiveProps) {
  return (
    <LiveTargetRiveErrorBoundary
      fallback={<div className="lt-rive-victory-fallback">{fallbackText}</div>}
    >
      <LiveTargetVictoryRiveInner
        fallbackText={fallbackText}
        loadingText={loadingText}
        onRiveOkayContinue={onRiveOkayContinue}
      />
    </LiveTargetRiveErrorBoundary>
  );
}
