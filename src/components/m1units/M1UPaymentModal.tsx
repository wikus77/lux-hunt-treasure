/**
 * M1U Payment Modal — In-App Checkout for M1 UNITS™
 * 
 * 🏪 STORE COMPLIANCE (29/01/2026):
 * - Uses REAL Dialog component (not fake div overlay)
 * - Stripe checkout on WEB only
 * - Native platforms use Apple IAP / Google Play Billing
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { X, ShoppingCart, AlertCircle, CreditCard, Smartphone } from 'lucide-react';
import { getStripeSafe } from '@/lib/stripeFallback';
import { isStripeAvailable } from '@/lib/stripe/stripeClient';
import { isCapacitorNative, getCapacitorPlatform } from '@/utils/capacitor';

const stripePromise = getStripeSafe();

interface M1UPaymentModalProps {
  isOpen: boolean;
  packName: string;
  packCode: string;
  m1uAmount: number;
  priceEur: number;
  priceCents: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Stripe Checkout Content for Web
const StripeCheckoutContent: React.FC<{ 
  packCode: string;
  m1uAmount: number;
  priceCents: number;
  onSuccess: () => void; 
  onCancel: () => void;
}> = ({ packCode, m1uAmount, priceCents, onSuccess, onCancel }) => {
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
        console.log('[M1U MODAL] Creating payment intent:', { packCode, m1uAmount, priceCents });

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: priceCents,
            currency: 'eur',
            payment_type: 'm1u_purchase',
            plan: packCode,
            description: `M1 UNITS™ ${packCode} - ${m1uAmount} M1U`,
            metadata: {
              pack_code: packCode,
              m1u_amount: String(m1uAmount),
              user_email: user.email || '',
              user_id: user.id
            }
          }
        });

        if (error) {
          console.error('[M1U MODAL] Payment intent error:', error);
          toast.error(`Errore: ${error.message || 'Creazione pagamento fallita'}`);
          return;
        }

        const clientSecretValue = data?.client_secret || data?.clientSecret;
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
          console.log('[M1U MODAL] ✅ Payment intent created');
        } else {
          toast.error('Errore nella configurazione del pagamento');
        }
      } catch (error) {
        console.error('[M1U MODAL] Payment intent failed:', error);
        toast.error('Errore nel sistema di pagamento');
      }
    };

    createPaymentIntent();
  }, [user, packCode, m1uAmount, priceCents]);

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
      console.log('[M1U MODAL] Confirming payment...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email || '',
          },
        },
      });

      if (error) {
        console.error('[M1U MODAL] Payment failed:', error);
        toast.error(`Pagamento fallito: ${error.message || 'Errore sconosciuto'}`);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('[M1U MODAL] ✅ Payment succeeded:', paymentIntent.id);
        
        // 🔥 CRITICAL: Call Edge Function to credit M1U BEFORE showing success
        console.log('[M1U MODAL] 💰 Calling credit-m1u-purchase to credit M1U...');
        
        try {
          const { data: creditData, error: creditError } = await supabase.functions.invoke('credit-m1u-purchase', {
            body: {
              payment_intent_id: paymentIntent.id,
              user_id: user?.id,
              m1u_amount: m1uAmount,
              pack_code: packCode
            }
          });

          if (creditError) {
            console.error('[M1U MODAL] ❌ Failed to credit M1U:', creditError);
            toast.error('Pagamento ricevuto ma errore nell\'accredito M1U. Contatta il supporto.', {
              description: `Riferimento: ${paymentIntent.id}`
            });
            return;
          }

          if (creditData?.success) {
            console.log('[M1U MODAL] ✅ M1U credited successfully:', creditData);
            
            // 🎰 NO TOAST - Let the slot machine animation show the success!
            // The M1UPill component will handle the visual feedback

            // Dispatch success event ONLY after M1U are credited
            window.dispatchEvent(new CustomEvent('m1uPurchaseSucceeded', {
              detail: { 
                paymentIntentId: paymentIntent.id,
                packCode,
                m1uAmount,
                newBalance: creditData.new_balance
              }
            }));
            
            onSuccess();
          } else {
            console.error('[M1U MODAL] ❌ Credit returned false:', creditData);
            toast.error('Errore nell\'accredito M1U. Contatta il supporto.', {
              description: creditData?.error || `Riferimento: ${paymentIntent.id}`
            });
          }
        } catch (creditException) {
          console.error('[M1U MODAL] ❌ Exception crediting M1U:', creditException);
          toast.error('Errore nell\'accredito M1U. Contatta il supporto.', {
            description: `Riferimento: ${paymentIntent.id}`
          });
        }
      }
    } catch (error) {
      console.error('[M1U MODAL] Payment processing error:', error);
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
        '::placeholder': { color: '#aab7c4' },
        backgroundColor: 'transparent',
      },
      invalid: { color: '#fa755a', iconColor: '#fa755a' },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card input */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-2">
          <CreditCard className="w-5 h-5 text-[#00D1FF]" />
          <span className="text-white/80 text-sm">Carta di credito</span>
        </div>
        
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <CardElement options={cardElementOptions} />
        </div>
        
        <Button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className="w-full h-12 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-bold text-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Elaborazione...
            </span>
          ) : (
            `Paga €${(priceCents / 100).toFixed(2)}`
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="w-full text-white/60 hover:text-white"
        >
          Annulla
        </Button>
      </form>
      
      <p className="text-xs text-white/40 text-center pt-2 border-t border-white/10">
        🔒 Pagamento sicuro elaborato da Stripe
      </p>
    </div>
  );
};

