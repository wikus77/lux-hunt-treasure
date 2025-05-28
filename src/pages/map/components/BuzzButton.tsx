
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";

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
  const { createMapBuzzNotification } = useNotificationManager();
  const { 
    isGenerating, 
    calculateNextRadius, 
    calculateBuzzMapPrice,
    generateBuzzMapArea,
    getActiveArea,
    userCluesCount,
    reloadAreas,
    debugCurrentState,
    dailyBuzzMapCounter,
    precisionMode
  } = useBuzzMapLogic();
  
  const nextRadius = calculateNextRadius();
  const buzzMapPrice = calculateBuzzMapPrice();
  const activeArea = getActiveArea();
  
  const handleBuzzMapClick = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 BUZZ MAPPA - Starting generation');
      debugCurrentState();
    }
    
    // Use map center coordinates or default to Rome
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Using map center coordinates:', { 
        centerLat, 
        centerLng,
        nextRadius: nextRadius,
        price: buzzMapPrice,
        precision: precisionMode,
        weeklyCount: dailyBuzzMapCounter
      });
    }
    
    // Generate the area using the advanced pricing logic
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ NUOVA AREA CREATA:', {
          id: newArea.id,
          lat: newArea.lat,
          lng: newArea.lng,
          radius_km: newArea.radius_km,
          created_at: newArea.created_at
        });
      }
      
      // Force reload areas
      await reloadAreas();
      
      // Center map on new area
      setTimeout(() => {
        if (onAreaGenerated) {
          onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
        }
      }, 200);
      
      // Create notification
      try {
        const precisionText = precisionMode === 'high' ? 'Alta Precisione' : 'Precisione Ridotta';
        await createMapBuzzNotification(
          "Area BUZZ MAPPA Generata", 
          `Nuova area di ricerca creata con raggio ${newArea.radius_km.toFixed(1)}km - ${precisionText}`
        );
      } catch (error) {
        console.error("❌ Failed to create BUZZ Map notification:", error);
      }
      
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
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={handleBuzzMapClick}
        disabled={isGenerating}
        className="buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_20px_6px_rgba(255,0,128,0.45)] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)] transition-all duration-300 px-6 py-2 rounded-full font-bold tracking-wide text-base"
        style={{
          animation: isGenerating ? "none" : "buzzGlow 2s infinite ease-in-out"
        }}
      >
        {isGenerating ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CircleIcon className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? 'Generando...' : `BUZZ ${buzzMapPrice.toFixed(2)}€`}
        <span className="ml-2 text-xs opacity-80">
          {activeArea ? `(Attivo: ${activeArea.radius_km.toFixed(1)}km)` : `(R: ${nextRadius.toFixed(1)}km)`}
          {getPrecisionIndicator()}
        </span>
        <div className="text-xs opacity-70 mt-1">
          {userCluesCount} indizi • {dailyBuzzMapCounter} BUZZ settimana
        </div>
      </Button>
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
          50% { box-shadow: 0 0 22px rgba(255, 0, 204, 0.88), 0 0 33px rgba(0, 207, 255, 0.55); }
          100% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
        }
        `}
      </style>
    </div>
  );
};

export default BuzzButton;
