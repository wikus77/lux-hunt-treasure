/**
 * LIVE TARGET — Rive canvas for level victory (binary asset unchanged).
 * WKWebView: playback + resize must run after layout (deferred rAF); reset prefers first state machine.
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect } from 'react';

import rivUrl from '@/assets/rive/live-target-victory.riv';

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
    console.warn('[LiveTarget][victory-rive][error]', {
      message: error?.message,
      stack: error?.stack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/** Defer so canvas/container from useRive have non-zero layout before reset/resize (WKWebView). */
function scheduleVictoryPlayback(rive: Rive): void {
  const run = () => {
    try {
      const logDiscovered = (phase: string) => {
        console.warn('[LiveTarget][victory-rive][discovered]', {
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
        console.warn('[LiveTarget][victory-rive][playback-start]', {
          artboard: rive.activeArtboard,
          stateMachines: [...rive.stateMachineNames],
          animations: [...rive.animationNames],
        });
      } else {
        console.warn('[LiveTarget][victory-rive][error]', {
          phase: 'no_sm_no_anim',
          artboard: rive.activeArtboard,
        });
      }

      rive.resizeDrawingSurfaceToCanvas();
      rive.resizeToCanvas();
    } catch (e) {
      console.warn('[LiveTarget][victory-rive][error]', { phase: 'playback_or_resize', e });
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

function LiveTargetVictoryRiveInner() {
  useEffect(() => {
    console.warn('[LiveTarget][victory-rive][ready]', { phase: 'inner_mount' });
  }, []);

  const { RiveComponent } = useRive(
    {
      src: rivUrl,
      artboard: 'Menu Main',
      autoplay: true,
      layout: new Layout({
        fit: Fit.Cover,
        alignment: Alignment.Center,
      }),
      onRiveReady: (rive: Rive) => {
        console.warn('[LiveTarget][victory-rive][ready]', { phase: 'rive_instance', artboard: rive.activeArtboard });
        scheduleVictoryPlayback(rive);
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

export interface LiveTargetVictoryRiveProps {
  fallbackText: string;
}

export function LiveTargetVictoryRive({ fallbackText }: LiveTargetVictoryRiveProps) {
  return (
    <LiveTargetRiveErrorBoundary
      fallback={<div className="lt-rive-victory-fallback">{fallbackText}</div>}
    >
      <LiveTargetVictoryRiveInner />
    </LiveTargetRiveErrorBoundary>
  );
}
