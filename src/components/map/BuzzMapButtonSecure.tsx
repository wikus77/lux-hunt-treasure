// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzPricing } from '@/hooks/useBuzzPricing';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { supabase } from '@/integrations/supabase/client';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';

interface BuzzMapButtonSecureProps {
  onBuzzPress: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzMapButtonSecure: React.FC<BuzzMapButtonSecureProps> = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const { calculateBuzzMapPrice } = useBuzzPricing(user?.id);
  const { 
    processBuzzPayment, 
    showCheckout, 
    closeCheckout, 
    handlePaymentSuccess, 
    paymentConfig,
    loading 
  } = useStripeInAppPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPrice = calculateBuzzMapPrice();

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated) {
      toast.error('Devi accedere per usare BUZZ MAP.');
      return;
    }

    if (!mapCenter || !mapCenter[0] || !mapCenter[1]) {
      toast.error('Centro mappa non disponibile');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Devi accedere per usare BUZZ MAP.');
        setIsProcessing(false);
        return;
      }

      // Start payment flow - Always paid, no exceptions
      const priceInCents = Math.round(currentPrice * 100);
      await processBuzzPayment(priceInCents, true); // true = is BUZZ MAP
      
    } catch (error: any) {
      console.error('❌ BUZZ MAP Error:', error);
      if (error.message?.includes('429')) {
        toast.error('Hai raggiunto il limite giornaliero (5). Riprova dopo mezzanotte.');
      } else if (error.message?.includes('403')) {
        toast.error('Pagamento richiesto per BUZZ MAP.');
      } else {
        toast.error('Errore durante l\'inizializzazione del pagamento');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccessComplete = async (paymentIntentId: string) => {
    try {
      await handlePaymentSuccess(paymentIntentId);
      
      // Call edge function with correct body format
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: user?.id,
          generateMap: true,
          coordinates: {
            lat: mapCenter![0],
            lng: mapCenter![1]
          },
          sessionId: paymentIntentId
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('🎯 BUZZ MAP generato con successo!');
        onAreaGenerated?.(mapCenter![0], mapCenter![1], data.radius_km || 0.5);
        onBuzzPress();
      }
    } catch (error) {
      console.error('Error in post-payment processing:', error);
      toast.error('Errore nella finalizzazione BUZZ MAP');
    }
  };

  return (
    <>
      {/* M1SSION™ BUZZ MAP Button - Centered Bottom, +10% Size, Pulsating Animation */}
      <motion.div 
        className="fixed left-1/2 transform -translate-x-1/2 z-50"
        style={{ 
          bottom: 'clamp(16px, 3vh, 28px)',
          transform: 'translateX(-50%)'
        }}
      >
        <motion.button
          className="relative rounded-full shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95"
          onClick={handleBuzzMapPress}
          disabled={!isAuthenticated || isProcessing || loading}
          style={{
            width: '88px', // +10% from 80px
            height: '88px', // +10% from 80px
          }}
          whileTap={{ scale: isAuthenticated ? 0.9 : 1 }}
          aria-label="BUZZ MAP"
          animate={{
            boxShadow: [
              "0 0 20px rgba(147, 51, 234, 0.4)",
              "0 0 40px rgba(147, 51, 234, 0.8)", 
              "0 0 20px rgba(147, 51, 234, 0.4)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
            {/* M1SSION Branding */}
            <span className="text-sm font-bold leading-none">
              <span className="text-[#00D9FF]">M1</span>
              <span className="text-white">SSION</span>
            </span>
            <span className="text-xs text-white font-bold leading-none mt-1">
              BUZZ MAP
            </span>
            <span className="text-xs text-white/80 leading-none mt-0.5">
              500km · €{currentPrice.toFixed(2)}
            </span>
          </div>
        </motion.button>
      </motion.div>
      
      {/* Stripe In-App Checkout */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={handlePaymentSuccessComplete}
          onCancel={closeCheckout}
        />
      )}
    </>
  );
};

export default BuzzMapButtonSecure;