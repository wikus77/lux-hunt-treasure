
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

interface BuzzButtonSecureProps {
  onBuzzPress: () => void;
  canUseBuzz: boolean;
  currentCount: number;
  maxCount: number;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({
  onBuzzPress,
  canUseBuzz,
  currentCount,
  maxCount
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const { playSound } = useSoundEffects();
  const [isLocked, setIsLocked] = useState(false);
  const { currentWeekAreas } = useBuzzMapLogic();

  const handleBuzzPress = () => {
    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare il Buzz!');
      return;
    }

    if (!canUseBuzz) {
      toast.error('Non puoi usare il Buzz in questa area!');
      return;
    }

    if (isLocked) {
      toast.error('Calma, un Buzz alla volta!');
      return;
    }

    setIsLocked(true);
    playSound('buzz');
    onBuzzPress();

    setTimeout(() => {
      setIsLocked(false);
    }, 2000);
  };

  return (
    <motion.div className="fixed bottom-20 right-4 z-50">
      <motion.button
        className={`relative rounded-full shadow-lg transition-all duration-300
          ${canUseBuzz && isAuthenticated
            ? 'bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95'
            : 'bg-gray-500 cursor-not-allowed opacity-50'
          }
        `}
        onClick={handleBuzzPress}
        disabled={!canUseBuzz || !isAuthenticated || isLocked}
        style={{
          width: '80px',
          height: '80px',
        }}
        whileTap={{ scale: canUseBuzz && isAuthenticated ? 0.9 : 1 }}
        aria-label="Premi il Buzz"
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center">
          {isLocked ? (
            <Lock className="text-white" size={32} />
          ) : (
            <Zap className="text-white" size={32} />
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default BuzzButtonSecure;
