
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const { createMapBuzzNotification } = useNotificationManager();
  const { user } = useAuth(); // Get authenticated user
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    dailyBuzzMapCounter,
    precisionMode,
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();
  
  const handleBuzzMapClick = async () => {
    // CRITICAL: Validate user ID first
    if (!user?.id) {
      console.error('❌ BUZZ ERROR: No valid user ID available');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return;
    }

    // Log user ID for debugging
    console.log('🔥 DEBUG: FORCED BUZZ with userId:', user.id);
    
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
    
    console.log('📍 FORCED BUZZ CALL with GUARANTEED MAP_AREA:', { 
      userId: user.id,
      centerLat, 
      centerLng,
      mode: 'forced-backend-guaranteed-map-area'
    });
    
    // FORCED GENERATION with GUARANTEED MAP_AREA return
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      // Track clue unlocked event for map buzz
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('clue_unlocked');
      }
      
      console.log('✅ FORCED BUZZ SUCCESS with GUARANTEED map_area:', {
        userId: user.id,
        area: newArea,
        source: 'forced-backend-guaranteed-map-area'
      });
      
      // Force reload areas to sync with database
      await reloadAreas();
      
      // Center map on new area
      setTimeout(() => {
        if (onAreaGenerated && newArea.radius_km > 0) {
          onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
        }
      }, 200);
      
      // Execute optional callback
      if (handleBuzz) {
        handleBuzz();
      }
    }
  };
  
  const getPrecisionIndicator = () => {
    if (precisionMode === 'high') {
      return '🎯'; // High precision
    }
    return '📍'; // Lower precision
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
          className={`buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_20px_6px_rgba(255,0,128,0.45)] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)] transition-all duration-300 px-6 py-2 rounded-full font-bold tracking-wide text-base relative overflow-hidden ${isRippling ? 'ripple-effect' : ''}`}
          style={{
            animation: isGenerating ? "none" : "buzzGlow 2s infinite ease-in-out"
          }}
        >
          {isGenerating ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generando...' : 'BUZZ MAPPA'}
          <span className="ml-2 text-xs opacity-80">
            {activeArea ? `(Attivo: ${activeArea.radius_km.toFixed(1)}km)` : '(Backend Ready)'}
            {getPrecisionIndicator()}
          </span>
          <div className="text-xs opacity-70 mt-1">
            {!user?.id ? 'Login Required' : `FORCED MODE • ${dailyBuzzMapCounter} BUZZ settimana`}
          </div>
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
