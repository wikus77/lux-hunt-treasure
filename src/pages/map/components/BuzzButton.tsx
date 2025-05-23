
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon } from "lucide-react";
import { useNotificationManager } from "@/hooks/useNotificationManager";

export interface BuzzButtonProps {
  handleBuzz: () => void;
  buzzMapPrice: number;
  radiusKm?: number; // Optional radius parameter
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ 
  handleBuzz, 
  buzzMapPrice,
  radiusKm = 1 // Default value if not provided
}) => {
  const { createMapBuzzNotification } = useNotificationManager();
  
  const handleBuzzClick = async () => {
    // Execute the main buzz function
    handleBuzz();
    
    // Create a notification and ensure it's created successfully
    try {
      await createMapBuzzNotification(
        "Mappa generata con BUZZ", 
        `Area di raggio ${radiusKm}km creata con successo.`
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
        BUZZ {buzzMapPrice.toFixed(2)}€
      </Button>
      <style jsx>{`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 7px rgba(255, 0, 204, 0.6); }
          50% { box-shadow: 0 0 20px rgba(255, 0, 204, 0.8), 0 0 30px rgba(0, 207, 255, 0.4); }
          100% { box-shadow: 0 0 7px rgba(255, 0, 204, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default BuzzButton;
