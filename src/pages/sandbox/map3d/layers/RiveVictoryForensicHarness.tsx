/**
 * Harness isolato: solo canvas Rive + file live-target-victory.riv.
 * Abilitazione: localStorage `m1_live_target_rive_forensic` === '1' (nessuna nuova route).
 */

import type { Rive } from '@rive-app/canvas';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { useCallback, useEffect, useState } from 'react';

import { logRiveInstanceForensics } from '@/components/rive/logRiveInstanceForensics';
import { loadLiveTargetVictoryRivBytes } from '@/components/rive/liveTargetVictoryRivAsset';

function ForensicRiveCanvas({ buffer }: { buffer: ArrayBuffer }) {
  const { RiveComponent, rive } = useRive(
    {
      buffer,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onRiveReady: (rive: Rive) => {
        logRiveInstanceForensics(rive);

        const startPlayback = () => {
          try {
            const sms = [...rive.stateMachineNames];
            const anims = [...rive.animationNames];
            if (sms.length > 0) {
              rive.reset({ stateMachines: sms[0], autoplay: true });
            } else if (anims.length > 0) {
              rive.reset({ animations: anims[0], autoplay: true });
            }
            rive.resizeDrawingSurfaceToCanvas();
            rive.resizeToCanvas();
            console.warn('[RIVE][forensic][playback-start]', {
              artboard: rive.activeArtboard,
              stateMachines: [...rive.stateMachineNames],
              animations: [...rive.animationNames],
              isPlaying: rive.isPlaying,
            });
          } catch (e) {
            console.warn('[RIVE][forensic][render-error]', { phase: 'playback', e });
          }
        };

        requestAnimationFrame(() => requestAnimationFrame(startPlayback));

        window.setTimeout(() => {
          console.warn('[RIVE][forensic][wkwebview-result]', {
            isPlaying: rive.isPlaying,
            playingSm: [...rive.playingStateMachineNames],
            playingAnim: [...rive.playingAnimationNames],
            bounds: rive.bounds,
          });
        }, 1200);
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

  useEffect(() => {
    if (rive) console.warn('[RIVE][forensic][canvas-mounted]', { phase: 'rive_instance_set', ok: true });
  }, [rive]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 280,
        width: '100%',
        background: '#111',
        position: 'relative',
      }}
    >
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

export default function RiveVictoryForensicHarness() {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await loadLiveTargetVictoryRivBytes();
      if (cancelled) return;
      if (r.ok) setBuffer(r.buffer);
      else {
        setErr(r.reason);
        console.warn('[RIVE][forensic][wkwebview-result]', { ok: false, reason: r.reason });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.removeItem('m1_live_target_rive_forensic');
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        background: '#1e1e2e',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column',
        padding: 'max(12px, env(safe-area-inset-top)) 16px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <strong>Rive forensic harness</strong>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
          LS m1_live_target_rive_forensic=1 — filtra console: [RIVE][forensic]
        </div>
        <button
          type="button"
          onClick={close}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#444',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Chiudi e ricarica
        </button>
      </div>
      {err && (
        <pre style={{ color: '#f88', fontSize: 13, whiteSpace: 'pre-wrap' }}>{`Load failed: ${err}`}</pre>
      )}
      {!err && !buffer && <div style={{ opacity: 0.7 }}>Loading .riv…</div>}
      {buffer && <ForensicRiveCanvas buffer={buffer} />}
    </div>
  );
}
