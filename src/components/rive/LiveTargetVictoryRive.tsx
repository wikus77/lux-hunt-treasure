/**
 * LIVE TARGET — Rive canvas for level victory (binary asset unchanged).
 */

import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect } from 'react';

import rivUrl from '@/assets/rive/live-target-victory.riv';

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
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
      onRiveReady: () => {
        console.warn('[LiveTarget][Rive][loaded]');
        console.warn('[LiveTarget][victory-flow] rive_loaded');
      },
    },
    {
      shouldResizeCanvasToContainer: true,
      // Offscreen renderer often breaks or shows blank canvas in iOS WKWebView
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
