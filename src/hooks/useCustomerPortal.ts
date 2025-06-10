
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCustomerPortal = () => {
  const [loading, setLoading] = useState(false);

  const openCustomerPortal = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Errore nell\'apertura del portale clienti');
    } finally {
      setLoading(false);
    }
  };

  return {
    openCustomerPortal,
    loading
  };
};
