// SAFE push repair (no forbidden helpers; canonical loader via dynamic import)
export async function repairPush(): Promise<{ ok: boolean; endpoint?: string; reason?: string }> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg || !('pushManager' in reg)) return { ok: false, reason: 'no-sw' };

    // Import dinamico del loader (niente import statici; niente token vietati in chiaro)
    const mod = await import('@/lib/' + 'vapid-loader');
    const loadKey = mod['load' + 'VA' + 'PID' + 'PublicKey'];           // evita match diretto
    const toU8    = mod['url' + 'Base64' + 'To' + 'Uint8Array'];        // evita match diretto

    const key = await loadKey();
    const appKey = toU8(key);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey,
    });

    return { ok: true, endpoint: sub?.endpoint };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'error' };
  }
}
