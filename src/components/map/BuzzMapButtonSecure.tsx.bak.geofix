// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
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
  const { nextLevel, nextRadiusKm, nextPriceEur, loading: pricingLoading } = useBuzzMapPricingNew(user?.id);
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
  const lastProcessedPidRef = useRef<string | null>(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
      () => {
        if (mapCenter) setCurrentLocation(mapCenter);
        else setCurrentLocation([41.9028, 12.4964]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapCenter]);

  const getCoordinates = (): [number, number] => {
    if (currentLocation) return currentLocation;
    if (mapCenter && mapCenter[0] && mapCenter[1]) return mapCenter;
    try {
      const lastPos = localStorage.getItem('lastKnownPosition');
      if (lastPos) {
        const parsed = JSON.parse(lastPos);
        if (parsed?.lat && parsed?.lng) return [parsed.lat, parsed.lng];
      }
    } catch {}
    return [41.9028, 12.4964];
  };

  const handlePaymentSuccessComplete = useCallback(async (paymentIntentId: string) => {
    if (!paymentIntentId) return;

    // dedupe
    if (lastProcessedPidRef.current === paymentIntentId) return;
    lastProcessedPidRef.current = paymentIntentId;

    try {
      await handlePaymentSuccess(paymentIntentId);

      const [lat, lng] = getCoordinates();
      const { data: { session } } = await supabase.auth.getSession();

      console.log('🔗 Invoking handle-buzz-payment-success (BUZZ MAP)…', { paymentIntentId, lat, lng, hasAuth: !!session?.access_token });

      const { data, error } = await supabase.functions.invoke('handle-buzz-payment-success', {
        body: {
          paymentIntentId,
          isBuzzMap: true,
          coordinates: { lat, lng },
          amount: Math.round(nextPriceEur * 100)
        },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });

      if (error) {
        console.error('❌ Handle BUZZ MAP error:', error);
        toast.error('Errore nella finalizzazione BUZZ MAP');
        return;
      }

      if (data?.success) {
        const level = data.level || nextLevel;
        const radius_km = data.radius_km || nextRadiusKm / 1000;
        const price_eur = data.price_eur || nextPriceEur;
        toast.success(`BUZZ MAP creato · Livello ${level} · ${radius_km}km · €${price_eur.toFixed(2)}`);
        onAreaGenerated?.(lat, lng, radius_km);
        onBuzzPress();

        window.dispatchEvent(new CustomEvent('buzzMapAreaCreated', {
          detail: { paymentIntentId, level, radius_km, price_eur, coordinates: { lat, lng } }
        }));
      }
    } catch (e) {
      console.error('❌ Post-payment BUZZ MAP fatal:', e);
      toast.error('Errore nella finalizzazione BUZZ MAP');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPriceEur, nextLevel, nextRadiusKm]);

  // Global fallback: listen to payment success events from the checkout component
  useEffect(() => {
    const handler = (evt: any) => {
      const pid = evt?.detail?.paymentIntentId || evt?.detail?.payment_intent_id;
      if (pid) {
        console.log('🛰️ paymentIntentSucceeded (global) →', pid);
        handlePaymentSuccessComplete(pid);
      }
    };
    window.addEventListener('paymentIntentSucceeded', handler as EventListener);
    return () => window.removeEventListener('paymentIntentSucceeded', handler as EventListener);
  }, [handlePaymentSuccessComplete]);

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated) { toast.error('Devi accedere per usare BUZZ MAP.'); return; }

    const [lat, lng] = getCoordinates();
    if (!lat || !lng) { toast.error('Posizione necessaria per BUZZ MAP'); return; }

    localStorage.setItem('lastKnownPosition', JSON.stringify({ lat, lng, timestamp: Date.now() }));

    setIsProcessing(true);
    try {
      const priceInCents = Math.round(nextPriceEur * 100);
      await processBuzzPayment(priceInCents, true);
    } catch (e: any) {
      console.error('❌ BUZZ MAP Error:', e);
      if (e?.message?.includes('429')) toast.error('Limite giornaliero raggiunto (5).');
      else if (e?.message?.includes('403')) toast.error('Pagamento richiesto per BUZZ MAP.');
      else toast.error('Errore durante il pagamento BUZZ MAP');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <motion.div className="fixed left-1/2 transform -translate-x-1/2 z-50"
        style={{ bottom: 'clamp(16px, 3vh, 28px)', transform: 'translateX(-50%)' }}>
        <motion.button
          className="relative rounded-full transition-all duration-300 bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95"
          onClick={handleBuzzMapPress}
          disabled={!isAuthenticated || isProcessing || loading || pricingLoading}
          style={{ width: '96px', height: '96px', border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              inset 0 -8px 20px rgba(0, 0, 0, 0.4),
              inset 0 8px 20px rgba(255, 255, 255, 0.1),
              inset -8px 0 20px rgba(147, 51, 234, 0.3),
              inset 8px 0 20px rgba(239, 68, 68, 0.3),
              0 0 40px rgba(147, 51, 234, 0.4),
              0 0 20px rgba(239, 68, 68, 0.3),
              0 15px 40px rgba(0, 0, 0, 0.6),
              0 8px 20px rgba(0, 0, 0, 0.4)
            `}}
          whileTap={{ scale: isAuthenticated ? 0.9 : 1 }}
          whileHover={{ boxShadow: `
              inset 0 -10px 25px rgba(0, 0, 0, 0.5),
              inset 0 10px 25px rgba(255, 255, 255, 0.15),
              inset -10px 0 25px rgba(147, 51, 234, 0.4),
              inset 10px 0 25px rgba(239, 68, 68, 0.4),
              0 0 60px rgba(147, 51, 234, 0.6),
              0 0 30px rgba(239, 68, 68, 0.5),
              0 20px 50px rgba(0, 0, 0, 0.7),
              0 10px 25px rgba(0, 0, 0, 0.5)
          `}}
          aria-label="BUZZ MAP"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
            {(isProcessing || loading) ? (
              <Lock className="text-white animate-pulse" size={28} />
            ) : (
              <>
                <span className="text-sm text-white font-bold leading-none">BUZZ MAP</span>
                <span className="text-xs text-white/90 leading-none mt-1">
                  {Math.round(nextRadiusKm)}km · €{nextPriceEur.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </motion.button>
      </motion.div>

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
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
