// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// OneSignal Test Button for debugging notifications

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

export const OneSignalTestButton = () => {
  const testOneSignal = async () => {
    try {
      console.log('🔔 TESTING OneSignal...', {
        OneSignalInitialized: (window as any).OneSignalInitialized,
        OneSignalExists: !!(window as any).OneSignal,
        url: window.location.href
      });
      
      // Check if OneSignal is initialized
      if (!(window as any).OneSignalInitialized) {
        console.error('❌ OneSignal non inizializzato');
        toast.error('❌ OneSignal non inizializzato');
        return;
      }

      // Check permission
      const permission = await (window as any).OneSignal?.Notifications?.permission;
      console.log('🔔 Permission status:', permission);
      
      if (permission !== true) {
        toast.error('❌ Permessi notifiche non concessi');
        return;
      }

      // Get Player ID
      const playerId = await (window as any).OneSignal?.User?.PushSubscription?.id;
      console.log('🔔 Player ID:', playerId);
      
      if (!playerId) {
        toast.error('❌ Nessun Player ID trovato');
        return;
      }

      // Try to send a test notification via OneSignal API
      // Note: This would normally be done from the backend
      toast.success(`✅ OneSignal OK - Player ID: ${playerId.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ OneSignal test failed:', error);
      toast.error('❌ Test OneSignal fallito');
    }
  };

  const requestPermission = async () => {
    try {
      console.log('🔔 Requesting OneSignal permission...');
      
      if (!(window as any).OneSignalInitialized) {
        toast.error('❌ OneSignal non inizializzato');
        return;
      }

      await (window as any).OneSignal?.Notifications?.requestPermission();
      
      const permission = await (window as any).OneSignal?.Notifications?.permission;
      if (permission) {
        toast.success('✅ Permessi notifiche concessi!');
      } else {
        toast.error('❌ Permessi notifiche negati');
      }
      
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      toast.error('❌ Richiesta permessi fallita');
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 p-3 bg-black/80 rounded-lg border border-cyan-500/30">
      <div className="text-cyan-400 text-xs font-semibold mb-2">OneSignal Debug</div>
      <Button
        onClick={testOneSignal}
        variant="outline"
        size="sm"
        className="bg-black/70 border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 text-xs"
      >
        <CheckCircle className="h-3 w-3 text-green-400 mr-1" />
        Test OneSignal
      </Button>
      
      <Button
        onClick={requestPermission}
        variant="outline"
        size="sm"
        className="bg-black/70 border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 text-xs"
      >
        <Bell className="h-3 w-3 text-cyan-400 mr-1" />
        Richiedi Permessi
      </Button>
    </div>
  );
};

export default OneSignalTestButton;