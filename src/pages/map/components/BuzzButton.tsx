
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

export interface BuzzButtonProps {
  handleBuzz?: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radiusKm: number) => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({
  handleBuzz,
  mapCenter,
  onAreaGenerated
}) => {
  const { playSound } = useSoundEffects();
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentWeekAreas } = useBuzzMapLogic();

  const handleBuzzPress = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    playSound('buzz');
    
    try {
      if (handleBuzz) {
        handleBuzz();
      }
      
      // Simulate area generation
      if (mapCenter && onAreaGenerated) {
        const radius = 5; // Default radius in km
        onAreaGenerated(mapCenter[0], mapCenter[1], radius);
      }
      
      toast.success('Area BUZZ generata!');
    } catch (error) {
      console.error('Error generating buzz area:', error);
      toast.error('Errore nella generazione dell\'area');
    } finally {
      setIsGenerating(false);
    }
  };

  const canUseBuzz = currentWeekAreas.length < 3; // Limit to 3 areas per week

  return (
    <motion.div className="fixed bottom-20 right-4 z-50">
      <motion.button
        className={`relative rounded-full shadow-lg transition-all duration-300 ${
          canUseBuzz
            ? 'bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95'
            : 'bg-gray-500 cursor-not-allowed opacity-50'
        }`}
        onClick={handleBuzzPress}
        disabled={!canUseBuzz || isGenerating}
        style={{
          width: '80px',
          height: '80px',
        }}
        whileTap={{ scale: canUseBuzz ? 0.9 : 1 }}
        aria-label="Genera Area BUZZ"
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center">
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MapPin className="text-white" size={32} />
            </motion.div>
          ) : (
            <Zap className="text-white" size={32} />
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default BuzzButton;
