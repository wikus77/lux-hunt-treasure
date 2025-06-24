
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
        
        // Call the area generated callback if provided
        if (onAreaGenerated) {
          onAreaGenerated(response.lat, response.lng, actualRadius);
        }
        
        // Call legacy handleBuzz if provided
        if (handleBuzz) {
          handleBuzz();
        }
        
      } else {
        console.error('❌ BUZZ MAPPA: Invalid response from API:', response);
        toast.error("Errore generazione", {
          description: response.error || "Errore durante la generazione dell'area BUZZ"
        });
      }
    } catch (error) {
      console.error('❌ BUZZ MAPPA: Generation failed:', error);
      toast.error("Errore", {
        description: "Errore durante la generazione dell'area BUZZ"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonText = isGenerating ? 'GENERANDO...' : 'BUZZ MAPPA';
  const buttonIcon = isGenerating ? <MapPin className="animate-spin" /> : <Zap />;

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30">
      <motion.div className="relative">
        {/* Ripple effect overlay */}
        {showRipple && (
          <div className="absolute inset-0 -m-8">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-400 animate-ripple absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        )}
        
        {/* Main BUZZ button */}
        <motion.button
          onClick={handleBuzzPress}
          disabled={isGenerating || paymentLoading}
          className={`
            px-8 py-4 rounded-full font-orbitron font-bold text-lg
            bg-gradient-to-r from-cyan-500 to-purple-600
            text-white shadow-2xl
            transform transition-all duration-300
            hover:scale-110 hover:shadow-cyan-400/50
            disabled:opacity-50 disabled:cursor-not-allowed
            border-2 border-cyan-400/30
            ${isGenerating ? 'animate-pulse' : 'hover:border-cyan-400/60'}
          `}
          style={{
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
            >
              {buttonIcon}
            </motion.div>
            <span>{buttonText}</span>
            {!isGenerating && (
              <span className="text-sm opacity-80">€{dynamicPrice.toFixed(2)}</span>
            )}
          </div>
        </motion.button>
        
        {/* Generation info */}
        {!isGenerating && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/60 text-center whitespace-nowrap">
            Generazione #{currentGeneration} • Raggio ~{radiusKm}km
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BuzzButton;
