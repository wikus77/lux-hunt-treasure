// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapPricingNew } from '@/hooks/useBuzzMapPricingNew';
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
  const { 
    nextLevel, 
    nextRadiusKm, 
    nextPriceEur, 
    loading: pricingLoading 
  } = useBuzzMapPricingNew(user?.id);
  
  const { 
    processBuzzPayment, 
    showCheckout, 
    closeCheckout, 
    handlePaymentSuccess, 
    paymentConfig,
    loading 
  } = useStripeInAppPayment();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Get current geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to map center or Rome coordinates
        if (mapCenter) {
          setCurrentLocation(mapCenter);
        } else {
          setCurrentLocation([41.9028, 12.4964]); // Rome fallback
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapCenter]);

  const getCoordinates = (): [number, number] => {
    // Priority: current GPS location > map center > last known position > Rome fallback
    if (currentLocation) return currentLocation;
    if (mapCenter && mapCenter[0] && mapCenter[1]) return mapCenter;
    
    // Check localStorage for last known position
    const lastPos = localStorage.getItem('lastKnownPosition');
    if (lastPos) {
      try {
        const parsed = JSON.parse(lastPos);
        if (parsed.lat && parsed.lng) return [parsed.lat, parsed.lng];
      } catch (e) {
        console.warn('Failed to parse last known position:', e);
      }
    }
    
    // Rome fallback
    return [41.9028, 12.4964];
  };

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated) {
      toast.error('Devi accedere per usare BUZZ MAP.');
      return;
    }

    const coordinates = getCoordinates();
    if (!coordinates || !coordinates[0] || !coordinates[1]) {
      toast.error('Posizione necessaria per BUZZ MAP');
      return;
    }

    // Save current position for future fallback
    localStorage.setItem('lastKnownPosition', JSON.stringify({
      lat: coordinates[0],
      lng: coordinates[1],
      timestamp: Date.now()
    }));

    setIsProcessing(true);

    try {
      // Start payment flow - Always paid, no exceptions
      const priceInCents = Math.round(nextPriceEur * 100);
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
      
      const coordinates = getCoordinates();
      
      // Call edge function with correct body format that server expects
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: user?.id,
          generateMap: true,
          coordinates: {
            lat: coordinates[0],
            lng: coordinates[1]
          },
          sessionId: paymentIntentId
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) {
        console.error('❌ Handle buzz press error:', error);
        throw error;
      }

      if (data?.success) {
        // Show success toast with detailed info as requested
        const level = data.level || nextLevel;
        const radius_km = data.radius_km || nextRadiusKm / 1000;
        const price_eur = data.price_eur || nextPriceEur;
        
        toast.success(`BUZZ creato · Livello ${level} · ${radius_km}km · €${price_eur.toFixed(2)}`);
        
        onAreaGenerated?.(coordinates[0], coordinates[1], radius_km);
        onBuzzPress();
        
        // Dispatch success event for other components
        window.dispatchEvent(new CustomEvent('paymentIntentSucceeded', {
          detail: { 
            paymentIntentId,
            level,
            radius_km,
            price_eur,
            coordinates
          }
        }));
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
          disabled={!isAuthenticated || isProcessing || loading || pricingLoading}
          style={{
            width: '88px', // +10% from 80px
            height: '88px', // +10% from 80px
          }}
          whileTap={{ scale: isAuthenticated ? 0.9 : 1 }}
          aria-label="BUZZ MAP"
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 0 20px rgba(147, 51, 234, 0.4)",
              "0 0 40px rgba(147, 51, 234, 0.8)", 
              "0 0 20px rgba(147, 51, 234, 0.4)"
            ]
          }}
          transition={{
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
            {isProcessing || loading ? (
              <Lock className="text-white animate-pulse" size={24} />
            ) : (
              <>
                {/* M1SSION Branding */}
                <span className="text-sm font-bold leading-none">
                  <span className="text-[#00D9FF]">M1</span>
                  <span className="text-white">SSION</span>
                </span>
                <span className="text-xs text-white font-bold leading-none mt-1">
                  BUZZ MAP
                </span>
                <span className="text-xs text-white/80 leading-none mt-0.5">
                  {(nextRadiusKm / 1000).toFixed(1)}km · €{nextPriceEur.toFixed(2)}
                </span>
              </>
            )}
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