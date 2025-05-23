
import React from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon } from "lucide-react";

interface BuzzButtonProps {
  handleBuzz: () => void;
  buzzMapPrice: number;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ handleBuzz, buzzMapPrice }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={handleBuzz}
        className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_15px_rgba(217,70,239,0.7)]"
      >
        <CircleIcon className="mr-1 h-4 w-4" />
        BUZZ {buzzMapPrice.toFixed(2)}€
      </Button>
    </div>
  );
};

export default BuzzButton;
