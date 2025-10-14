import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { registerPush } from '@/lib/push/register-push';

// Local helpers (no longer exported by register-push)
function checkPushSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

async function requestNotificationPermission(): Promise<boolean> {
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export const PushRegistrationTest: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('idle');

  const onCheck = () => {
    const ok = checkPushSupport();
    setStatus(ok ? 'supported' : 'not_supported');
    toast[ok ? 'success' : 'error'](ok ? 'Push support OK' : 'Push not supported on this device');
  };

  const onAskPerm = async () => {
    const granted = await requestNotificationPermission();
    setStatus(granted ? 'permission_granted' : 'permission_denied');
    toast[granted ? 'success' : 'error'](granted ? 'Permission granted' : 'Permission denied');
  };

  const onRegister = async () => {
    try {
      setStatus('registering');
      const reg = await navigator.serviceWorker.ready;
      const res = await registerPush(reg);
      setStatus('registered');
      toast.success('Registered for push');
      console.log('registerPush() result:', res);
    } catch (e) {
      setStatus('error');
      console.error(e);
      toast.error('Failed to register push');
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">User: {user?.id ?? 'anon'}</div>
      <div className="text-sm">Status: <code>{status}</code></div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCheck}>Check support</Button>
        <Button variant="secondary" onClick={onAskPerm}>Ask permission</Button>
        <Button onClick={onRegister}>Register push</Button>
      </div>
    </div>
  );
};
