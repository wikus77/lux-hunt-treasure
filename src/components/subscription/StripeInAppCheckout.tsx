// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Checkout Component with Saved Card Support

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { PaymentConfig } from '@/hooks/useStripeInAppPayment';
import SavedCardPayment from '@/components/payments/SavedCardPayment';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeInAppCheckoutProps {
  config: PaymentConfig;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<{ 
  config: PaymentConfig;
  onSuccess: (paymentIntentId: string) => void; 
  onCancel: () => void;
}> = ({ config, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { user } = useAuthContext();

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        console.log('🔥 M1SSION™ Creating payment intent for:', config.type, config);
        
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            user_id: user.id,
            plan: config.plan || config.type,
            amount: config.amount,
            currency: config.currency || 'eur',
            payment_type: config.type,
            description: config.description,
            metadata: config.metadata
          }
        });

        if (error) {
          console.error('❌ M1SSION™ Payment intent error:', error);
          toast.error('Errore nella creazione del pagamento');
          return;
        }

        if (data?.client_secret) {
          setClientSecret(data.client_secret);
          console.log('✅ M1SSION™ Payment intent created successfully');
        }
      } catch (error) {
        console.error('❌ M1SSION™ Payment intent failed:', error);
        toast.error('Errore nel sistema di pagamento');
      }
    };

    createPaymentIntent();
  }, [user, config]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Sistema di pagamento non pronto');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Elemento carta non trovato');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 M1SSION™ Processing payment...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email || '',
          },
        },
      });

      if (error) {
        console.error('❌ M1SSION™ Payment failed:', error);
        toast.error(`Pagamento fallito: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ M1SSION™ Payment succeeded:', paymentIntent.id);
        
        // Call parent success handler with payment intent ID
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('❌ M1SSION™ Payment processing error:', error);
      toast.error('Errore nel processare il pagamento');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 max-h-[85vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-center text-white">
          💳 {config.type === 'subscription' ? `Abbonamento ${config.plan}` : config.type === 'buzz_map' ? 'BUZZ MAPPA' : 'BUZZ Payment'}
        </CardTitle>
        <div className="text-center text-gray-300">
          <div className="text-xl font-bold">
            €{(config.amount / 100).toFixed(2)}
            {config.type === 'subscription' ? '/mese' : ''}
          </div>
          <div className="text-sm">{config.description}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <CardElement options={cardElementOptions} />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={!stripe || loading || !clientSecret}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Elaborazione...' : `Paga €${(config.amount / 100).toFixed(2)}`}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-gray-400 text-center">
          🔒 Pagamento sicuro elaborato da Stripe
        </div>
      </CardContent>
    </Card>
  );
};

const StripeInAppCheckout: React.FC<StripeInAppCheckoutProps> = ({ 
  config, 
  onSuccess, 
  onCancel 
}) => {
  const [useSavedCard, setUseSavedCard] = useState(true);

  const options: StripeElementsOptions = {
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#8b5cf6',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" 
         style={{ 
           paddingTop: 'calc(env(safe-area-inset-top, 47px) + 20px)',
           paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
           maxHeight: '100dvh'
         }}>
      {useSavedCard ? (
        <SavedCardPayment
          config={config}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            config={config} 
            onSuccess={onSuccess} 
            onCancel={onCancel} 
          />
        </Elements>
      )}
    </div>
  );
};

export default StripeInAppCheckout;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ - Universal Checkout with Saved Card Auto-Prefill
 */