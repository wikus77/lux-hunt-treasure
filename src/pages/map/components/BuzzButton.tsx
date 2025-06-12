
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
  const [showRipple, setShowRipple] = useState(false);
  const { reloadAreas } = useBuzzMapLogic();
  const { buzzMapPrice, radiusKm, incrementGeneration } = useBuzzMapPricing();
  const { processBuzzPurchase, loading: paymentLoading } = useStripePayment();
  const { user } = useAuth();
  const { callBuzzApi } = useBuzzApi();

  // CRITICAL: Calculate dynamic pricing based on generation count
  const [currentGeneration, setCurrentGeneration] = useState(1);
  const [dynamicPrice, setDynamicPrice] = useState(7.99);

  // Update pricing based on generation
  React.useEffect(() => {
    const loadGenerationCount = async () => {
      if (!user?.id) return;
      
      try {
        const { data: existingAreas } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', user.id);
          
        const nextGeneration = (existingAreas?.length || 0) + 1;
        setCurrentGeneration(nextGeneration);
        
        // Dynamic pricing: €7.99 → €29.99 progressive
        const basePrice = 7.99;
        const maxPrice = 29.99;
        const priceIncrement = (maxPrice - basePrice) / 10; // Over 10 generations
        const newPrice = Math.min(maxPrice, basePrice + (nextGeneration - 1) * priceIncrement);
        setDynamicPrice(parseFloat(newPrice.toFixed(2)));
        
        console.log(`💰 BUZZ MAPPA: Dynamic pricing - Generation ${nextGeneration}, Price €${newPrice.toFixed(2)}`);
      } catch (error) {
        console.error('❌ Error loading generation count:', error);
      }
    };
    
    loadGenerationCount();
  }, [user?.id]);

  const handleBuzzPress = async () => {
    if (isGenerating || paymentLoading || !user?.id) {
      console.log('🗺️ BUZZ MAPPA: Button click ignored - already processing or no user');
      return;
    }
    
    console.log('🗺️ BUZZ MAPPA: Starting generation process with MANDATORY payment verification');
    
    // Trigger ripple effect immediately
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
    setIsGenerating(true);
    playSound('buzz');
    
    try {
      // MANDATORY: Check for active subscription first
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isDeveloper = user.email === 'wikus77@hotmail.it';
      
      // CRITICAL: Block if no subscription and not developer
      if (!isDeveloper && (subError || !subscription)) {
        console.log('💳 BUZZ MAPPA: Payment REQUIRED - no active subscription found');
        
        // Log abuse attempt
        try {
          await supabase.from('abuse_logs').insert({
            user_id: user.id,
            event_type: 'buzz_map_payment_required'
          });
        } catch (error) {
          console.error("Failed to log abuse:", error);
        }
        
        // Show payment requirement toast
        toast.error("Pagamento richiesto", {
          description: `Per generare un'area BUZZ è necessario pagare €${dynamicPrice.toFixed(2)} o attivare un abbonamento.`
        });

        // MANDATORY: Process payment before allowing generation
        const paymentSuccess = await processBuzzPurchase(true, dynamicPrice);
        
        if (!paymentSuccess) {
          toast.error("Pagamento necessario", {
            description: "Il pagamento è obbligatorio per generare aree BUZZ."
          });
          setIsGenerating(false);
          return;
        }
        
        console.log('✅ BUZZ MAPPA: Payment completed successfully');
      } else if (isDeveloper) {
        console.log('🔓 BUZZ MAPPA: Developer bypass activated for wikus77@hotmail.it');
      } else {
        console.log('✅ BUZZ MAPPA: Active subscription verified, proceeding');
      }

      // Verify map center coordinates
      if (!mapCenter || !Array.isArray(mapCenter) || mapCenter.length !== 2) {
        toast.error("Errore posizione", {
          description: "Impossibile determinare la posizione sulla mappa."
        });
        setIsGenerating(false);
        return;
      }

      console.log('🗺️ BUZZ MAPPA: Calling unified API for map generation');

      // Generate map area using the unified API with coordinates
      const response = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates: { lat: mapCenter[0], lng: mapCenter[1] }
      });

      if (response.success && response.radius_km && response.lat && response.lng) {
        console.log('✅ BUZZ MAPPA: Area generated successfully with response:', response);
        
        // Calculate actual radius for this generation
        const actualRadius = response.radius_km;
        
        // CRITICAL: Register notification in Supabase
        try {
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
          console.log('✅ BUZZ MAPPA: Notification registered in user_notifications');
        } catch (notifError) {
          console.error("❌ BUZZ MAPPA: Failed to create notification:", notifError);
        }

        // CRITICAL: Log event in buzz_logs
        try {
          await supabase
            .from('buzz_logs')
            .insert({
              user_id: user.id,
              step: 'buzz_map_generated',
              action: 'BUZZ_MAPPA_PREMUTO',
              details: {
                cost: dynamicPrice,
                radius_km: actualRadius,
                lat: response.lat,
                lng: response.lng,
                generation_number: response.generation_number,
                timestamp: new Date().toISOString(),
                success: true
              }
            });
          console.log("✅ BUZZ MAPPA: Event logged in buzz_logs");
        } catch (logError) {
          console.error("❌ BUZZ MAPPA: Failed to log event:", logError);
        }
        
        // ONLY show success toast AFTER real generation
        toast.success("Area BUZZ generata!", {
          description: `Nuova area di ricerca attiva con raggio ${actualRadius}km`,
          duration: 4000
        });
        
        // CRITICAL: Force reload areas to show new area immediately
        setTimeout(() => {
          console.log('🔄 BUZZ MAPPA: Triggering area reload');
          reloadAreas();
        }, 500);
        
        // Update generation count for next time
        setCurrentGeneration(prev => prev + 1);
        const nextPrice = Math.min(29.99, 7.99 + currentGeneration * 2.2);
        setDynamicPrice(parseFloat(nextPrice.toFixed(2)));
        
        // Notify parent component with actual generated area data
        if (onAreaGenerated) {
          console.log('🎯 BUZZ MAPPA: Calling onAreaGenerated callback');
          onAreaGenerated(response.lat, response.lng, response.radius_km);
        }
        
        // Call original handleBuzz if provided
        if (handleBuzz) {
          handleBuzz();
        }
      } else {
        console.error('❌ BUZZ MAPPA: Generation failed or incomplete response', response);
        toast.error("Errore generazione", {
          description: response.errorMessage || "Impossibile generare l'area BUZZ"
        });
        
        // Log failure
        try {
          await supabase
            .from('buzz_logs')
            .insert({
              user_id: user.id,
              step: 'buzz_map_failed',
              action: 'BUZZ_MAPPA_ERRORE',
              details: {
                error: response.errorMessage || "Generation failed",
                timestamp: new Date().toISOString()
              }
            });
        } catch (logError) {
          console.error("❌ BUZZ MAPPA: Failed to log error:", logError);
        }
      }
      
    } catch (error) {
      console.error('❌ BUZZ MAPPA: Exception during generation', error);
      toast.error('Errore di connessione', {
        description: 'Impossibile contattare il server. Riprova più tardi.'
      });
      
      // Log connection error
      try {
        await supabase
          .from('buzz_logs')
          .insert({
            user_id: user.id,
            step: 'buzz_map_connection_error',
            action: 'BUZZ_MAPPA_CONNECTION_ERROR',
            details: {
              error: error?.message || 'Unknown connection error',
              timestamp: new Date().toISOString()
            }
          });
      } catch (logError) {
        console.error("❌ BUZZ MAPPA: Failed to log connection error:", logError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // CRITICAL: Always allow button unless actively processing
  const canUseBuzz = !isGenerating && !paymentLoading && user?.id;
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
        disabled={!canUseBuzz}
        style={{
          width: '90px',
          height: '90px',
        }}
        whileTap={{ scale: canUseBuzz ? 0.9 : 1 }}
        animate={{ 
          boxShadow: canUseBuzz 
            ? ["0 0 15px rgba(123, 46, 255, 0.6)", "0 0 30px rgba(0, 209, 255, 0.8)", "0 0 15px rgba(123, 46, 255, 0.6)"]
            : "none"
        }}
        transition={{ 
          boxShadow: { repeat: Infinity, duration: 2.5 },
          scale: { type: "spring", stiffness: 300, damping: 20 }
        }}
        aria-label="Genera Area BUZZ"
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MapPin className="text-white" size={28} />
            </motion.div>
          ) : (
            <>
              <Zap className="text-white" size={28} />
              <span className="text-xs text-white/90 mt-1 font-bold">
                €{dynamicPrice.toFixed(2)}
              </span>
              <span className="text-xs text-white/70 leading-none">
                Gen {currentGeneration}
              </span>
            </>
          )}
        </div>
        
        {/* Animated glow effect */}
        {canUseBuzz && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500 to-red-500 opacity-20 blur-xl animate-pulse" />
        )}

        {/* Ripple effect */}
        {showRipple && (
          <div className="absolute inset-0 rounded-full">
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-30"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default BuzzButton;
