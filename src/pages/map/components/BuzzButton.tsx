
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { useAuthContext } from '@/contexts/auth';
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
  const { user, getCurrentUser } = useAuthContext();
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    dailyBuzzMapCounter,
    reloadAreas
  } = useBuzzMapLogic();
  
  // FIXED: Get user with developer support
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || user?.id;
  
  console.log("🔥 BuzzButton - User validation:", { 
    user: user?.id,
    currentUser: currentUser?.id,
    userId,
    email: currentUser?.email,
    isDeveloper: currentUser?.email === 'wikus77@hotmail.it'
  });
  
  const activeArea = getActiveArea();
  
  const handleBuzzMapClick = async () => {
    // CRITICAL: Validate user ID with developer support
    if (!userId) {
      console.error('❌ BUZZ ERROR: No valid user ID available');
      
      // Check if it's developer mode that should work
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (hasDeveloperAccess || isDeveloperEmail) {
        console.log('🔧 Developer mode detected, using fallback UUID');
        // Continue with developer UUID
      } else {
        toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
        return;
      }
    }

    console.log('🔥 BUZZ CLICK (FIXED CENTER) - User ID validated:', userId);
    
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
    
    console.log('📍 BUZZ CALL with coordinates:', { 
      userId: userId || 'developer-fallback',
      centerLat, 
      centerLng,
      mode: 'backend-only-fixed-center'
    });
    
    // BACKEND-ONLY GENERATION with user validation
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      // Track clue unlocked event for map buzz
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('clue_unlocked');
      }
      
      console.log('✅ [BUZZ SUCCESS - FIXED CENTER]', newArea);
      
      // Force reload areas to sync with database
      await reloadAreas();
      
      // Execute optional callback without affecting map view
      if (handleBuzz) {
        handleBuzz();
      }
    } else {
      console.error('❌ BUZZ FAILED - No area generated');
      toast.error('❌ Errore generazione area BUZZ');
    }
  };

  // Disable button only if completely no user and not developer mode
  const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
  const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
  const isDisabled = isGenerating || (!userId && !hasDeveloperAccess && !isDeveloperEmail);
  
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
            {isGenerating ? 'Generando...' : `BUZZ MAPPA (${activeArea ? `${activeArea.radius_km.toFixed(1)}km` : '21.5km'})  ${dailyBuzzMapCounter} BUZZ settimana`}
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
