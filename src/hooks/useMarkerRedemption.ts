// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RedemptionError {
  code: string;
  message: string;
  httpStatus?: number;
}

interface RedemptionResult {
  success: boolean;
  receipt_id?: string;
  code?: string;
  httpStatus?: number;
  nextRoute?: string;
}

export const useMarkerRedemption = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RedemptionError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const claimReward = async (markerId: string): Promise<RedemptionResult> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.info('M1MARK-TRACE: REDEEM_REQUESTED', { marker_id: markerId });

      const { data, error: invokeError } = await supabase.functions.invoke('claim-marker-reward', {
        body: { markerId }
      });

      // Handle network/invoke errors
      if (invokeError) {
        const errorResult = {
          code: 'NETWORK_ERROR',
          message: 'Errore di connessione',
          httpStatus: invokeError.status || 500
        };
        
        setError(errorResult);
        toast.error(errorResult.message);
        
        console.error('M1MARK-TRACE: REDEEM_ERROR', { 
          marker_id: markerId, 
          code: errorResult.code, 
          httpStatus: errorResult.httpStatus,
          error: invokeError
        });
        
        return { success: false, ...errorResult };
      }

      // Handle specific response codes
      if (data?.status === 'error') {
        let errorResult: RedemptionError;
        
        switch (data.error) {
          case 'unauthorized':
            errorResult = { code: 'UNAUTHORIZED', message: 'Accesso negato', httpStatus: 401 };
            // Redirect to login for unauthorized users
            window.location.href = '/login';
            break;
          case 'out_of_range':
            errorResult = { code: 'OUT_OF_RANGE', message: 'Troppo lontano dal marker', httpStatus: 403 };
            break;
          case 'already_claimed':
            errorResult = { code: 'ALREADY_CLAIMED', message: 'Premio già riscattato', httpStatus: 409 };
            break;
          case 'expired':
            errorResult = { code: 'EXPIRED', message: 'Marker scaduto', httpStatus: 410 };
            break;
          case 'inactive':
            errorResult = { code: 'INACTIVE', message: 'Marker non attivo', httpStatus: 423 };
            break;
          case 'rate_limited':
            errorResult = { code: 'RATE_LIMITED', message: 'Troppi tentativi', httpStatus: 429 };
            break;
          default:
            errorResult = { code: 'UNKNOWN_ERROR', message: data.detail || 'Errore sconosciuto', httpStatus: 500 };
        }
        
        setError(errorResult);
        
        // Only show error toast for non-already-claimed errors
        if (errorResult.code !== 'ALREADY_CLAIMED') {
          toast.error(errorResult.message);
        } else {
          toast.info(errorResult.message);
        }
        
        console.error('M1MARK-TRACE: REDEEM_ERROR', { 
          marker_id: markerId, 
          code: errorResult.code, 
          httpStatus: errorResult.httpStatus 
        });
        
        return { success: false, ...errorResult };
      }

      // Handle success
      if (data?.ok) {
        setIsSuccess(true);
        toast.success('Premio riscattato con successo! 🎉');
        
        console.info('M1MARK-TRACE: REDEEM_SUCCESS', { 
          marker_id: markerId, 
          receipt_id: data.receipt_id || 'unknown',
          rewards_count: data.rewards || 0,
          nextRoute: data.nextRoute
        });
        
        return { 
          success: true, 
          receipt_id: data.receipt_id,
          nextRoute: data.nextRoute
        };
      }

      // Handle specific status responses
      if (data?.code === 'ALREADY_CLAIMED') {
        const errorResult = { code: 'ALREADY_CLAIMED', message: 'Premio già riscattato', httpStatus: 409 };
        setError(errorResult);
        toast.info(errorResult.message);
        
        console.info('M1MARK-TRACE: REDEEM_ALREADY_CLAIMED', { marker_id: markerId });
        return { success: false, ...errorResult };
      }

      if (data?.code === 'NO_REWARD') {
        const errorResult = { code: 'NO_REWARD', message: 'Nessun premio configurato', httpStatus: 404 };
        setError(errorResult);
        toast.error(errorResult.message);
        
        console.error('M1MARK-TRACE: REDEEM_ERROR', { 
          marker_id: markerId, 
          code: errorResult.code, 
          httpStatus: errorResult.httpStatus 
        });
        
        return { success: false, ...errorResult };
      }

      // Unknown response format
      const errorResult = { code: 'UNKNOWN_RESPONSE', message: 'Risposta non riconosciuta', httpStatus: 500 };
      setError(errorResult);
      toast.error(errorResult.message);
      
      console.error('M1MARK-TRACE: REDEEM_ERROR', { 
        marker_id: markerId, 
        code: errorResult.code, 
        response: data 
      });
      
      return { success: false, ...errorResult };

    } catch (err) {
      const errorResult = { 
        code: 'EXCEPTION', 
        message: 'Errore imprevisto', 
        httpStatus: 500 
      };
      
      setError(errorResult);
      toast.error(errorResult.message);
      
      console.error('M1MARK-TRACE: REDEEM_ERROR', { 
        marker_id: markerId, 
        code: errorResult.code, 
        exception: err 
      });
      
      return { success: false, ...errorResult };
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  };

  return {
    claimReward,
    isLoading,
    error,
    isSuccess,
    resetState
  };
};