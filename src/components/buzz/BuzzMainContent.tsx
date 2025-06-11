
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import BuzzPulseAnimation from './BuzzPulseAnimation';
import BuzzCountDisplay from './BuzzCountDisplay';
import BuzzInfoCard from './BuzzInfoCard';
import { Spinner } from '@/components/ui/spinner';

interface BuzzMainContentProps {
  onBuzzPress: () => void;
  canUseBuzz: boolean;
  currentBuzzCount: number;
  maxBuzzCount: number;
  onNavigateToMap: () => void;
}

const BuzzMainContent: React.FC<BuzzMainContentProps> = ({
  onBuzzPress,
  canUseBuzz,
  currentBuzzCount,
  maxBuzzCount,
  onNavigateToMap
}) => {
  const { isAuthenticated } = useAuthContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();

  const handleBuzzPress = async () => {
    if (!isAuthenticated) {
      toast.error("Accesso richiesto", {
        description: "Devi effettuare l'accesso per utilizzare questa funzione."
      });
      navigate('/login');
      return;
    }

    if (!canUseBuzz) {
      toast.error("Buzz non disponibile", {
        description: "Hai raggiunto il limite massimo di Buzz per oggi."
      });
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    playSound('buzz');

    try {
      await onBuzzPress();
      setShowPulse(true);
      
      setTimeout(() => {
        setShowPulse(false);
      }, 3000);
    } catch (error) {
      console.error("Error during buzz press:", error);
      toast.error("Errore", {
        description: "Si è verificato un errore durante l'operazione."
      });
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleMapNavigation = () => {
    playSound('buzz'); // Using 'buzz' instead of 'click' as it's a valid SoundType
    onNavigateToMap();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {/* Pulse Animation */}
      {showPulse && <BuzzPulseAnimation />}
      
      {/* Main content */}
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Buzz</h1>
          <p className="text-gray-400">
            Premi il pulsante per inviare un segnale e scoprire nuove aree sulla mappa.
          </p>
        </motion.div>

        {/* Buzz Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <BuzzCountDisplay 
            current={currentBuzzCount} 
            max={maxBuzzCount} 
          />
        </motion.div>

        {/* Buzz Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <Button
            onClick={handleBuzzPress}
            disabled={!canUseBuzz || isAnimating || isLoading}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              canUseBuzz 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
                : 'bg-gray-700'
            }`}
          >
            {isLoading ? (
              <Spinner className="w-12 h-12 text-white" />
            ) : (
              <Zap className={`w-16 h-16 ${isAnimating ? 'animate-pulse' : ''}`} />
            )}
          </Button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <BuzzInfoCard />
        </motion.div>

        {/* Map Navigation Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            onClick={handleMapNavigation}
            variant="outline"
            className="border-cyan-500 text-cyan-500 hover:bg-cyan-950"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Vai alla mappa
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default BuzzMainContent;
