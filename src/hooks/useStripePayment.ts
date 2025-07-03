
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface PaymentResult {
  success: boolean;
  error?: string;
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const processBuzzPurchase = async (isBuzzMap: boolean = false, amount: number): Promise<boolean> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
        body: {
          user_id: user.id,
          amount,
          is_buzz_map: isBuzzMap,
          currency: 'EUR'
        }
      });

      if (error) {
        console.error('Error processing payment:', error);
        toast.error('Errore nel processare il pagamento');
        return false;
      }

      if (data?.success) {
        toast.success('Pagamento completato con successo!');
        return true;
      } else {
        toast.error('Pagamento fallito');
        return false;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Errore nel processare il pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    processBuzzPurchase,
    loading
  };
};
