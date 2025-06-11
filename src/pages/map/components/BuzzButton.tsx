
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface BuzzButtonProps {
  handleBuzz?: () => void;
  radiusKm?: number;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ 
  handleBuzz, 
  radiusKm = 1,
  mapCenter,
  onAreaGenerated
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [calculatedRadius, setCalculatedRadius] = useState<number | null>(null);
  const { createMapBuzzNotification } = useNotificationManager();
  const { user, isAuthenticated } = useAuthContext();
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    dailyBuzzMapCounter,
    precisionMode,
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // Calculate radius from database
  React.useEffect(() => {
    const calculateCorrectRadius = async () => {
      if (!user?.id) {
        console.log('❌ BUZZ BUTTON: No user ID available for radius calculation');
        return;
      }

      try {
        console.log("🔥 BUZZ MAPPA radius: Calculating from database...");
        
        const { data: counterData, error } = await supabase
          .from('user_buzz_map_counter')
          .select('buzz_map_count')
          .eq('user_id', user.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ BUZZ MAPPA radius: Error getting counter:', error);
          setCalculatedRadius(null);
          return;
        }

        const currentCount = counterData?.buzz_map_count || 0;
        const nextGeneration = currentCount + 1;
        
        let radius;
        if (nextGeneration === 1) {
          radius = 500;
          console.log("🔥 BUZZ MAPPA radius: First generation = 500km");
        } else {
          radius = Math.max(5, 500 * Math.pow(0.95, nextGeneration - 1));
          console.log(`🔥 BUZZ MAPPA radius: Generation ${nextGeneration} = ${radius}km`);
        }
        
        console.log("🔥 BUZZ MAPPA radius:", radius);
        setCalculatedRadius(radius);
        
      } catch (error) {
        console.error('❌ BUZZ MAPPA radius: Exception:', error);
        setCalculatedRadius(null);
      }
    };

    calculateCorrectRadius();
  }, [user?.id, dailyBuzzMapCounter]);
  
  const handleBuzzMapClick = async () => {
    console.log('🔥 BUZZ MAPPA: Button clicked');
    console.log('User from context:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    console.log('Is authenticated:', isAuthenticated);
    
    if (!user?.id) {
      console.error('❌ BUZZ MAPPA: No valid user available');
      toast.error('ERRORE AUTENTICAZIONE', {
        description: 'Devi essere loggato per utilizzare BUZZ MAPPA. Effettua nuovamente il login.'
      });
      return;
    }

    console.log('✅ BUZZ MAPPA: User validated', {
      userId: user.id,
      email: user.email
    });

    // Check Supabase session directly
    console.log('🔍 BUZZ MAPPA: Checking Supabase session state...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 BUZZ MAPPA: Supabase session:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      error: sessionError 
    });
    
    // Trigger ripple effect
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    // Use map center coordinates or default to Rome
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 BUZZ MAPPA: Using coordinates:', { 
      userId: user.id,
      centerLat, 
      centerLng,
      mode: 'backend-fixed-center'
    });
    
    console.log('🔥 BUZZ MAPPA: Starting area generation');
    
    try {
      // Generate area with complete flow
      const newArea = await generateBuzzMapArea(centerLat, centerLng);
      
      console.log('🔥 BUZZ MAPPA: Generation result:', newArea);
      
      if (newArea) {
        // Track clue unlocked event for map buzz
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('clue_unlocked');
        }
        
        console.log('✅ BUZZ MAPPA SUCCESS:', newArea);
        
        // Force reload areas to sync with database
        await reloadAreas();
        
        // Execute optional callback without affecting map view
        if (handleBuzz) {
          handleBuzz();
        }
      } else {
        console.error('❌ BUZZ MAPPA: Area generation failed');
        toast.error('ERRORE GENERAZIONE AREA', {
          description: 'Impossibile generare l\'area BUZZ. Verifica la connessione e riprova.'
        });
      }
    } catch (error: any) {
      console.error('❌ BUZZ MAPPA: Exception during generation:', error);
      toast.error('ERRORE BUZZ MAPPA', {
        description: error?.message || 'Errore sconosciuto durante la generazione'
      });
    }
  };

  // Determine radius to display
  const getDisplayRadius = () => {
    // 1. If there's an active area, show its radius
    if (activeArea) {
      console.log("🔥 BUZZ MAPPA radius: Using active area radius:", activeArea.radius_km);
      return activeArea.radius_km.toFixed(1);
    }
    
    // 2. If we have calculated radius, show it
    if (calculatedRadius !== null) {
      console.log("🔥 BUZZ MAPPA radius: Using calculated radius:", calculatedRadius);
      return calculatedRadius.toFixed(1);
    }
    
    // 3. If no data available, show "Calcolo..."
    console.log("🔥 BUZZ MAPPA radius: No data available, showing 'Calcolo...'");
    return "Calcolo...";
  };

  // Disable button only if generating
  const isDisabled = isGenerating;
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleBuzzMapClick}
          disabled={isDisabled}
          className={`buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_20px_6px_rgba(255,0,128,0.45)] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)] transition-all duration-300 px-8 py-3 rounded-full font-bold tracking-wide text-base relative overflow-hidden whitespace-nowrap ${isRippling ? 'ripple-effect' : ''}`}
          style={{
            animation: isGenerating ? "none" : "buzzGlow 2s infinite ease-in-out",
            minWidth: 'fit-content'
          }}
        >
          {isGenerating ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isGenerating ? 'Generando...' : `BUZZ MAPPA (${getDisplayRadius()}km) ${dailyBuzzMapCounter} BUZZ settimana`}
          </span>
        </Button>
        
        {/* Ripple effect overlay */}
        {isRippling && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </motion.div>
      
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
          50% { box-shadow: 0 0 22px rgba(255, 0, 204, 0.88), 0 0 33px rgba(0, 207, 255, 0.55); }
          100% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
        }
        
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        
        .ripple-effect::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          border: 2px solid rgba(0, 255, 255, 0.6);
          transform: translate(-50%, -50%);
          animation: ripple 1s ease-out;
          pointer-events: none;
        }
        `}
      </style>
    </div>
  );
};

export default BuzzButton;
