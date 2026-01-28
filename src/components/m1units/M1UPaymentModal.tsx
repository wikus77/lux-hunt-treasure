/**
 * M1U Payment Modal — In-App Checkout for M1 UNITS™
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - Stripe checkout on WEB only
 * - Native platforms (iOS/Android) show "coming soon" placeholder
 * - Apple IAP / Google Play Billing to be implemented
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

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
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
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

const CheckoutForm: React.FC<{ 
  packName: string;
  packCode: string;
  m1uAmount: number;
  priceCents: number;
  onSuccess: () => void; 
  onCancel: () => void;
}> = ({ packName, packCode, m1uAmount, priceCents, onSuccess, onCancel }) => {
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
        console.log('[M1U MODAL] Creating payment intent:', {
          packCode,
          packName,
          m1uAmount,
          priceCents
        });

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: priceCents, // Already in cents
            currency: 'eur',
            payment_type: 'm1u_purchase',
            plan: packCode,
            description: `M1 UNITS™ ${packName} - ${m1uAmount} M1U`,
            metadata: {
              pack_code: packCode,
              pack_name: packName,
              m1u_amount: String(m1uAmount), // Must be string for Stripe metadata
              user_email: user.email || '',
              user_id: user.id // Critical for webhook to credit M1U
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
          console.log('[M1U MODAL] ✅ Payment intent created:', data?.paymentIntentId || data?.payment_intent_id);
        } else {
          console.error('[M1U MODAL] No client secret received:', data);
          toast.error('Errore nella configurazione del pagamento');
        }
      } catch (error) {
        console.error('[M1U MODAL] Payment intent failed:', error);
        toast.error('Errore nel sistema di pagamento');
      }
    };

    createPaymentIntent();
  }, [user, packCode, packName, m1uAmount, priceCents]);

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
    <Card className="w-full max-w-md mx-auto bg-black/95 border-[#00D1FF]/30 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00D1FF]" />
            <CardTitle className="text-white font-orbitron">{packName}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={loading}
            className="h-8 w-8 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-white mb-1">
            {m1uAmount} <span className="text-[#00D1FF] text-lg">M1U</span>
          </div>
          <div className="text-2xl font-semibold text-[#FFD700]">
            €{(priceCents / 100).toFixed(2)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <CardElement options={cardElementOptions} />
          </div>
          
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
                `Paga €${(priceCents / 100).toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-white/50 text-center pt-2 border-t border-white/10">
          🔒 Pagamento sicuro elaborato da Stripe
        </div>
      </CardContent>
    </Card>
  );
};

// 🏪 STORE COMPLIANT: Native IAP Checkout Component
// 🔧 FIX 28/01/2026: Added timeout, product validation, better error states
import { useIAP, M1U_PRODUCTS, getProductByCode } from '@/iap';

const IAP_INIT_TIMEOUT_MS = 15000; // 15 seconds max for init

const NativeIAPCheckout: React.FC<{
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

  // 🔧 FIX: Check product mapping exists IMMEDIATELY
  const mappedProduct = getProductByCode(packCode);
  const productMappingError = !mappedProduct 
    ? `Prodotto non trovato: ${packCode}. Configura i prodotti IAP.`
    : null;

  // Get store-specific product ID for display
  const expectedStoreId = mappedProduct 
    ? (platform === 'ios' ? mappedProduct.appleProductId : mappedProduct.googleProductId)
    : null;

  // 🔧 FIX: Log for debugging (native only)
  useEffect(() => {
    console.log('[Native IAP] 🛒 Checkout opened:', {
      packCode,
      packName,
      platform,
      mappedProduct: !!mappedProduct,
      expectedStoreId,
      isNativeIAPAvailable: isNativeIAPAvailable(),
    });
  }, [packCode, packName, platform, mappedProduct, expectedStoreId, isNativeIAPAvailable]);

  // Initialize IAP on mount with timeout guard
  useEffect(() => {
    if (initAttempted || !isNativeIAPAvailable() || productMappingError) return;
    
    setInitAttempted(true);
    setLocalError(null);
    
    // Start timeout
    const timeoutId = setTimeout(() => {
      if (status === 'initializing' || status === 'idle') {
        console.error('[Native IAP] ⏰ Init timeout after', IAP_INIT_TIMEOUT_MS, 'ms');
        setInitTimedOut(true);
        setLocalError('Connessione allo store scaduta. Riprova.');
      }
    }, IAP_INIT_TIMEOUT_MS);
    
    initIAP()
      .then(success => {
        clearTimeout(timeoutId);
        if (!success) {
          setLocalError('Impossibile connettersi allo store.');
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('[Native IAP] Init error:', err);
        setLocalError('Errore di connessione allo store.');
      });
    
    return () => clearTimeout(timeoutId);
  }, [initAttempted, initIAP, isNativeIAPAvailable, productMappingError, status]);

  // Find the store product for display
  const storeProduct = products.find(p => p.productId === expectedStoreId);

  const displayPrice = storeProduct?.localizedPrice || `€${priceEur.toFixed(2)}`;

  const handlePurchase = async () => {
    if (!isIAPReady || purchasing || productMappingError) return;

    setPurchasing(true);
    setLocalError(null);
    
    console.log('[Native IAP] 💳 Starting purchase:', { packCode, expectedStoreId });
    
    try {
      const result = await purchase(packCode);
      
      if (result.success) {
        console.log('[Native IAP] ✅ Purchase successful:', result);
        toast.success(`✅ ${m1uAmount} M1U aggiunti al tuo account!`);
        onSuccess();
      } else {
        console.error('[Native IAP] ❌ Purchase failed:', result.error);
        setLocalError(result.error || 'Acquisto non completato');
        toast.error(result.error || 'Acquisto non completato');
      }
    } catch (err) {
      console.error('[Native IAP] ❌ Purchase error:', err);
      setLocalError('Errore durante l\'acquisto. Riprova.');
      toast.error('Errore durante l\'acquisto');
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
    <Card className="w-full max-w-md mx-auto bg-black/95 border-[#00D1FF]/30 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00D1FF]" />
            <CardTitle className="text-white font-orbitron">{packName}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={purchasing}
            className="h-8 w-8 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-white mb-1">
            {m1uAmount} <span className="text-[#00D1FF] text-lg">M1U</span>
          </div>
          <div className="text-2xl font-semibold text-[#FFD700]">
            {displayPrice}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        {/* 🔧 FIX: Product mapping error (critical) */}
        {productMappingError && (
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-medium mb-2">Configurazione Richiesta</p>
            <p className="text-white/60 text-xs mb-3">{productMappingError}</p>
            <p className="text-white/40 text-xs">ID atteso: {expectedStoreId || 'N/A'}</p>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Chiudi
            </Button>
          </div>
        )}

        {/* Loading state */}
        {!productMappingError && status === 'initializing' && !initTimedOut && (
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/70 text-sm">Connessione allo store...</p>
          </div>
        )}

        {/* Error state (including timeout) */}
        {!productMappingError && hasError && (status === 'error' || initTimedOut || localError) && (
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{localError || error || 'Errore di connessione'}</p>
            <div className="flex gap-2 justify-center mt-3">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
              >
                Riprova
              </Button>
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
              >
                Chiudi
              </Button>
            </div>
          </div>
        )}

        {/* Ready to purchase */}
        {!productMappingError && isIAPReady && !hasError && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-white/70 text-sm">
                {platform === 'ios' ? '🍎 Apple Pay' : '🤖 Google Play'}
              </p>
              <p className="text-white/50 text-xs mt-1">
                Pagamento sicuro tramite {platform === 'ios' ? 'App Store' : 'Play Store'}
              </p>
              {!storeProduct && (
                <p className="text-yellow-400/70 text-xs mt-2">
                  ⚠️ Prodotto non ancora disponibile nello store
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/20 hover:bg-white/10"
                disabled={purchasing}
              >
                Annulla
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={purchasing || isLoading || !storeProduct}
                className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-semibold"
              >
                {purchasing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Acquisto...
                  </span>
                ) : (
                  `Acquista ${displayPrice}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Idle state - waiting for init (no error, not loading, not ready) */}
        {!productMappingError && !isIAPReady && !hasError && status !== 'initializing' && (
          <div className="text-center p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-md font-bold text-white mb-2">
              {platform === 'ios' ? 'Apple In-App Purchase' : 'Google Play Billing'}
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Premi "Connetti" per avviare il pagamento
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleRetry}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-[#00D1FF] to-[#7C3AED]"
              >
                Connetti allo store
              </Button>
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-white/50 text-center pt-2 border-t border-white/10">
          🔒 Pagamento sicuro tramite {platform === 'ios' ? 'Apple' : 'Google'}
        </div>
      </CardContent>
    </Card>
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
  
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('[M1U MODAL] ESC pressed - closing modal');
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

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
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] overflow-y-auto"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 20px) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)',
        maxHeight: '100dvh'
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          console.log('[M1U MODAL] Backdrop clicked - closing modal');
          onCancel();
        }
      }}
    >
      {/* 🏪 STORE COMPLIANT: Show native IAP or Stripe checkout */}
      {isNative || !stripeAvailable ? (
        <NativeIAPCheckout
          packName={packName}
          packCode={packCode}
          m1uAmount={m1uAmount}
          priceEur={priceEur}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            packName={packName}
            packCode={packCode}
            m1uAmount={m1uAmount}
            priceCents={priceCents}
            onSuccess={onSuccess} 
            onCancel={onCancel} 
          />
        </Elements>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
