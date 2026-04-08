/**
 * LIVE TARGET — Rive canvas vittoria: stesso .riv, fetch con origin Capacitor + buffer + introspection.
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect, useState } from 'react';

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
    console.warn('[RIVE][forensic][render-error]', {
      phase: 'react_boundary',
      message: error?.message,
      stack: error?.stack,
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

      const logDiscovered = (phase: string) => {
        console.warn('[LiveTarget][rive-forensic][discovered]', {
          phase,
          artboard: rive.activeArtboard,
          stateMachines: [...rive.stateMachineNames],
          animations: [...rive.animationNames],
        });
      };

      const tryPlay = (): boolean => {
        const sms = [...rive.stateMachineNames];
        const anims = [...rive.animationNames];
        if (sms.length > 0) {
          rive.reset({ stateMachines: sms[0], autoplay: true });
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
      console.warn('[RIVE][forensic][render-error]', { phase: 'playback_or_resize', e });
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

function LiveTargetVictoryRiveCanvas({ buffer }: { buffer: ArrayBuffer }) {
  const { RiveComponent } = useRive(
    {
      buffer,
      autoplay: true,
      layout: new Layout({
        fit: Fit.Cover,
        alignment: Alignment.Center,
      }),
      onRiveReady: (rive: Rive) => {
        console.warn('[RIVE][forensic][ready]', { phase: 'rive_instance', artboard: rive.activeArtboard });
        scheduleVictoryPlayback(rive);
      },
      onLoadError: (err: unknown) => {
        console.warn('[RIVE][forensic][parse-error]', { phase: 'rive_onLoadError', err });
      },
    },
    {
      shouldResizeCanvasToContainer: true,
      useOffscreenRenderer: false,
    }
  );

  return (
    <div className="lt-rive-victory-rive-wrap">
      <RiveComponent className="lt-rive-victory-canvas" />
    </div>
  );
}

function LiveTargetVictoryRiveInner({
  fallbackText,
  loadingText,
}: {
  fallbackText: string;
  loadingText: string;
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

  return <LiveTargetVictoryRiveCanvas buffer={buffer} />;
}

export interface LiveTargetVictoryRiveProps {
  fallbackText: string;
  loadingText: string;
}

export function LiveTargetVictoryRive({ fallbackText, loadingText }: LiveTargetVictoryRiveProps) {
  return (
    <LiveTargetRiveErrorBoundary
      fallback={<div className="lt-rive-victory-fallback">{fallbackText}</div>}
    >
      <LiveTargetVictoryRiveInner fallbackText={fallbackText} loadingText={loadingText} />
    </LiveTargetRiveErrorBoundary>
  );
}
