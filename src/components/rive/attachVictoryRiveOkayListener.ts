/**
 * Collega `EventType.RiveEvent` (eventi “reported” dalla state machine Rive) al continue vittoria.
 * Solo tipi espliciti (General / OpenUrl) per evitare continue fantasma su payload sconosciuti.
 */

import { EventType, RiveEventType, type Event, type Rive } from '@rive-app/canvas';

export function attachVictoryRiveOkayListener(rive: Rive, onOkay: () => void): () => void {
  const handler = (event: Event) => {
    if (event.type !== EventType.RiveEvent) return;
    const data = event.data;
    console.warn('[LiveTarget][victory-rive][event]', {
      hasData: Boolean(data),
      dataType: data && typeof data === 'object' && 'type' in data ? (data as { type: unknown }).type : null,
    });

    if (!data || typeof data !== 'object') return;

    const payload = data as { type?: number; name?: string; url?: string };

    if (payload.type === RiveEventType.OpenUrl) {
      console.warn('[LiveTarget][victory-rive][okay-click-detected]', {
        kind: 'open_url',
        url: payload.url ?? null,
        name: payload.name ?? null,
      });
      onOkay();
      return;
    }

    if (payload.type === RiveEventType.General) {
      console.warn('[LiveTarget][victory-rive][okay-click-detected]', {
        kind: 'general',
        name: payload.name ?? null,
      });
      onOkay();
      return;
    }

    console.warn('[LiveTarget][victory-rive][event]', {
      ignored: true,
      reason: 'unknown_rive_event_type',
      type: payload.type,
    });
  };

  rive.on(EventType.RiveEvent, handler);
  return () => {
    try {
      rive.off(EventType.RiveEvent, handler);
    } catch {
      /* rive may be torn down */
    }
  };
}
