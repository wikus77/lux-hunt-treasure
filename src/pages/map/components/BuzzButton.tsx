
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useBuzzMapPricing } from '../hooks/useBuzzMapPricing';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/hooks/use-auth';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { supabase } from '@/integrations/supabase/client';

export interface BuzzButtonProps {
  handleBuzz?: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radiusKm: number) => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({
  handleBuzz,
  mapCenter,
  onAreaGenerated
}) => {
  const { playSound } = useSoundEffects();
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentWeekAreas } = useBuzzMapLogic();
  const { buzzMapPrice, radiusKm, incrementGeneration } = useBuzzMapPricing();
  const { processBuzzPurchase, loading: paymentLoading } = useStripePayment();
  const { user } = useAuth();
  const { callBuzzApi } = useBuzzApi();

  const handleBuzzPress = async () => {
    if (isGenerating || paymentLoading || !user?.id) return;
    
    console.log('🗺️ BUZZ MAPPA: Starting generation process', {
      userId: user.id,
      mapCenter,
      currentPrice: buzzMapPrice,
      radiusKm
    });
    
    setIsGenerating(true);
    playSound('buzz');
    
    try {
      // Check for active subscription first
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isDeveloper = user.email === 'wikus77@hotmail.it';
      
      if (!isDeveloper && (subError || !subscription)) {
        // No subscription found, payment required
        console.log('💳 BUZZ MAPPA: Payment required, no active subscription');
        toast.info("Pagamento richiesto", {
          description: `Per generare un'area BUZZ è necessario pagare €${buzzMapPrice.toFixed(2)} o attivare un abbonamento.`
        });

        // Process payment
        const paymentSuccess = await processBuzzPurchase(true, buzzMapPrice);
        
        if (!paymentSuccess) {
          toast.error("Pagamento necessario", {
            description: "Il pagamento è richiesto per generare aree BUZZ."
          });
          setIsGenerating(false);
          return;
        }
      } else if (isDeveloper) {
        console.log('🔓 BUZZ MAPPA: Developer bypass activated');
      } else {
        console.log('✅ BUZZ MAPPA: Active subscription found, proceeding');
      }

      // Generate map area using the unified API
      if (!mapCenter) {
        toast.error("Errore posizione", {
          description: "Impossibile determinare la posizione sulla mappa."
        });
        setIsGenerating(false);
        return;
      }

      const response = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates: { lat: mapCenter[0], lng: mapCenter[1] }
      });

      if (response.success) {
        console.log('✅ BUZZ MAPPA: Area generated successfully', response);
        
        // Update generation count
        const actualRadius = incrementGeneration();
        
        // Create notification in database
        await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            type: 'buzz_map',
            title: 'Area BUZZ Mappa generata',
            message: `Nuova area di ricerca generata con raggio ${actualRadius}km`,
            is_read: false,
            created_at: new Date().toISOString()
          });

        // Show success toast ONLY after real generation
        toast.success("Area BUZZ generata!", {
          description: `Nuova area di ricerca attiva con raggio ${actualRadius}km`
        });
        
        // Notify parent component
        if (onAreaGenerated && response.lat && response.lng && response.radius_km) {
          onAreaGenerated(response.lat, response.lng, response.radius_km);
        }
        
        // Call original handleBuzz if provided
        if (handleBuzz) {
          handleBuzz();
        }
      } else {
        console.error('❌ BUZZ MAPPA: Generation failed', response.errorMessage);
        toast.error("Errore generazione", {
          description: response.errorMessage || "Impossibile generare l'area BUZZ"
        });
      }
      
    } catch (error) {
      console.error('❌ BUZZ MAPPA: Exception during generation', error);
      toast.error('Errore di connessione', {
        description: 'Impossibile contattare il server. Riprova più tardi.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canUseBuzz = currentWeekAreas.length < 3; // Limit to 3 areas per week
  const isProcessing = isGenerating || paymentLoading;

  return (
    <motion.div className="fixed bottom-20 right-4 z-50">
      <motion.button
        className={`relative rounded-full shadow-lg transition-all duration-300 ${
          canUseBuzz
            ? 'bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95'
            : 'bg-gray-500 cursor-not-allowed opacity-50'
        }`}
        onClick={handleBuzzPress}
        disabled={!canUseBuzz || isProcessing}
        style={{
          width: '80px',
          height: '80px',
        }}
        whileTap={{ scale: canUseBuzz ? 0.9 : 1 }}
        aria-label="Genera Area BUZZ"
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MapPin className="text-white" size={24} />
            </motion.div>
          ) : (
            <>
              <Zap className="text-white" size={24} />
              <span className="text-xs text-white/90 mt-1">
                €{buzzMapPrice.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default BuzzButton;
