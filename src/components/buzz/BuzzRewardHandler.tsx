// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BuzzRewardHandlerProps {
  onRewardRedeemed?: () => void;
}

export const BuzzRewardHandler: React.FC<BuzzRewardHandlerProps> = ({
  onRewardRedeemed
}) => {
  const { user } = useAuthContext();
  const processedRef = useRef(false);

  const removeFreeQueryParams = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('free');
      url.searchParams.delete('reward');
      window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''));
    } catch (e) {
      console.error('Error removing query params:', e);
    }
  };

  const redeemFreeBuzz = async () => {
    if (!user?.id) {
      toast.error('Devi essere loggato per usare il BUZZ gratuito');
      removeFreeQueryParams();
      return;
    }

    try {
      console.log('🎁 Riscatto BUZZ gratuito per user:', user.id);

      // 1) Consume a free buzz credit via RPC
      const { data: consumed, error: consumeErr } = await supabase.rpc('consume_credit', {
        p_user_id: user.id,
        p_credit_type: 'buzz',
        p_amount: 1
      });

      if (consumeErr || !consumed) {
        console.error('consume_credit error', consumeErr);
        toast.error('Nessun credito BUZZ disponibile');
        removeFreeQueryParams();
        return;
      }

      toast.success('🎁 BUZZ gratuito riscattato! Ora puoi premere il pulsante BUZZ.', {
        duration: 5000,
        position: 'top-center',
        style: { 
          zIndex: 9999,
          background: 'linear-gradient(135deg, #00FFFF 0%, #0084FF 100%)',
          color: 'white',
          fontWeight: 'bold'
        }
      });

      // Call callback if provided
      if (onRewardRedeemed) {
        onRewardRedeemed();
      }

    } catch (e) {
      console.error('redeemFreeBuzz exception', e);
      toast.error('Errore durante il riscatto gratuito');
    } finally {
      removeFreeQueryParams();
    }
  };

  useEffect(() => {
    if (processedRef.current) return;
    
    try {
      const params = new URLSearchParams(window.location.search);
      const isFree = params.get('free') === '1';
      const isReward = params.get('reward') === '1';

      if (isFree && isReward) {
        processedRef.current = true;
        console.log('🎁 Parametri free reward trovati, avvio riscatto...');
        redeemFreeBuzz();
      }
    } catch (e) {
      console.error('Error checking reward params:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
};
