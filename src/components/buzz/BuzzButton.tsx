
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { useSound } from '@/contexts/SoundContext';

interface BuzzButtonProps {
  onBuzzClick: () => void;
  unlockedClues: number;
  updateUnlockedClues?: (val: number) => void;
  isMapBuzz?: boolean;
}

const MAX_CLUES = 1000; // Consistent max clues limit

const BuzzButton = ({ onBuzzClick, unlockedClues, updateUnlockedClues, isMapBuzz = false }: BuzzButtonProps) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const { soundPreference, volume, isEnabled } = useSound();
  const { playSound, initializeSound } = useBuzzSound();

  useEffect(() => {
    initializeSound(soundPreference, volume[0] / 100);
  }, [soundPreference, volume, initializeSound]);

  const handleClick = () => {
    if (isEnabled) {
      playSound();
    }
    setIsVaultOpen(true);

    setTimeout(() => {
      setIsVaultOpen(false);
      // We'll handle clue incrementing elsewhere
      onBuzzClick();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
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

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Limite: {MAX_CLUES} indizi supplementari per evento
        </p>
        <p className="text-sm mt-1 font-medium">
          {unlockedClues}/{MAX_CLUES} indizi sbloccati
        </p>
      </div>
    </div>
  );
};

export default BuzzButton;
