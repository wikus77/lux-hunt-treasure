// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 M1U Payment Content - REVOLUT STYLE con logica pagamento INTATTA
// 🏪 STORE COMPLIANCE: iOS uses ONLY Apple IAP, Stripe for Web/PWA/Android
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { X, ShoppingCart, AlertCircle, CreditCard, Smartphone } from 'lucide-react';
import { getStripeSafe } from '@/lib/stripeFallback';
import { isStripeAvailable, assertStripeAvailable } from '@/lib/stripe/stripeClient';
import { isCapacitorNative, isCapacitorIOS, getCapacitorPlatform } from '@/utils/capacitor';
import { useIAP, getProductByCode } from '@/iap';
import { assertStripeAllowedOnPlatform } from '@/lib/stripe/guard';

const stripePromise = getStripeSafe();

interface M1UPaymentContentProps {
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

  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        // 🛡️ STORE COMPLIANCE: Assert Stripe is allowed on this platform
        // This will throw on iOS native - should never reach here due to parent routing
        assertStripeAllowedOnPlatform();
        
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
          toast.error(`Errore: ${error.message || 'Creazione pagamento fallita'}`);
          return;
        }

        const clientSecretValue = data?.client_secret || data?.clientSecret;
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
        } else {
          toast.error('Errore nella configurazione del pagamento');
        }
      } catch (error: any) {
        // 🛡️ Handle Store Compliance errors specifically
        if (error?.name === 'StoreComplianceError') {
          console.error('[M1U Payment] ❌ Store compliance violation:', error.message);
          toast.error('Usa acquisti in-app per questa piattaforma');
        } else {
          toast.error('Errore nel sistema di pagamento');
        }
      }
    };

    createPaymentIntent();
  }, [user, packCode, m1uAmount, priceCents]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 🛡️ STORE COMPLIANCE: Final guard before Stripe payment
    try {
      assertStripeAllowedOnPlatform();
    } catch (e: any) {
      console.error('[M1U Payment] ❌ Blocked: Stripe payment on iOS native');
      toast.error('Usa acquisti in-app su questa piattaforma');
      return;
    }

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
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: user?.email || '' },
        },
      });

      if (error) {
        toast.error(`Pagamento fallito: ${error.message || 'Errore sconosciuto'}`);
      } else if (paymentIntent.status === 'succeeded') {
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
            toast.error('Pagamento ricevuto ma errore nell\'accredito M1U. Contatta il supporto.');
            return;
          }

          if (creditData?.success) {
            window.dispatchEvent(new CustomEvent('m1uPurchaseSucceeded', {
              detail: { paymentIntentId: paymentIntent.id, packCode, m1uAmount, newBalance: creditData.new_balance }
            }));
            onSuccess();
          } else {
            toast.error('Errore nell\'accredito M1U. Contatta il supporto.');
          }
        } catch {
          toast.error('Errore nell\'accredito M1U. Contatta il supporto.');
        }
      }
    } catch {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <CreditCard style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Carta di credito</span>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardElement options={cardElementOptions} />
        </div>
      </GlassCard>
      
      {/* BLACK PRIMARY Button - Apple Pay style */}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '14px',
          background: (!stripe || loading || !clientSecret) 
            ? 'rgba(0, 0, 0, 0.4)' 
            : '#000000',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '19px',
          fontWeight: 500,
          cursor: (!stripe || loading || !clientSecret) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {loading && (
          <div style={{
            width: '20px',
            height: '20px',
            border: '2.5px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {loading ? 'Elaborazione...' : `Paga €${(priceCents / 100).toFixed(2)}`}
      </button>
      
      {/* SECONDARY Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        style={{
          width: '100%',
          height: '44px',
          marginTop: '12px',
          borderRadius: '12px',
          background: 'transparent',
          border: 'none',
          color: loading ? 'rgba(0, 122, 255, 0.4)' : '#007AFF',
          fontSize: '17px',
          fontWeight: 400,
          cursor: loading ? 'not-allowed' : 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Annulla
      </button>
    </form>
  );
};

// Native IAP Checkout Content
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
  const { status, products, error, isIAPReady, purchase, initIAP, isNativeIAPAvailable } = useIAP();
  const [purchasing, setPurchasing] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const mappedProduct = getProductByCode(packCode);
  const productMappingError = !mappedProduct ? `Prodotto non trovato: ${packCode}` : null;
  const expectedStoreId = mappedProduct ? (platform === 'ios' ? mappedProduct.appleProductId : mappedProduct.googleProductId) : null;
  
  // 🔍 [IAP_FIX_V4] Log product mapping
  console.log('[IAP_FIX_V4] NativeIAPCheckoutContent mount/update', {
    packCode,
    mappedProduct: mappedProduct ? { code: mappedProduct.code, appleProductId: mappedProduct.appleProductId } : null,
    expectedStoreId,
  });

  // 🔍 [IAP_FIX_V4] Reset error state when pack changes
  useEffect(() => {
    setLocalError(null);
    setInitTimedOut(false);
  }, [packCode]);

  useEffect(() => {
    // 🚨 FORENSIC DIAGNOSTIC — REMOVE AFTER DEBUG
    const nativeIAPAvail = isNativeIAPAvailable();
    console.log('🚨🚨🚨 IAP_DIAG_USEEFFECT_ENTRY 🚨🚨🚨');
    console.log('🚨 [IAP DIAG] NativeIAPCheckoutContent useEffect', {
      initAttempted,
      isNativeIAPAvailable: nativeIAPAvail,
      productMappingError,
      packCode,
      willCallInitIAP: !initAttempted && nativeIAPAvail && !productMappingError,
    });
    
    if (initAttempted || !nativeIAPAvail || productMappingError) return;
    
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
    
    // 🔍 [IAP_FIX_V4] Reset error state before purchase
    setPurchasing(true);
    setLocalError(null);
    
    // 🔍 [IAP_FIX_V4] Log purchase attempt
    console.log('[IAP_FIX_V4] handlePurchase() starting', {
      packCode,
      expectedStoreId,
      storeProduct: storeProduct ? { productId: storeProduct.productId, price: storeProduct.localizedPrice } : null,
    });
    
    try {
      const result = await purchase(packCode);
      
      console.log('[IAP_FIX_V4] purchase() result', result);
      
      if (result.success) {
        toast.success(`✅ ${m1uAmount} M1U aggiunti!`);
        onSuccess();
      } else if (result.cancelled) {
        // 🔍 [IAP_FIX_V4] User cancelled - NOT an error, just close gracefully
        console.log('[IAP_FIX_V4] User cancelled purchase - resetting state');
        toast('Acquisto annullato', { icon: '↩️' });
        // Don't show red error, just reset
        setLocalError(null);
      } else if (result.pendingValidation) {
        // 🔧 [IAP_FIX_V7] Purchase OK but validation pending - show info message
        console.log('[IAP_FIX_V7] Purchase pending validation - showing info');
        toast('Acquisto ricevuto! Verifica in corso...', { 
          icon: '⏳',
          duration: 5000,
        });
        // Don't show error, close modal - retry happens in background
        setLocalError(null);
        onSuccess(); // Close modal, but user should check later
      } else {
        setLocalError(result.error || 'Acquisto non completato');
      }
    } catch (e) {
      console.error('[IAP_FIX_V4] handlePurchase() exception', e);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {hasError && (
        <div style={{ 
          background: 'rgba(255, 59, 48, 0.1)', 
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <AlertCircle style={{ width: '36px', height: '36px', color: '#FF3B30', margin: '0 auto 12px' }} />
          <p style={{ 
            color: '#FFFFFF', 
            fontSize: '17px', 
            fontWeight: 600, 
            letterSpacing: '-0.4px',
            marginBottom: '4px' 
          }}>
            Errore di connessione
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '13px', 
            lineHeight: '1.4',
            marginBottom: '20px' 
          }}>
            {localError || error || productMappingError || 'Impossibile connettersi allo store.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Apple-style PRIMARY (in error context) */}
            <button 
              onClick={handleRetry} 
              style={{ 
                flex: 1,
                height: '44px',
                borderRadius: '10px', 
                background: '#007AFF', 
                border: 'none',
                color: '#FFFFFF', 
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Riprova
            </button>
            {/* Apple-style SECONDARY (in error context) */}
            <button 
              onClick={onCancel} 
              style={{ 
                flex: 1,
                height: '44px',
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                color: '#FFFFFF', 
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '-0.2px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {!hasError && status === 'initializing' && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0, 209, 255, 0.3)', borderTopColor: '#00D1FF', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Connessione allo store...</p>
        </div>
      )}

      {!hasError && isIAPReady && (
        <>
          {/* Apple Pay style PRIMARY Button - BLACK with Apple logo + white border */}
          <button
            onClick={handlePurchase}
            disabled={purchasing || isLoading || !storeProduct}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '14px',
              background: (purchasing || isLoading || !storeProduct) 
                ? 'rgba(0, 0, 0, 0.4)' 
                : '#000000',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '19px',
              fontWeight: 500,
              cursor: (purchasing || isLoading || !storeProduct) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {purchasing ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span>Elaborazione...</span>
              </>
            ) : (
              <>
                {/* Apple Logo SVG */}
                <svg 
                  viewBox="0 0 384 512" 
                  style={{ width: '20px', height: '20px', fill: '#FFFFFF', marginRight: '6px' }}
                >
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <span style={{ fontWeight: 600 }}>Pay</span>
                <span style={{ marginLeft: '4px' }}>{displayPrice}</span>
              </>
            )}
          </button>

          {/* SECONDARY Button - text link style */}
          <button
            onClick={onCancel}
            disabled={purchasing}
            style={{
              width: '100%',
              height: '44px',
              marginTop: '12px',
              borderRadius: '12px',
              background: 'transparent',
              border: 'none',
              color: purchasing ? 'rgba(0, 122, 255, 0.4)' : '#007AFF',
              fontSize: '17px',
              fontWeight: 400,
              cursor: purchasing ? 'not-allowed' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Annulla
          </button>
        </>
      )}

      {!hasError && !isIAPReady && status !== 'initializing' && (
        <>
          {/* BLACK PRIMARY Button - Apple Pay style */}
          <button
            onClick={handleRetry}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '14px',
              background: '#000000',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '19px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Smartphone style={{ width: '20px', height: '20px' }} />
            Connetti allo Store
          </button>
          {/* SECONDARY Button */}
          <button 
            onClick={onCancel} 
            style={{ 
              width: '100%', 
              height: '44px',
              marginTop: '12px',
              background: 'transparent', 
              border: 'none', 
              color: '#007AFF', 
              fontSize: '17px',
              fontWeight: 400,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Annulla
          </button>
        </>
      )}

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textAlign: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        🔒 Pagamento sicuro tramite {platform === 'ios' ? 'Apple' : 'Google'}
      </p>
    </div>
  );
};

// Main Content Component
export const M1UPaymentContent: React.FC<M1UPaymentContentProps> = ({ 
  packName,
  packCode,
  m1uAmount,
  priceEur,
  priceCents,
  onSuccess, 
  onCancel 
}) => {
  const isNative = isCapacitorNative();
  const stripeAvailable = isStripeAvailable();
  
  // 🚨 FORENSIC DIAGNOSTIC — REMOVE AFTER DEBUG
  console.log('🚨🚨🚨 IAP_DIAG_MODAL_MOUNTED 🚨🚨🚨');
  console.log('🚨 [IAP DIAG] M1UPaymentContent mounted', {
    BUILD_STAMP: '20260211_DIAG_V3',
    isNative,
    stripeAvailable,
    platform: getCapacitorPlatform(),
    packCode,
    willShowNativeIAP: isNative || !stripeAvailable,
  });

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
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* HEADER */}
      <div 
        style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.3) 0%, rgba(124, 58, 237, 0.4) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ 
              color: '#00D1FF', 
              fontSize: '18px', 
              fontWeight: 700,
              letterSpacing: '1px',
            }}>
              ACQUISTA PACK
            </h1>
          </div>

          <div style={{ width: '40px' }} />
        </div>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Pack Info */}
        <GlassCard style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShoppingCart style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{packName}</span>
          </div>
          <p style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>
            {m1uAmount} <span style={{ color: '#00D1FF', fontSize: '16px' }}>M1U</span>
          </p>
          <p style={{ color: '#FFD700', fontSize: '24px', fontWeight: 700 }}>
            €{priceEur.toFixed(2)}
          </p>
        </GlassCard>

        {/* Payment Method */}
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
    </div>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default M1UPaymentContent;
