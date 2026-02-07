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
      
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00D1FF, #7C3AED)',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
          opacity: (!stripe || loading || !clientSecret) ? 0.5 : 1,
        }}
      >
        {loading ? 'Elaborazione...' : `Paga €${(priceCents / 100).toFixed(2)}`}
      </button>
      
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          cursor: 'pointer',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {hasError && (
        <GlassCard style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle style={{ width: '40px', height: '40px', color: '#f87171', margin: '0 auto 12px' }} />
          <p style={{ color: '#f87171', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
            {localError || error || productMappingError || 'Impossibile connettersi allo store.'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
            Prodotti IAP in configurazione su App Store Connect.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleRetry} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>
              Riprova
            </button>
            <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>
              Chiudi
            </button>
          </div>
        </GlassCard>
      )}

      {!hasError && status === 'initializing' && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0, 209, 255, 0.3)', borderTopColor: '#00D1FF', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Connessione allo store...</p>
        </div>
      )}

      {!hasError && isIAPReady && (
        <>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Smartphone style={{ width: '24px', height: '24px', color: '#00D1FF' }} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                {platform === 'ios' ? 'Apple Pay / Carta' : 'Google Pay / Carta'}
              </span>
            </div>
          </GlassCard>

          <button
            onClick={handlePurchase}
            disabled={purchasing || isLoading || !storeProduct}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D1FF, #7C3AED)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: (purchasing || isLoading || !storeProduct) ? 0.5 : 1,
            }}
          >
            {purchasing ? 'Elaborazione...' : `Paga ${displayPrice}`}
          </button>

          <button
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Annulla
          </button>
        </>
      )}

      {!hasError && !isIAPReady && status !== 'initializing' && (
        <>
          <button
            onClick={handleRetry}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D1FF, #7C3AED)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Smartphone style={{ width: '20px', height: '20px' }} />
            Connetti allo Store
          </button>
          <button onClick={onCancel} style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
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
