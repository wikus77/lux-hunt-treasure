/**
 * LIVE TARGET — Rive canvas for level victory (binary asset unchanged).
 * Playback: file is largely state-machine driven; autoplay alone often shows only frame 0.
 * On load we discover artboard SM/animations and call reset({ stateMachines|animations, autoplay: true }).
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect } from 'react';

import rivUrl from '@/assets/rive/live-target-victory.riv';

/** From strings inspection of live-target-victory.riv (Desktop copy, SHA match). */
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
    console.warn('[LiveTarget][victory-flow] rive_error', {
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function startVictoryPlayback(rive: Rive): void {
  const logDiscovery = (phase: string) => {
    console.warn('[LiveTarget][victory-flow] rive_discovered', {
      phase,
      artboard: rive.activeArtboard,
      stateMachines: [...rive.stateMachineNames],
      animations: [...rive.animationNames],
    });
  };

  const tryResetPlayback = (): boolean => {
    const sms = [...rive.stateMachineNames];
    const anims = [...rive.animationNames];
    if (sms.length > 0) {
      rive.reset({
        stateMachines: sms.length === 1 ? sms[0] : sms,
        autoplay: true,
      });
      return true;
    }
    if (anims.length > 0) {
      rive.reset({
        animations: anims.length === 1 ? anims[0] : anims,
        autoplay: true,
      });
      return true;
    }
    return false;
  };

  logDiscovery('initial');
  if (tryResetPlayback()) {
    logDiscovery('after_sm_or_anim_reset');
  } else {
    for (const artboard of RIVE_ARTBOARD_FALLBACKS) {
      try {
        rive.reset({ artboard, autoplay: false });
        logDiscovery(`artboard_try_${artboard}`);
        if (tryResetPlayback()) {
          logDiscovery('after_artboard_fallback');
          break;
        }
      } catch {
        /* wrong artboard name — try next */
      }
    }
  }

  try {
    rive.resizeDrawingSurfaceToCanvas();
    rive.resizeToCanvas();
  } catch {
    /* non-fatal on some WKWebView builds */
  }
}

function LiveTargetVictoryRiveInner() {
  useEffect(() => {
    console.warn('[LiveTarget][Rive][mount]');
    console.warn('[LiveTarget][victory-flow] rive_component_mounted');
  }, []);

  const { RiveComponent } = useRive(
    {
      src: rivUrl,
      autoplay: true,
      layout: new Layout({
        fit: Fit.Cover,
        alignment: Alignment.Center,
      }),
      onRiveReady: (rive: Rive) => {
        console.warn('[LiveTarget][Rive][loaded]');
        console.warn('[LiveTarget][victory-flow] rive_loaded');
        startVictoryPlayback(rive);
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
  /** Localized fallback if Rive fails to render */
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
