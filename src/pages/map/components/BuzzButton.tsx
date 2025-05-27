
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon } from "lucide-react";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapPricing } from "../hooks/useBuzzMapPricing";

export interface BuzzButtonProps {
  handleBuzz: () => void;
  buzzMapPrice: number;
  radiusKm?: number;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ 
  handleBuzz, 
  buzzMapPrice,
  radiusKm = 1
}) => {
  const { createMapBuzzNotification } = useNotificationManager();
  
  const handleBuzzClick = async () => {
    console.log("BUZZ MAPPA pressed - generating search area with radius:", radiusKm, "km");
    
    // Execute the main buzz function (generates search area)
    handleBuzz();
    
    // Create a notification for the generated area
    try {
      await createMapBuzzNotification(
        "Area BUZZ Generata", 
        `Nuova area di ricerca creata con raggio ${radiusKm}km sulla mappa.`
      );
      console.log("Map Buzz notification created successfully");
    } catch (error) {
      console.error("Failed to create Map Buzz notification:", error);
    }
  };
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={handleBuzzClick}
        className="buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_20px_6px_rgba(255,0,128,0.45)] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)] transition-all duration-300 px-6 py-2 rounded-full font-bold tracking-wide text-base"
        style={{
          animation: "buzzGlow 2s infinite ease-in-out"
        }}
      >
        <CircleIcon className="mr-2 h-4 w-4" />
        BUZZ MAPPA €{buzzMapPrice.toFixed(2)}
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
