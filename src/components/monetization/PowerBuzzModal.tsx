/**
 * Power Buzz Modal — In-App Stripe Checkout for PULSE Contribution
 * Uses Stripe Elements for seamless inline payment (same pattern as M1UPaymentModal)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, X, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { getStripeSafe } from '@/lib/stripeFallback';

const stripePromise = getStripeSafe();

// Power Buzz pricing - €4.99 one-time
const POWER_BUZZ_PRICE_CENTS = 499;
const POWER_BUZZ_PRICE_EUR = 4.99;

interface PowerBuzzModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Checkout Form Component (uses Stripe Elements)
const PowerBuzzCheckoutForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { user } = useAuthContext();

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        console.log('[POWER BUZZ] Creating payment intent...');

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: POWER_BUZZ_PRICE_CENTS,
            currency: 'eur',
            payment_type: 'power_buzz',
            plan: 'POWER_BUZZ',
            description: 'Power Buzz™ - Contributo PULSE Globale',
            metadata: {
              type: 'power_buzz',
              user_email: user.email,
              user_id: user.id
            }
          }
        });

        if (error) {
          console.error('[POWER BUZZ] Payment intent error:', error);
          setError('Errore nella preparazione del pagamento');
          return;
        }

        const clientSecretValue = data?.client_secret || data?.clientSecret;
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
          console.log('[POWER BUZZ] ✅ Payment intent created');
        } else {
          console.error('[POWER BUZZ] No client secret received');
          setError('Errore nella configurazione del pagamento');
        }
      } catch (err) {
        console.error('[POWER BUZZ] Payment intent failed:', err);
        setError('Errore nel sistema di pagamento');
      }
    };

    createPaymentIntent();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Sistema di pagamento non pronto');
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Elemento carta non trovato');
      setLoading(false);
      return;
    }

    try {
      console.log('[POWER BUZZ] Confirming payment...');

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email || '',
          },
        },
      });

      if (paymentError) {
        console.error('[POWER BUZZ] Payment failed:', paymentError);
        setError(paymentError.message || 'Pagamento fallito');
        toast.error(`Pagamento fallito: ${paymentError.message || 'Errore sconosciuto'}`);
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('[POWER BUZZ] ✅ Payment succeeded:', paymentIntent.id);
        
        toast.success('⚡ Power Buzz Attivato!', {
          description: 'Grazie per il tuo contributo al PULSE globale!'
        });

        // Dispatch success event for any listeners
        window.dispatchEvent(new CustomEvent('powerBuzzPurchaseSucceeded', {
          detail: { paymentIntentId: paymentIntent.id }
        }));
        
        onSuccess();
      }
    } catch (err) {
      console.error('[POWER BUZZ] Payment processing error:', err);
      setError('Errore nel processare il pagamento');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Input */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-[#00D1FF]" />
          <span className="text-sm text-white/70">Carta di credito/debito</span>
        </div>
        <CardElement options={cardElementOptions} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-white/20 hover:bg-white/10"
          disabled={loading}
        >
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Elaborazione...
            </span>
          ) : (
            `Paga €${POWER_BUZZ_PRICE_EUR.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-white/50 pt-2 border-t border-white/10">
        <Shield className="w-3 h-3" />
        Pagamento sicuro elaborato da Stripe
      </div>
    </form>
  );
};

const PowerBuzzModal = ({ open, onOpenChange }: PowerBuzzModalProps) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuthContext();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowCheckout(false);
    }
  }, [open]);

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setShowCheckout(false);
  };

  const stripeOptions: StripeElementsOptions = {
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#00D1FF',
        colorBackground: '#000000',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="living-hud-glass max-w-md border-[#00D1FF]/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#00D1FF]/20 to-[#7C3AED]/20">
                <Zap className="h-6 w-6 text-[#00D1FF]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Power Buzz™
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  €{POWER_BUZZ_PRICE_EUR.toFixed(2)} - Pagamento unico
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {!showCheckout ? (
          // Benefits View
          <>
            <div className="space-y-3 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Contributo Diretto al PULSE
                  </p>
                  <p className="text-xs text-white/60">
                    Ogni Power Buzz incrementa l'energia globale
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Badge Pulse Contributor
                  </p>
                  <p className="text-xs text-white/60">
                    Riconoscimento esclusivo nel profilo agente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Boost DNA
                  </p>
                  <p className="text-xs text-white/60">
                    Incrementa tutti i parametri DNA di +5
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-semibold"
              >
                <Zap className="mr-2 h-4 w-4" />
                Attiva Power Buzz - €{POWER_BUZZ_PRICE_EUR.toFixed(2)}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full text-white/60 hover:text-white hover:bg-white/10"
              >
                Non ora
              </Button>
            </div>
          </>
        ) : (
          // Checkout View
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PowerBuzzCheckoutForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PowerBuzzModal;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
