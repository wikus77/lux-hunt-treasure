/**
 * Caricamento unico del .riv vittoria Live Target + log forensic [RIVE][forensic].
 * URL: su Capacitor WKWebView, path assoluto `/assets/...` va prefissato con window.location.origin
 * (es. capacitor://localhost) — document.baseURI da solo può essere insufficiente per fetch().
 */

import { Capacitor } from '@capacitor/core';

import rivUrl from '@/assets/rive/live-target-victory.riv';

import { RIVE_RUNTIME_META } from './riveRuntimeMeta';

/** SHA-256 atteso (Desktop RIVE ANIMAZIONE.riv = repo live-target-victory.riv). */
export const LIVE_TARGET_VICTORY_RIV_EXPECTED_SHA256 =
  'ac28145af24cfe0f5a6f19b39bbe9ddb9026352c7afc093cd9b948a00e818229';

export { rivUrl as LIVE_TARGET_VICTORY_RIV_VITE_URL };

export function logRiveRuntimeVersion(): void {
  console.warn('[RIVE][forensic][runtime-version]', {
    ...RIVE_RUNTIME_META,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    capacitorNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
  });
}

export function resolveVictoryRivFetchHref(importedPath: string): string {
  if (/^(https?:|capacitor:|ionic:)/i.test(importedPath)) {
    return importedPath;
  }
  if (typeof window !== 'undefined' && importedPath.startsWith('/') && window.location?.origin) {
    const href = `${window.location.origin}${importedPath}`;
    console.warn('[RIVE][forensic][asset-path]', {
      strategy: 'origin_plus_path',
      importedPath,
      href,
      origin: window.location.origin,
    });
    return href;
  }
  const base =
    typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : 'http://localhost/';
  const href = new URL(importedPath, base).href;
  console.warn('[RIVE][forensic][asset-path]', { strategy: 'new_URL_baseURI', importedPath, href, base });
  return href;
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const dig = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type VictoryRivLoadResult =
  | { ok: true; buffer: ArrayBuffer }
  | { ok: false; reason: string };

/**
 * Fetch + validazione magic RIVE + SHA-256. Log: asset-loaded, binary-ok, fetch-status.
 */
export async function loadLiveTargetVictoryRivBytes(): Promise<VictoryRivLoadResult> {
  logRiveRuntimeVersion();
  console.warn('[RIVE][forensic][bundle-output]', {
    viteAssetUrl: rivUrl,
    native: Capacitor.isNativePlatform(),
  });

  const href = resolveVictoryRivFetchHref(rivUrl);

  try {
    const res = await fetch(href);
    const ct = res.headers.get('content-type');
    const cl = res.headers.get('content-length');
    console.warn('[RIVE][forensic][fetch-status]', {
      ok: res.ok,
      status: res.status,
      contentType: ct,
      contentLength: cl,
      responseUrl: res.url,
    });

    const buf = await res.arrayBuffer();
    const u8 = new Uint8Array(buf.byteLength >= 4 ? buf.slice(0, 4) : buf);
    const magic =
      u8.length >= 4 ? String.fromCharCode(u8[0]!, u8[1]!, u8[2]!, u8[3]!) : '';

    let hashHex = '';
    try {
      hashHex = await sha256Hex(buf);
    } catch {
      /* subtle non disponibile */
    }

    console.warn('[RIVE][forensic][asset-loaded]', { byteLength: buf.byteLength, responseUrl: res.url });
    console.warn('[RIVE][forensic][binary-ok]', {
      magic,
      isRive: magic === 'RIVE',
      sha256: hashHex || null,
      matchesExpected: hashHex ? hashHex === LIVE_TARGET_VICTORY_RIV_EXPECTED_SHA256 : null,
    });

    if (!res.ok) {
      console.warn('[RIVE][forensic][parse-error]', { phase: 'http_not_ok', status: res.status });
      return { ok: false, reason: `http_${res.status}` };
    }
    if (magic !== 'RIVE') {
      const headUtf8 = new TextDecoder('utf-8', { fatal: false }).decode(
        buf.slice(0, Math.min(240, buf.byteLength))
      );
      console.warn('[RIVE][forensic][parse-error]', {
        phase: 'payload_not_rive_binary',
        headPreview: headUtf8.replace(/\s+/g, ' ').slice(0, 200),
      });
      return { ok: false, reason: 'not_rive_magic' };
    }

    return { ok: true, buffer: buf };
  } catch (e) {
    console.warn('[RIVE][forensic][parse-error]', { phase: 'fetch_throw', e });
    return { ok: false, reason: 'fetch_throw' };
  }
}
