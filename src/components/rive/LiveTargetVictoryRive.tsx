/**
 * LIVE TARGET — Rive canvas for level victory (binary: src/assets/rive/live-target-victory.riv).
 * WKWebView: load .riv via explicit fetch + ArrayBuffer so we never parse HTML/404 as Rive bytes.
 * Playback deferred with double rAF; first state machine or animation only.
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { Capacitor } from '@capacitor/core';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect, useState } from 'react';

import rivUrl from '@/assets/rive/live-target-victory.riv';

/** Expected SHA-256 of live-target-victory.riv (matches Desktop RIVE ANIMAZIONE.riv). */
const EXPECTED_RIV_SHA256 = 'ac28145af24cfe0f5a6f19b39bbe9ddb9026352c7afc093cd9b948a00e818229';

const RIVE_ARTBOARD_FALLBACKS = ['Menu Main', 'Menu', 'Post Session Menu'] as const;

function resolveRiveFetchHref(importedPath: string): string {
  if (/^(https?:|capacitor:|ionic:)/i.test(importedPath)) {
    return importedPath;
  }
  const base =
    typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : 'http://localhost/';
  return new URL(importedPath, base).href;
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const dig = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
    console.warn('[LiveTarget][rive-forensic][parse-error]', {
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

/** Defer so canvas/container from useRive have non-zero layout before reset/resize (WKWebView). */
function scheduleVictoryPlayback(rive: Rive): void {
  const run = () => {
    try {
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
        console.warn('[LiveTarget][rive-forensic][playback-start]', {
          artboard: rive.activeArtboard,
          stateMachines: [...rive.stateMachineNames],
          animations: [...rive.animationNames],
        });
      } else {
        console.warn('[LiveTarget][rive-forensic][parse-error]', {
          phase: 'no_sm_no_anim',
          artboard: rive.activeArtboard,
        });
      }

      rive.resizeDrawingSurfaceToCanvas();
      rive.resizeToCanvas();
    } catch (e) {
      console.warn('[LiveTarget][rive-forensic][parse-error]', { phase: 'playback_or_resize', e });
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
      artboard: 'Menu Main',
      autoplay: true,
      layout: new Layout({
        fit: Fit.Cover,
        alignment: Alignment.Center,
      }),
      onRiveReady: (rive: Rive) => {
        console.warn('[LiveTarget][rive-forensic][ready]', { phase: 'rive_instance', artboard: rive.activeArtboard });
        scheduleVictoryPlayback(rive);
      },
      onLoadError: (err: unknown) => {
        console.warn('[LiveTarget][rive-forensic][parse-error]', { phase: 'rive_onLoadError', err });
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
    console.warn('[LiveTarget][rive-forensic][bundle-output]', {
      viteAssetUrl: rivUrl,
      native: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
    });

    let cancelled = false;
    const href = resolveRiveFetchHref(rivUrl);
    console.warn('[LiveTarget][rive-forensic][asset-path]', {
      imported: rivUrl,
      resolvedHref: href,
      baseURI: typeof document !== 'undefined' ? document.baseURI : null,
    });

    (async () => {
      try {
        const res = await fetch(href);
        const ct = res.headers.get('content-type');
        const cl = res.headers.get('content-length');
        console.warn('[LiveTarget][rive-forensic][fetch-status]', {
          ok: res.ok,
          status: res.status,
          contentType: ct,
          contentLength: cl,
          responseUrl: res.url,
        });

        const buf = await res.arrayBuffer();
        if (cancelled) return;

        const u8 = new Uint8Array(buf.byteLength >= 4 ? buf.slice(0, 4) : buf);
        const magic =
          u8.length >= 4
            ? String.fromCharCode(u8[0]!, u8[1]!, u8[2]!, u8[3]!)
            : '';

        let hashHex = '';
        try {
          hashHex = await sha256Hex(buf);
        } catch {
          /* no subtle crypto */
        }

        console.warn('[LiveTarget][rive-forensic][asset-exists]', {
          byteLength: buf.byteLength,
          magic,
          looksLikeRive: magic === 'RIVE',
        });
        console.warn('[LiveTarget][rive-forensic][asset-hash]', {
          sha256: hashHex || null,
          matchesExpected: hashHex ? hashHex === EXPECTED_RIV_SHA256 : null,
        });

        if (!res.ok) {
          console.warn('[LiveTarget][rive-forensic][parse-error]', {
            phase: 'http_not_ok',
            status: res.status,
          });
          setFetchFailed(true);
          return;
        }

        if (magic !== 'RIVE') {
          const headUtf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, Math.min(240, buf.byteLength)));
          console.warn('[LiveTarget][rive-forensic][parse-error]', {
            phase: 'payload_not_rive_binary',
            headPreview: headUtf8.replace(/\s+/g, ' ').slice(0, 200),
          });
          setFetchFailed(true);
          return;
        }

        setBuffer(buf);
      } catch (e) {
        if (!cancelled) {
          console.warn('[LiveTarget][rive-forensic][parse-error]', { phase: 'fetch_throw', e });
          setFetchFailed(true);
        }
      }
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
