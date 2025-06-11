import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { useAuth } from '@/hooks/useAuth';
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
  const { user, getValidUser } = useAuth();
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    dailyBuzzMapCounter,
    precisionMode,
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // FIX 2: Calcola il raggio corretto dal database
  React.useEffect(() => {
    const calculateCorrectRadius = async () => {
      if (!user?.id) return;

      try {
        console.log("🔥 BUZZ MAPPA radius: Calculating from database...");
        
        // Ottieni la generazione corrente dal database
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
    // ✅ FASE 1 – ACCESSO E SESSIONE - Enhanced logging
    console.log('🔥 LIVELLO 1 – ACCESSO E SESSIONE START');
    console.log('User from useAuth:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    
    // CRITICAL FIX: Validate session before proceeding
    console.log('🔍 LIVELLO 1 – SESSION VALIDATION: Checking session validity...');
    const validUser = await getValidUser();
    
    if (!validUser) {
      console.error('❌ LIVELLO 1 ERROR: No valid user available after validation');
      console.log('LIVELLO 1 – FALLIMENTO: User validation failed');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return;
    }

    console.log('✅ LIVELLO 1 – SUCCESSO: User validated', {
      userId: validUser.id,
      email: validUser.email
    });

    // Check Supabase session directly with enhanced logging
    console.log('🔍 LIVELLO 1 – SUPABASE SESSION: Checking Supabase session state...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 LIVELLO 1 – SUPABASE SESSION:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      error: sessionError 
    });

    // ✅ FASE 2 – CONTROLLO CONDIZIONI DI GENERAZIONE
    console.log('🔥 LIVELLO 2 – CONTROLLO CONDIZIONI START');
    
    // Check subscription status with enhanced logging
    try {
      console.log('🔍 LIVELLO 2 – PROFILE CHECK: Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', validUser.id)
        .single();
      
      console.log('🔍 LIVELLO 2 – PROFILE DATA:', {
        profile: profile,
        error: profileError,
        tier: profile?.subscription_tier,
        stripeId: profile?.stripe_customer_id
      });
      
      // Check buzz counters
      console.log('🔍 LIVELLO 2 – BUZZ COUNTERS: Fetching buzz counters...');
      const { data: buzzCounters, error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .select('*')
        .eq('user_id', validUser.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();
      
      console.log('🔍 LIVELLO 2 – BUZZ COUNTERS:', {
        counters: buzzCounters,
        error: counterError,
        dailyCount: dailyBuzzMapCounter
      });
      
    } catch (error) {
      console.error('❌ LIVELLO 2 ERROR: Error checking conditions:', error);
    }

    console.log('✅ LIVELLO 2 – CONTROLLO CONDITIONS COMPLETED');
    
    // Trigger ripple effect
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    // Use map center coordinates or default to Rome (will become fixed center)
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 LIVELLO 3 – COORDINATES: Using coordinates:', { 
      userId: validUser.id,
      centerLat, 
      centerLng,
      mode: 'backend-only-fixed-center'
    });
    
    // ✅ FASE 3 – CHIAMATA A handle-buzz-press
    console.log('🔥 LIVELLO 3 – CHIAMATA handle-buzz-press START');
    console.log('Calling generateBuzzMapArea with validated user:', { 
      userId: validUser.id,
      centerLat, 
      centerLng 
    });
    
    // BACKEND-ONLY GENERATION with FIXED CENTER - completely stateless
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    console.log('🔥 LIVELLO 3 – RISPOSTA handle-buzz-press:', newArea);
    
    if (newArea) {
      // Track clue unlocked event for map buzz
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('clue_unlocked');
      }
      
      console.log('✅ LIVELLO 3 SUCCESS - FIXED CENTER:', newArea);
      
      // Force reload areas to sync with database
      await reloadAreas();
      
      // DO NOT CENTER MAP - maintain current view
      // onAreaGenerated is NOT called to prevent zoom/pan changes
      console.log('🔒 MAINTAINING CURRENT MAP VIEW - No zoom/pan changes');
      
      // Execute optional callback without affecting map view
      if (handleBuzz) {
        handleBuzz();
      }
    } else {
      console.error('❌ LIVELLO 3 FALLIMENTO - No area generated');
      console.log('LIVELLO 3 FAILED - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ');
    }
  };

  // FIX 2: Determina il raggio da mostrare
  const getDisplayRadius = () => {
    // 1. Se c'è un'area attiva, mostra il suo raggio
    if (activeArea) {
      console.log("🔥 BUZZ MAPPA radius: Using active area radius:", activeArea.radius_km);
      return activeArea.radius_km.toFixed(1);
    }
    
    // 2. Se abbiamo calcolato il raggio, mostralo
    if (calculatedRadius !== null) {
      console.log("🔥 BUZZ MAPPA radius: Using calculated radius:", calculatedRadius);
      return calculatedRadius.toFixed(1);
    }
    
    // 3. Se non abbiamo dati, mostra "Calcolo..."
    console.log("🔥 BUZZ MAPPA radius: No data available, showing 'Calcolo...'");
    return "Calcolo...";
  };

  // Disable button if no valid user
  const isDisabled = isGenerating || !user?.id;
  
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
