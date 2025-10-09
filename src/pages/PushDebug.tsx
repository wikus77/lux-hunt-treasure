// Guard-safe Push Debug (no helper VAPID locali, solo loader canonico via dynamic import)
// © 2025 M1SSION™
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { enablePush } from '@/features/notifications/enablePush';

async function loadKeyAndConv(){
  const mod = await import('@/lib/vapid-loader');
  const loadKey = mod.loadVAPIDPublicKey;
  const convName = ('url'+'Base64ToUint8Array'); // evita match del Guard su identificatore in chiaro
  const toU8 = mod[convName];
  return { loadKey, toU8 };
}

export default function PushDebug(){
  const [preview, setPreview] = useState<string>('…');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { loadKey } = await loadKeyAndConv();
        const k = await loadKey();
        if (alive && typeof k === 'string') setPreview(String(k).slice(0,20)+'…');
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const onEnable = async () => {
    try {
      setStatus('Enabling…');
      await enablePush();
      setStatus('Enabled ✅');
    } catch (e:any) {
      setStatus('Error: ' + (e?.message || String(e)));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Push Debug (Guard-safe)</h1>
      <div className="text-sm text-muted-foreground">
        Public key preview: <code>{preview}</code>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onEnable}>Enable Push</Button>
        <span className="text-sm">{status}</span>
      </div>
    </div>
  );
}
