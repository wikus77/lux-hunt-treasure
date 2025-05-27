
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { GameCard as GameCardType } from './gameData';

interface GameCardProps {
  card: GameCardType;
  onClick: (cardId: number) => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onClick, disabled }) => {
  const IconComponent = card.icon;

  const getCardStyle = () => {
    if (card.isMatched) {
      return 'border-green-400/70 bg-green-400/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
    }
    if (card.isFlipped) {
      return 'border-[#00D1FF]/70 bg-[#00D1FF]/20 shadow-[0_0_10px_rgba(0,209,255,0.3)]';
    }
    return 'border-white/20 bg-[#1b1b1b] hover:border-[#00D1FF]/40 hover:bg-[#00D1FF]/5 cursor-pointer';
  };

  const shouldShowIcon = card.isFlipped || card.isMatched;
  const isClickable = !disabled && !card.isMatched && !card.isFlipped;

  return (
    <motion.div
      className="aspect-square"
      whileHover={isClickable ? { scale: 1.05 } : { scale: 1 }}
      whileTap={isClickable ? { scale: 0.95 } : { scale: 1 }}
      onClick={() => isClickable && onClick(card.id)}
    >
      <Card className={`w-full h-full border-2 transition-all duration-500 rounded-xl ${getCardStyle()}`}>
        <CardContent className="flex items-center justify-center h-full p-0">
          <AnimatePresence mode="wait">
            {shouldShowIcon ? (
              <motion.div
                key="front"
                initial={{ rotateY: 180, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                exit={{ rotateY: 180, scale: 0.8 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <IconComponent className={`w-8 h-8 ${
                  card.isMatched ? 'text-green-400' : 'text-[#00D1FF]'
                }`} />
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: 0, scale: 1 }}
                animate={{ rotateY: 0, scale: 1 }}
                exit={{ rotateY: 180, scale: 0.8 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center relative"
              >
                <div className="text-center">
                  <span className="text-[#00D1FF] font-orbitron font-bold text-lg tracking-wider drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]">
                    M1
                  </span>
                  <span className="text-white font-orbitron font-bold text-lg tracking-wider">
                    SSION
                  </span>
                  <span className="text-white font-orbitron text-xs align-top">
                    ™
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GameCard;
