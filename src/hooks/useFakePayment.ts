
import { useState } from 'react';
import { toast } from 'sonner';
import { useTestMode } from './useTestMode';

export const useFakePayment = () => {
  const { fakePaymentEnabled, isDeveloperUser } = useTestMode();
  const [processing, setProcessing] = useState(false);

  const simulateSuccessfulPayment = async (amount: number = 1.99): Promise<boolean> => {
    if (!fakePaymentEnabled || !isDeveloperUser) {
      console.warn('❌ Fake payment not enabled for this user');
      return false;
    }

    console.log('💳 FAKE PAYMENT: Simulazione pagamento in corso...', { amount });
    setProcessing(true);

    try {
      // Simula tempo di processing Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simula risposta positiva da Stripe
      const fakeStripeResponse = {
        id: `fake_payment_${Date.now()}`,
        amount: Math.round(amount * 100), // Centesimi
        currency: 'eur',
        status: 'succeeded',
        client_secret: `fake_pi_${Date.now()}_secret`,
        created: Math.floor(Date.now() / 1000)
      };

      console.log('✅ FAKE PAYMENT: Pagamento simulato completato', fakeStripeResponse);
      
      // Simula webhook completion
      localStorage.setItem('fake_payment_completed', 'true');
      localStorage.setItem('fake_subscription_active', 'true');
      localStorage.setItem('fake_payment_amount', amount.toString());
      
      toast.success('💳 Pagamento TEST completato', {
        description: `Importo: €${amount.toFixed(2)} (SIMULATO)`,
        duration: 3000
      });

      return true;
    } catch (error) {
      console.error('❌ FAKE PAYMENT: Errore simulazione', error);
      toast.error('Errore pagamento TEST');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const hasFakePaymentCompleted = (): boolean => {
    return fakePaymentEnabled && 
           localStorage.getItem('fake_payment_completed') === 'true';
  };

  const resetFakePayment = () => {
    localStorage.removeItem('fake_payment_completed');
    localStorage.removeItem('fake_subscription_active');
    localStorage.removeItem('fake_payment_amount');
    console.log('🔄 FAKE PAYMENT: Reset completato');
  };

  return {
    simulateSuccessfulPayment,
    hasFakePaymentCompleted,
    resetFakePayment,
    processing,
    fakePaymentEnabled
  };
};
