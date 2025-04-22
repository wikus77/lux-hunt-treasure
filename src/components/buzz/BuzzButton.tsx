
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import useBuzzSound from '@/hooks/useBuzzSound';

interface BuzzButtonProps {
  onBuzzClick: () => void;
}

const BuzzButton = ({ onBuzzClick }: BuzzButtonProps) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const { playSound } = useBuzzSound();

  const handleClick = () => {
    playSound();
    setIsVaultOpen(true);
    
    setTimeout(() => {
      setIsVaultOpen(false);
      onBuzzClick();
    }, 1500);
  };

  return (
    <div className={`transition-all duration-500 ${isVaultOpen ? "scale-125" : "scale-100"}`}>
      <Button
        onClick={handleClick}
        className={`w-48 h-48 rounded-full bg-gradient-to-r from-projectx-blue to-projectx-pink flex items-center justify-center text-4xl font-bold shadow-[0_0_40px_rgba(217,70,239,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(217,70,239,0.7)] ${
          isVaultOpen ? "animate-pulse" : ""
        }`}
      >
        <Zap className="w-24 h-24" />
      </Button>
    </div>
  );
};

export default BuzzButton;
