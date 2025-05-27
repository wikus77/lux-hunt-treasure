
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader } from "lucide-react";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";

export interface BuzzButtonProps {
  handleBuzz?: () => void;
  radiusKm?: number;
  mapCenter?: [number, number];
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ 
  handleBuzz, 
  radiusKm = 1,
  mapCenter
}) => {
  const { createMapBuzzNotification } = useNotificationManager();
  const { 
    isGenerating, 
    calculateNextRadius, 
    calculateBuzzMapPrice,
    generateBuzzMapArea,
    getActiveArea,
    userCluesCount
  } = useBuzzMapLogic();
  
  const nextRadius = calculateNextRadius();
  const buzzMapPrice = calculateBuzzMapPrice();
  const activeArea = getActiveArea();
  
  const handleBuzzMapClick = async () => {
    // Se non c'è centro mappa, usa coordinate di fallback (Roma)
    const centerLat = mapCenter?.[0] || 41.9028;
    const centerLng = mapCenter?.[1] || 12.4964;
    
    console.log('🚀 BUZZ MAPPA pressed - Generating area at:', { centerLat, centerLng });
    console.log('📏 Prossimo raggio calcolato:', nextRadius, 'km');
    console.log('💰 Prezzo calcolato:', buzzMapPrice, '€');
    
    // STEP 1: Genera l'area usando la logica dedicata
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      // STEP 2: Crea notifica con il raggio REALE salvato su Supabase
      try {
        await createMapBuzzNotification(
          "Area BUZZ MAPPA Generata", 
          `Nuova area di ricerca creata con raggio ${newArea.radius_km.toFixed(1)}km`
        );
        console.log("✅ BUZZ Map notification created successfully");
        console.log("📏 Notifica inviata con raggio ESATTO:", newArea.radius_km.toFixed(1), "km");
      } catch (error) {
        console.error("❌ Failed to create BUZZ Map notification:", error);
      }
      
      // STEP 3: Esegui callback opzionale
      if (handleBuzz) {
        handleBuzz();
      }
    }
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
        </span>
        <div className="text-xs opacity-70 mt-1">
          {userCluesCount} indizi
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
