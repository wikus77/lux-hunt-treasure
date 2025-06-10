
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  stripe_pm_id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Errore nel caricamento dei metodi di pagamento');
    } finally {
      setLoading(false);
    }
  };

  const createSetupIntent = async () => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('setup-payment-method');
    if (error) throw error;
    return data;
  };

  const savePaymentMethod = async (paymentMethodId: string, isDefault = false) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.functions.invoke('save-payment-method', {
      body: { payment_method_id: paymentMethodId, is_default: isDefault }
    });

    if (error) throw error;
    await fetchPaymentMethods();
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.functions.invoke('delete-payment-method', {
      body: { payment_method_id: paymentMethodId }
    });

    if (error) throw error;
    await fetchPaymentMethods();
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      // Update all to non-default first
      const { error: updateError } = await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Set the selected one as default
      const { error: setDefaultError } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id);

      if (setDefaultError) throw setDefaultError;

      await fetchPaymentMethods();
      toast.success('Metodo di pagamento predefinito aggiornato');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Errore nell\'impostazione del metodo predefinito');
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    loading,
    createSetupIntent,
    savePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refetch: fetchPaymentMethods
  };
};
