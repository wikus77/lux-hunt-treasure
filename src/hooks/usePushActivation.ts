/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Hook per attivazione push notifications
 */

import { useState } from 'react';
import { repairPush } from '@/utils/pushRepair';
import { toast } from 'sonner';

export interface PushActivationState {
  isActivating: boolean;
  isActivated: boolean;
  error: string | null;
}

export const usePushActivation = () => {
  const [state, setState] = useState<PushActivationState>({
    isActivating: false,
    isActivated: false,
    error: null,
  });

  const activate = async () => {
    setState(prev => ({ ...prev, isActivating: true, error: null }));

    try {
      const result = await repairPush();
      
      if (result.success) {
        setState({
          isActivating: false,
          isActivated: true,
          error: null,
        });
        
        toast.success("✅ Notifiche attivate", {
          description: "Riceverai gli aggiornamenti M1SSION™ in tempo reale",
        });
        
        return { success: true };
      } else {
        const errorMsg = result.message || result.reason || 'Attivazione fallita';
        setState({
          isActivating: false,
          isActivated: false,
          error: errorMsg,
        });
        
        toast.error("❌ Attivazione fallita", {
          description: errorMsg,
        });
        
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Errore imprevisto';
      setState({
        isActivating: false,
        isActivated: false,
        error: errorMsg,
      });
      
      toast.error("❌ Errore", {
        description: errorMsg,
      });
      
      return { success: false, error: errorMsg };
    }
  };

  return {
    ...state,
    activate,
  };
};
