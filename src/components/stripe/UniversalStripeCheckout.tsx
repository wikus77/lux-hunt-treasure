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
  const { user } = useAuthContext();

  // 🚨 SAFARI PWA LOG
  console.log('🚨 CheckoutForm MOUNTED in Safari PWA mode');

  // 🚨 REDIRECT TO STRIPE CHECKOUT IMMEDIATELY
  useEffect(() => {
    if (!user) return;

    console.log('🔥 Creating payment intent for:', { paymentType, amount });
    
    const createPaymentIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
          body: {
            user_id: user.id,
            amount: amount / 100, // Convert back to euros for the API
            is_buzz_map: isBuzzMap || false,
            currency: 'eur',
            mode: 'payment'
          }
        });

        if (error) {
          console.error('🚨 Payment intent creation failed:', error);
          toast.error('Errore nella creazione del pagamento');
          return;
        }

        if (data?.url) {
          // 🚨 REDIRECT TO STRIPE CHECKOUT - PWA SAFE
          console.log('🔥 Redirecting to Stripe Checkout:', data.url);
          window.open(data.url, '_blank');
          onCancel(); // Close the modal since we're redirecting
        } else {
          console.error('🚨 No URL returned from payment creation');
          toast.error('Errore nella creazione del checkout');
        }
      } catch (error) {
        console.error('🚨 Error creating payment intent:', error);
        toast.error('Errore imprevisto nella creazione del pagamento');
      }
    };

    createPaymentIntent();
  }, [user, paymentType, amount, isBuzzMap, onCancel]);

  return (
    <>
      {/* 🚨 HEADER CON X BUTTON */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
          {planName}
        </h2>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      {/* 🚨 DESCRIPTION */}
      <div style={{
        color: '#9ca3af',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        {description}
      </div>

      {/* 🚨 AMOUNT */}
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        €{(amount / 100).toFixed(2)}
      </div>

      {/* 🚨 REDIRECT MESSAGE */}
      <div style={{
        textAlign: 'center',
        color: '#9ca3af',
        marginBottom: '20px'
      }}>
        Ti stiamo reindirizzando a Stripe per completare il pagamento in modo sicuro...
      </div>

      {/* 🚨 BUTTONS */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Annulla
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '16px'
      }}>
        🔒 Pagamento sicuro elaborato da Stripe
      </div>
    </>
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
  // 🚨 CRITICAL: LOG EVERY RENDER ATTEMPT
  console.log('🚨 UniversalStripeCheckout RENDER CALLED:', {
    isOpen,
    paymentType,
    planName,
    amount,
    description,
    isBuzzMap,
    onSuccessExists: !!onSuccess,
    onCloseExists: !!onClose,
    timestamp: new Date().toISOString()
  });

  if (!isOpen) {
    console.log('🚨 UniversalStripeCheckout: isOpen=false, returning null');
    return null;
  }

  console.log('🚨 UniversalStripeCheckout: isOpen=true, RENDERING MODALE!');

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

  console.log('🚨 UniversalStripeCheckout: About to return JSX with SAFARI PWA FIX');

  return (
    <>
      {/* 🧪 DEBUG FALLBACK VISIVO */}
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'lime',
          color: 'black',
          padding: '10px',
          zIndex: 9999,
          fontSize: '14px',
          borderRadius: '4px'
        }}
      >
        ⚠️ DEBUG: MODALE STRIPE DOVREBBE ESSERE VISIBILE!<br/>
        isOpen: {String(isOpen)}<br/>
        paymentType: {paymentType}
      </div>

      {/* 🚨 SAFARI PWA FIX - FORZARE VISIBILITÀ CON STYLE INLINE */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 999999,
          transform: 'translateZ(0)', // Force GPU acceleration
          WebkitTransform: 'translateZ(0)', // Safari specific
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* 🚨 SAFARI PWA COMPATIBLE CARD */}
        <div 
          style={{
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            transform: 'translateZ(0)', // Force GPU acceleration
            WebkitTransform: 'translateZ(0)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
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
      </div>
    </>
  );
};

export default UniversalStripeCheckout;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */