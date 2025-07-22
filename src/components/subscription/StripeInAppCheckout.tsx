// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Stripe In-App Checkout Component - RESET COMPLETO 22/07/2025

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

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeInAppCheckoutProps {
  plan: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<{ 
  plan: string; 
  onSuccess: () => void; 
  onCancel: () => void;
}> = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { user } = useAuthContext();

  // Get plan details
  const getPlanDetails = (planName: string) => {
    switch (planName) {
      case 'Silver':
        return { amount: 399, name: 'M1SSION™ Silver', description: 'Piano Silver con vantaggi premium' };
      case 'Gold':
        return { amount: 799, name: 'M1SSION™ Gold', description: 'Piano Gold con accesso completo' };
      case 'Black':
        return { amount: 1299, name: 'M1SSION™ Black', description: 'Piano Black VIP esclusivo' };
      case 'Titanium':
        return { amount: 1999, name: 'M1SSION™ Titanium', description: 'Piano Titanium ultimate' };
      default:
        return { amount: 399, name: 'M1SSION™ Silver', description: 'Piano Silver' };
    }
  };

  const planDetails = getPlanDetails(plan);

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        console.log('🔥 M1SSION™ Creating payment intent for:', plan);
        
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            user_id: user.id,
            plan: plan,
            amount: planDetails.amount,
            currency: 'eur'
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
  }, [user, plan, planDetails.amount]);

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
        
        // Update subscription in database
        await supabase.functions.invoke('handle-payment-success', {
          body: {
            payment_intent_id: paymentIntent.id,
            user_id: user?.id,
            plan: plan
          }
        });

        toast.success(`🎉 Pagamento ${plan} completato!`);
        onSuccess();
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
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-center text-white">
          💳 Pagamento {plan}
        </CardTitle>
        <div className="text-center text-gray-300">
          <div className="text-xl font-bold">€{(planDetails.amount / 100).toFixed(2)}/mese</div>
          <div className="text-sm">{planDetails.description}</div>
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
              {loading ? 'Elaborazione...' : `Paga €${(planDetails.amount / 100).toFixed(2)}`}
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
  plan, 
  onSuccess, 
  onCancel 
}) => {
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          plan={plan} 
          onSuccess={onSuccess} 
          onCancel={onCancel} 
        />
      </Elements>
    </div>
  );
};

export default StripeInAppCheckout;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */