// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Checkout Component with Saved Card Support
// @ts-nocheck

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
import { PaymentErrorHandler } from '@/utils/paymentErrorHandler';
import { useStripeMode } from '@/hooks/useStripeMode';

// Initialize Stripe using fallback for better compatibility
import { getStripeSafe } from '@/lib/stripeFallback';
const stripePromise = getStripeSafe();

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
  const { mode: stripeMode, loading: modeLoading } = useStripeMode();

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        console.log('🔥 M1SSION™ Creating payment intent for:', config.type, config);

        console.log('🔧 M1SSION™ Using Stripe mode:', stripeMode);
        
        // Call the correct edge function with the exact body format
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: config.amount, // Already in cents
            currency: 'eur',
            payment_type: 'buzz_map',
            plan: 'one_time'
          }
        });

        if (error) {
          console.error('❌ M1SSION™ Payment intent error:', error);
          
          // Handle specific error codes
          if (error.code === 'not_authenticated' || error.message?.includes('401')) {
            toast.error('Devi accedere per effettuare pagamenti. Reindirizzamento al login...');
            // Save current URL for post-login redirect
            try {
              localStorage.setItem('post_login_redirect', window.location.pathname);
            } catch (e) {
              console.warn('Could not save redirect URL');
            }
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
            return;
          } else if (error.code === 'card_declined') {
            toast.error(`Carta rifiutata: ${error.message}`);
            return;
          } else if (error.message?.includes('mismatch')) {
            toast.error(`Errore configurazione Stripe: ${error.message}`);
            return;
          } else {
            toast.error(`Errore pagamento: ${error.message || 'Errore sconosciuto'} (${error.code || 'unknown'})`);
            return;
          }
        }

        // Read client_secret from server response (always prefer client_secret over clientSecret)
        const clientSecretValue = data?.client_secret || data?.clientSecret;
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
          console.debug('✅ M1SSION™ Payment intent created:', {
            functionName: 'create-payment-intent',
            amount: config.amount,
            mode: data?.mode,
            paymentIntentId: data?.paymentIntentId || data?.payment_intent_id
          });
        } else {
          console.error('❌ M1SSION™ No client secret received:', data);
          toast.error('Errore nella configurazione del pagamento');
          return;
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

      console.log('🚀 M1SSION™ Confirming payment with mode:', stripeMode);

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
        const errorCode = error.code || 'unknown';
        const errorMessage = error.message || 'Errore sconosciuto';
        toast.error(`Pagamento fallito: ${errorMessage} (${errorCode})`);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ M1SSION™ Payment succeeded:', paymentIntent.id);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('paymentIntentSucceeded', {
          detail: { paymentIntentId: paymentIntent.id }
        }));
        
        // Call parent success handler
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
  const [useSavedCard, setUseSavedCard] = useState(false);
  const { user, isLoading: authLoading } = useAuthContext();

  // Preventive login check - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.warn('⚠️ M1SSION™ User not authenticated - redirecting to login');
      toast.error('Devi accedere per effettuare pagamenti. Reindirizzamento al login...');
      
      // Save current URL for post-login redirect
      try {
        localStorage.setItem('post_login_redirect', window.location.pathname);
      } catch (e) {
        console.warn('Could not save redirect URL');
      }
      
      // Close modal and redirect
      setTimeout(() => {
        onCancel();
        window.location.href = '/login';
      }, 1500);
    }
  }, [user, authLoading, onCancel]);

  // Check for saved default payment method on mount
  useEffect(() => {
    const checkDefaultPaymentMethod = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (!error && data) {
          console.log('✅ M1SSION™ Default payment method found - enabling auto-fill');
          setUseSavedCard(true);
        } else {
          console.log('ℹ️ M1SSION™ No default payment method - using manual entry');
          setUseSavedCard(false);
        }
      } catch (error) {
        console.error('❌ M1SSION™ Error checking default payment method:', error);
        setUseSavedCard(false);
      }
    };

    checkDefaultPaymentMethod();
  }, [user]);

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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto" 
         style={{ 
           paddingTop: 'calc(env(safe-area-inset-top, 47px) + 20px)',
           paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
           maxHeight: '100dvh'
         }}>
      {/* DEBUG: Modal should be visible with this high z-index */}
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