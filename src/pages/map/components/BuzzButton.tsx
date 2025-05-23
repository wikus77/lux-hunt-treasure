
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon } from "lucide-react";
import { useBuzzMapPricing } from '../hooks/useBuzzMapPricing';

interface BuzzButtonProps {
  handleBuzz: () => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ handleBuzz }) => {
  const { buzzMapPrice, isLoading } = useBuzzMapPricing();
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={handleBuzz}
        className="buzz-button bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] text-white shadow-[0_0_15px_5px_rgba(255,0,128,0.4)] hover:shadow-[0_0_20px_8px_rgba(255,0,128,0.6)] transition-all duration-300 px-6 py-2 rounded-full font-bold tracking-wide text-base"
        disabled={isLoading}
      >
        <CircleIcon className="mr-2 h-4 w-4" />
        BUZZ {buzzMapPrice.toFixed(2)}€
      </Button>
    </div>
  );
};

export default BuzzButton;
