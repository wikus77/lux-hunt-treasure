
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
    debugCurrentState
  } = useBuzzMapLogic();
  
  const nextRadius = calculateNextRadius();
  const buzzMapPrice = calculateBuzzMapPrice();
  const activeArea = getActiveArea();
  
  // TEST FIRENZE - Coordinate fisse per debugging
  const FIRENZE_TEST_COORDS = {
    lat: 43.7807,
    lng: 11.2760,
    address: "Via Mazzini 19, Firenze, Italia"
  };
  
  const handleBuzzMapClick = async () => {
    console.log('🚀 BUZZ MAPPA TEST FIRENZE - Starting generation');
    
    // VERIFICA CRITICA: stato iniziale
    console.log('🔍 Initial state check before generation:');
    debugCurrentState();
    
    // STEP 1: Usa coordinate fisse di Firenze per il test
    const centerLat = FIRENZE_TEST_COORDS.lat;
    const centerLng = FIRENZE_TEST_COORDS.lng;
    
    console.log('📍 TEST FIRENZE - Using fixed coordinates:', { 
      centerLat, 
      centerLng, 
      address: FIRENZE_TEST_COORDS.address 
    });
    console.log('📏 Prossimo raggio calcolato:', nextRadius, 'km');
    console.log('💰 Prezzo calcolato:', buzzMapPrice, '€');
    
    // STEP 2: Genera l'area usando la logica dedicata
    console.log('💾 Generating area in database...');
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('✅ NUOVA AREA CREATA (TEST FIRENZE):', {
        id: newArea.id,
        lat: newArea.lat,
        lng: newArea.lng,
        radius_km: newArea.radius_km,
        created_at: newArea.created_at
      });
      
      // STEP 3: Forza il reload delle aree PRIMA del centering con verifica
      console.log('🔄 Forzando reload delle aree...');
      await reloadAreas();
      
      // VERIFICA CRITICA: stato dopo reload
      setTimeout(() => {
        console.log('🔍 State check after reload:');
        debugCurrentState();
      }, 100);
      
      // STEP 4: Aspetta un momento prima di centrare per assicurarsi che l'area sia stata caricata
      setTimeout(() => {
        console.log('🎯 Centrando mappa sulla nuova area di Firenze...');
        console.log('📏 Area radius for centering:', newArea.radius_km, 'km');
        
        if (onAreaGenerated) {
          console.log('🔄 Calling onAreaGenerated with coordinates:', {
            lat: newArea.lat,
            lng: newArea.lng,
            radius: newArea.radius_km
          });
          onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
        } else {
          console.log('⚠️ onAreaGenerated callback not available');
        }
      }, 200);
      
      // STEP 5: Crea notifica con il raggio REALE salvato su Supabase
      try {
        await createMapBuzzNotification(
          "Area BUZZ MAPPA Generata (TEST FIRENZE)", 
          `Nuova area di ricerca creata a ${FIRENZE_TEST_COORDS.address} con raggio ${newArea.radius_km.toFixed(1)}km`
        );
        console.log("✅ BUZZ Map notification created successfully (TEST FIRENZE)");
      } catch (error) {
        console.error("❌ Failed to create BUZZ Map notification:", error);
      }
      
      // STEP 6: Esegui callback opzionale
      if (handleBuzz) {
        handleBuzz();
      }
      
      // VERIFICA FINALE: stato dopo tutte le operazioni
      setTimeout(() => {
        console.log('🔍 FINAL STATE CHECK after all operations:');
        debugCurrentState();
      }, 500);
      
    } else {
      console.error('❌ Failed to create new area (TEST FIRENZE)');
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
          {userCluesCount} indizi - TEST FIRENZE
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
