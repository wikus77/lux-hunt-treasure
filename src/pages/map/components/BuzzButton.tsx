
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon } from "lucide-react";
import { useNotificationManager } from "@/hooks/useNotificationManager";

export interface BuzzButtonProps {
  handleBuzz: () => void;
  buzzMapPrice: number;
  radiusKm?: number; // Add this prop with optional type
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ 
  handleBuzz, 
  buzzMapPrice,
  radiusKm = 1 // Default value if not provided
}) => {
  const { createMapBuzzNotification } = useNotificationManager();
  
  const handleBuzzClick = async () => {
    handleBuzz();
    
    // Add notification for Map Buzz action
    createMapBuzzNotification(
      "Mappa generata con BUZZ", 
      `Area di raggio ${radiusKm}km creata con successo.`
    );
  };
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={handleBuzzClick}
        className="buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_15px_5px_rgba(255,0,128,0.4)] hover:shadow-[0_0_20px_8px_rgba(255,0,128,0.6)] transition-all duration-300 px-6 py-2 rounded-full font-bold tracking-wide text-base"
      >
        <CircleIcon className="mr-2 h-4 w-4" />
        BUZZ {buzzMapPrice.toFixed(2)}€
      </Button>
    </div>
  );
};

export default BuzzButton;
