// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Zap, MapPin, Star } from 'lucide-react';

interface XpRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeBuzzCredits: number;
  freeBuzzMapCredits: number;
  onRedirectToBuzz: () => void;
  onRedirectToBuzzMap: () => void;
}

export const XpRewardModal: React.FC<XpRewardModalProps> = ({
  open,
  onOpenChange,
  freeBuzzCredits,
  freeBuzzMapCredits,
  onRedirectToBuzz,
  onRedirectToBuzzMap
}) => {
  const handleBuzzRedirect = () => {
    onOpenChange(false);
    onRedirectToBuzz();
  };

  const handleBuzzMapRedirect = () => {
    onOpenChange(false);
    onRedirectToBuzzMap();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] border border-cyan-500/20">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="relative">
              <Gift className="w-16 h-16 text-yellow-400" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="absolute -top-2 -right-2"
              >
                <Star className="w-6 h-6 text-yellow-300" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold gradient-text mb-2">
            🎉 Ricompense XP!
          </DialogTitle>
          
          <p className="text-gray-300 text-sm">
            Hai guadagnato abbastanza XP per sbloccare ricompense gratuite!
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {freeBuzzCredits > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/40 to-purple-700/40 rounded-lg border border-purple-500/30"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/50 rounded-full">
                  <Zap className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <p className="font-semibold text-purple-200">Buzz Gratuiti</p>
                  <p className="text-sm text-gray-400">{freeBuzzCredits} disponibili</p>
                </div>
              </div>
              <Button
                onClick={handleBuzzRedirect}
                variant="outline"
                size="sm"
                className="bg-purple-600/20 border-purple-500/50 text-purple-200 hover:bg-purple-600/40"
              >
                Usa ora
              </Button>
            </motion.div>
          )}

          {freeBuzzMapCredits > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/40 to-cyan-700/40 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-600/50 rounded-full">
                  <MapPin className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <p className="font-semibold text-cyan-200">Buzz Mappa Gratuiti</p>
                  <p className="text-sm text-gray-400">{freeBuzzMapCredits} disponibili</p>
                </div>
              </div>
              <Button
                onClick={handleBuzzMapRedirect}
                variant="outline"
                size="sm"
                className="bg-cyan-600/20 border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/40"
              >
                Usa ora
              </Button>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/80"
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};