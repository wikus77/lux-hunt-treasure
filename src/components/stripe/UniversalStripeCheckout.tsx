// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Checkout Component - RESET COMPLETO 22/07/2025

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
import { X } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51QJTb3Rp5StPxaresB9CgVPkOPEGTi5KwJLwJTl67TKH6Uu7r6k5LNZJ4x7VQVKH5yFCHgC7JYGVw1XGdW8LBDEp004jqfJJTf');

export interface UniversalStripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: 'subscription' | 'buzz' | 'buzz_map';
  planName: string;
  amount: number; // In cents
  description?: string;
  isBuzzMap?: boolean;
  onSuccess?: () => void;
}

const CheckoutForm: React.FC<{
  paymentType: 'subscription' | 'buzz' | 'buzz_map';
  planName: string;
  amount: number;
  description?: string;
  isBuzzMap?: boolean;
  onSuccess?: () => void;
  onCancel: () => void;
}> = ({ paymentType, planName, amount, description, isBuzzMap, onSuccess, onCancel }) => {
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
        console.log(`🔥 M1SSION™ Creating ${paymentType} payment intent:`, { planName, amount });
        
        const body = paymentType === 'subscription' 
          ? {
              user_id: user.id,
              plan: planName,
              amount: amount,
              currency: 'eur',
              payment_type: paymentType
            }
          : {
              user_id: user.id,
              amount: amount / 100, // Convert back to euros for buzz payments
              is_buzz_map: isBuzzMap || paymentType === 'buzz_map',
              currency: 'EUR',
              payment_type: paymentType
            };

        const { data, error } = await supabase.functions.invoke('create-payment-intent', { body });

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
  }, [user, paymentType, planName, amount, isBuzzMap]);

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
        
        // Call appropriate success handler based on payment type
        let successFunction = '';
        let successBody = {};
        
        if (paymentType === 'subscription') {
          successFunction = 'handle-payment-success';
          successBody = {
            payment_intent_id: paymentIntent.id,
            user_id: user?.id,
            plan: planName
          };
        } else if (paymentType === 'buzz_map') {
          successFunction = 'handle-buzz-payment-success';
          successBody = {
            payment_intent_id: paymentIntent.id,
            user_id: user?.id,
            amount: amount / 100,
            is_buzz_map: true,
            payment_type: paymentType
          };
        } else if (paymentType === 'buzz') {
          // Per BUZZ normale, usa la nuova funzione
          successFunction = 'handle-buzz-checkout-success';
          successBody = {
            payment_intent_id: paymentIntent.id,
            user_id: user?.id,
            amount: amount / 100,
            payment_type: paymentType
          };
        }

        console.log(`🎯 Calling ${successFunction} with:`, successBody);
        const { data: successData, error: successError } = await supabase.functions.invoke(successFunction, { 
          body: successBody 
        });
        
        if (successError) {
          console.error('❌ Success handler error:', successError);
          toast.error('Pagamento completato ma errore nel processare il risultato');
        } else {
          console.log('✅ Success handler completed:', successData);
        }

        const paymentTypeText = paymentType === 'subscription' ? planName : (paymentType === 'buzz_map' ? 'BUZZ Map' : 'BUZZ');
        toast.success(`🎉 Pagamento ${paymentTypeText} completato!`);
        
        if (onSuccess) {
          onSuccess();
        }
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

  const getTitle = () => {
    switch (paymentType) {
      case 'subscription':
        return `💳 Abbonamento ${planName}`;
      case 'buzz_map':
        return '🗺️ BUZZ Map';
      case 'buzz':
        return '⚡ BUZZ Extra';
      default:
        return '💳 Pagamento';
    }
  };

  const getDescription = () => {
    if (description) return description;
    
    switch (paymentType) {
      case 'subscription':
        return `Piano ${planName} con vantaggi premium`;
      case 'buzz_map':
        return 'Genera area di ricerca sulla mappa';
      case 'buzz':
        return 'Indizio extra per la missione';
      default:
        return 'Pagamento M1SSION™';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">
            {getTitle()}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center text-gray-300">
          <div className="text-xl font-bold">€{(amount / 100).toFixed(2)}</div>
          <div className="text-sm">{getDescription()}</div>
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
              {loading ? 'Elaborazione...' : `Paga €${(amount / 100).toFixed(2)}`}
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

const UniversalStripeCheckout: React.FC<UniversalStripeCheckoutProps> = ({ 
  isOpen,
  onClose,
  paymentType,
  planName, 
  amount,
  description,
  isBuzzMap,
  onSuccess 
}) => {
  if (!isOpen) return null;

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
          paymentType={paymentType}
          planName={planName}
          amount={amount}
          description={description}
          isBuzzMap={isBuzzMap}
          onSuccess={() => {
            onClose();
            if (onSuccess) onSuccess();
          }}
          onCancel={onClose}
        />
      </Elements>
    </div>
  );
};

export default UniversalStripeCheckout;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */