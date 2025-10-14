// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Center - Notification repair and management

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { repairPush, sendSelfTest, getPushStatus } from '@/utils/pushRepair';
import { Loader2, Bell, WrenchIcon, Send, AlertTriangle, CheckCircle } from 'lucide-react';

export const PushCenter: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const s = await getPushStatus();
      setStatus(s);
    } catch (error) {
      console.error('Failed to load push status:', error);
      toast.error('Errore nel caricamento dello stato');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      const result = await repairPush();
      if (result.supported && !result.hasSubscription) {
        toast.success('Push riparato');
        await loadStatus(); // Refresh status
      } else {
        toast.error('Errore riparazione');
      }
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const result = await sendSelfTest();
      if (result.ok) {
        toast.success('Test inviato');
      } else {
        toast.error(`Test fallito (status: ${result.status ?? 500})`);
      }
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (isOk: boolean) => isOk ? 'bg-green-500' : 'bg-red-500';
  const isFullyConfigured = status && 
    status.permission === 'granted' && 
    status.swRegistered && 
    status.subscriptionPresent && 
    status.jwtPresent && 
    status.vapidValid;

  const isIOSSafari = navigator.userAgent.includes('Safari') && 
                      !navigator.userAgent.includes('Chrome') &&
                      /iPhone|iPad|iPod/.test(navigator.userAgent);

  return (
    <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Center
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Indicators */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.permission === 'granted')}`} />
                <span className="text-sm text-white/80">Permission</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.swRegistered)}`} />
                <span className="text-sm text-white/80">Service Worker</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.subscriptionPresent)}`} />
                <span className="text-sm text-white/80">Subscription</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.jwtPresent)}`} />
                <span className="text-sm text-white/80">JWT</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.vapidValid)}`} />
                <span className="text-sm text-white/80">VAPID</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isFullyConfigured ? "default" : "destructive"} className="text-xs">
                  {status?.platform}
                </Badge>
              </div>
            </div>

            {/* iOS Safari Warning */}
            {isIOSSafari && status?.permission !== 'granted' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-xs text-yellow-200">
                    <strong>iOS Safari:</strong> Installa l'app alla Home Screen (PWA) per ricevere notifiche (iOS 16.4+)
                  </div>
                </div>
              </div>
            )}

            {/* Permission Denied Warning */}
            {status?.permission === 'denied' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
                <div className="text-xs text-red-200">
                  <strong>Permesso negato.</strong> Vai nelle impostazioni del browser e abilita le notifiche per m1ssion.eu
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleRepair}
                disabled={isRepairing}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
              >
                {isRepairing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Riparazione...
                  </>
                ) : (
                  <>
                    <WrenchIcon className="w-4 h-4 mr-2" />
                    Ripara
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendTest}
                disabled={isSending || !isFullyConfigured}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
            </div>

            {/* Success Message */}
            {isFullyConfigured && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sistema push attivo e configurato</span>
                </div>
              </div>
            )}

            {/* Diagnostic Link */}
            <div className="pt-2 border-t border-white/10">
              <a 
                href="/push-diagnosi" 
                className="text-xs text-cyan-400 hover:text-cyan-300 underline inline-block"
              >
                🔍 Apri diagnostica completa →
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
