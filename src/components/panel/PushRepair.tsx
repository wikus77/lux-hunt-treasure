/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * Push Notification Repair Component - UI Only (delegates to utils)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { repairPush, sendSelfTest } from '@/utils/pushRepair';
import { Loader2, WrenchIcon, Send } from 'lucide-react';

export default function PushRepair() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log('[PushRepair]', message);
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleRepair = async () => {
    setIsRepairing(true);
    setLog([]);
    addLog('🔧 Starting push repair...');
    
    try {
      const result = await repairPush();
      
      if (result.supported && !result.hasSubscription) {
        addLog(`✅ Push riparato`);
        toast.success('Push riparato');
      } else {
        addLog(`❌ Errore riparazione`);
        toast.error('Errore riparazione');
      }

      addLog(`Details: ${JSON.stringify(result, null, 2)}`);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${message}`);
      toast.error(`Errore: ${message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleTestPush = async () => {
    setIsTesting(true);
    addLog('📨 Testing push notification...');
    
    try {
      const result = await sendSelfTest();
      
      if (result.ok) {
        addLog(`✅ Test inviato`);
        toast.success('Test inviato');
      } else {
        addLog(`❌ Test fallito`);
        toast.error('Test fallito');
      }

      addLog(`Details: ${JSON.stringify(result, null, 2)}`);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Test error: ${message}`);
      toast.error(`Errore: ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          onClick={handleRepair}
          disabled={isRepairing}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
        >
          {isRepairing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Riparazione...
            </>
          ) : (
            <>
              <WrenchIcon className="mr-2 h-4 w-4" />
              Ripara Notifiche
            </>
          )}
        </Button>

        <Button
          onClick={handleTestPush}
          disabled={isTesting}
          variant="outline"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Test Push
            </>
          )}
        </Button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 rounded border border-gray-800 max-h-64 overflow-y-auto">
          <div className="text-xs font-mono text-gray-400 space-y-1">
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
