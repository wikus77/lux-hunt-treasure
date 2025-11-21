// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Zap, MapPin, Star } from 'lucide-react';
import { shouldShow, markShown } from '@/lib/ux/frequencyGate';

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
  // Frequency gate: show max 1/day
  const canShowModal = shouldShow('xp-reward', 24);

  // Mark as shown when modal opens
  useEffect(() => {
    if (open && canShowModal) {
      markShown('xp-reward');
    }
  }, [open, canShowModal]);

  const handleBuzzRedirect = () => {
    onOpenChange(false);
    onRedirectToBuzz();
  };

  const handleBuzzMapRedirect = () => {
    onOpenChange(false);
    onRedirectToBuzzMap();
  };

  // Don't render if frequency gate blocks it
  if (!canShowModal) {
    return null;
  }

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
              <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300" />
            </div>
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold gradient-text mb-2">
            🎖️ BADGE SBLOCCATO!
          </DialogTitle>
          
          <p className="text-gray-300 text-sm">
            Hai guadagnato ricompense gratuite! Clicca per riscattare.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {freeBuzzCredits > 0 && (
            <button
              onClick={handleBuzzRedirect}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/60 to-purple-700/60 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600/70 rounded-full">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-white">BUZZ Gratuito Sbloccato!</p>
                  <p className="text-sm text-purple-200">Hai guadagnato un BUZZ gratuito ({freeBuzzCredits} disponibili)</p>
                </div>
              </div>
              <div className="text-3xl">🎁</div>
            </button>
          )}

          {freeBuzzMapCredits > 0 && (
            <button
              onClick={handleBuzzMapRedirect}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/60 to-cyan-700/60 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-cyan-600/70 rounded-full">
                  <MapPin className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-white">BUZZ MAPPA Gratuito Sbloccato!</p>
                  <p className="text-sm text-cyan-200">Hai guadagnato un BUZZ MAPPA gratuito ({freeBuzzMapCredits} disponibili)</p>
                </div>
              </div>
              <div className="text-3xl">🗺️</div>
            </button>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200"
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};