// 🏪 STORE COMPLIANT: Native IAP Checkout Content (for Dialog)
import { useIAP, getProductByCode } from '@/iap';

const IAP_INIT_TIMEOUT_MS = 15000;

const NativeIAPCheckoutContent: React.FC<{
  packName: string;
  packCode: string;
  m1uAmount: number;
  priceEur: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ packName, packCode, m1uAmount, priceEur, onSuccess, onCancel }) => {
  const platform = getCapacitorPlatform();
  const { 
    status, 
    products, 
    error, 
    isIAPReady, 
    purchase, 
    initIAP,
    isNativeIAPAvailable 
  } = useIAP();
  const [purchasing, setPurchasing] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const mappedProduct = getProductByCode(packCode);
  const productMappingError = !mappedProduct 
    ? `Prodotto non trovato: ${packCode}`
    : null;

  const expectedStoreId = mappedProduct 
    ? (platform === 'ios' ? mappedProduct.appleProductId : mappedProduct.googleProductId)
    : null;

  useEffect(() => {
    console.log('[Native IAP] 🛒 Checkout opened:', { packCode, platform, expectedStoreId });
  }, [packCode, platform, expectedStoreId]);

  useEffect(() => {
    if (initAttempted || !isNativeIAPAvailable() || productMappingError) return;
    
    setInitAttempted(true);
    setLocalError(null);
    
    const timeoutId = setTimeout(() => {
      if (status === 'initializing' || status === 'idle') {
        setInitTimedOut(true);
        setLocalError('Connessione allo store scaduta.');
      }
    }, IAP_INIT_TIMEOUT_MS);
    
    initIAP()
      .then(success => {
        clearTimeout(timeoutId);
        if (!success) setLocalError('Impossibile connettersi allo store.');
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setLocalError('Errore di connessione allo store.');
      });
    
    return () => clearTimeout(timeoutId);
  }, [initAttempted, initIAP, isNativeIAPAvailable, productMappingError, status]);

  const storeProduct = products.find(p => p.productId === expectedStoreId);
  const displayPrice = storeProduct?.localizedPrice || `€${priceEur.toFixed(2)}`;

  const handlePurchase = async () => {
    if (!isIAPReady || purchasing || productMappingError) return;
    setPurchasing(true);
    setLocalError(null);
    
    try {
      const result = await purchase(packCode);
      if (result.success) {
        toast.success(`✅ ${m1uAmount} M1U aggiunti!`);
        onSuccess();
      } else {
        setLocalError(result.error || 'Acquisto non completato');
      }
    } catch {
      setLocalError('Errore durante l\'acquisto.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRetry = () => {
    setInitAttempted(false);
    setInitTimedOut(false);
    setLocalError(null);
  };

  const isLoading = status === 'initializing' || status === 'purchasing' || status === 'validating';
  const hasError = !!(error || localError || productMappingError || initTimedOut);

  return (
    <div className="space-y-4">
      {/* Error state */}
      {hasError && (
        <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium mb-2">
            {localError || error || productMappingError || 'Errore connessione store'}
          </p>
          <p className="text-white/50 text-xs mb-4">
            {platform === 'ios' 
              ? 'Prodotti IAP in configurazione su App Store Connect.'
              : 'Prodotti in configurazione su Google Play Console.'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} variant="outline" size="sm">
              Riprova
            </Button>
            <Button onClick={onCancel} variant="ghost" size="sm">
              Chiudi
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!hasError && status === 'initializing' && (
        <div className="text-center p-6">
          <div className="w-8 h-8 border-2 border-[#00D1FF]/30 border-t-[#00D1FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/70">Connessione allo store...</p>
        </div>
      )}

      {/* Ready to purchase */}
      {!hasError && isIAPReady && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-xl">
            <Smartphone className="w-6 h-6 text-[#00D1FF]" />
            <span className="text-white/80">
              {platform === 'ios' ? 'Apple Pay / Carta' : 'Google Pay / Carta'}
            </span>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={purchasing || isLoading || !storeProduct}
            className="w-full h-12 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-bold text-lg"
          >
            {purchasing ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Elaborazione...
              </span>
            ) : (
              <>Paga {displayPrice}</>
            )}
          </Button>

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-white/60 hover:text-white"
          >
            Annulla
          </Button>
        </div>
      )}

      {/* Idle - need to connect */}
      {!hasError && !isIAPReady && status !== 'initializing' && (
        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            className="w-full h-12 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-bold"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Connetti allo Store
          </Button>
          <Button onClick={onCancel} variant="ghost" className="w-full text-white/60">
            Annulla
          </Button>
        </div>
      )}

      <p className="text-xs text-white/40 text-center pt-2 border-t border-white/10">
        🔒 Pagamento sicuro tramite {platform === 'ios' ? 'Apple' : 'Google'}
      </p>
    </div>
  );
};

export const M1UPaymentModal: React.FC<M1UPaymentModalProps> = ({ 
  isOpen,
  packName,
  packCode,
  m1uAmount,
  priceEur,
  priceCents,
  onSuccess, 
  onCancel 
}) => {
  // 🏪 STORE COMPLIANT: Check if on native platform
  const isNative = isCapacitorNative();
  const stripeAvailable = isStripeAvailable();

  const options: StripeElementsOptions = {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent 
        className="sm:max-w-md w-[calc(100vw-2rem)] p-0 bg-transparent border-0 [&>button]:hidden"
      >
        {/* Neon glass container with smooth entrance animation */}
        <motion.div 
          className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF] via-[#7C3AED] to-[#00D1FF] shadow-[0_0_30px_rgba(124,58,237,0.35)]"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.4 }
          }}
        >
          <div className="rounded-2xl bg-black/95 backdrop-blur-xl p-6">
            
            {/* Close button */}
            <button
              onClick={onCancel}
              aria-label="Chiudi"
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header */}
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-orbitron text-center">
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] bg-clip-text text-transparent">
                  ACQUISTA PACK
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Finalizza acquisto {packName}
              </DialogDescription>
            </DialogHeader>

            {/* Pack Info */}
            <div className="text-center mb-6 py-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-[#00D1FF]" />
                <span className="text-lg font-semibold text-white">{packName}</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {m1uAmount} <span className="text-[#00D1FF] text-lg">M1U</span>
              </div>
              <div className="text-2xl font-semibold text-[#FFD700] mt-1">
                €{priceEur.toFixed(2)}
              </div>
            </div>

            {/* Payment Content */}
            {isNative || !stripeAvailable ? (
              <NativeIAPCheckoutContent
                packName={packName}
                packCode={packCode}
                m1uAmount={m1uAmount}
                priceEur={priceEur}
                onSuccess={onSuccess}
                onCancel={onCancel}
              />
            ) : (
              <Elements stripe={stripePromise} options={options}>
                <StripeCheckoutContent 
                  packCode={packCode}
                  m1uAmount={m1uAmount}
                  priceCents={priceCents}
                  onSuccess={onSuccess} 
                  onCancel={onCancel} 
                />
              </Elements>
            )}

          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
