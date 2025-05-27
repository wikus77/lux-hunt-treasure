
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
  const IconComponent = card.icon as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      className="aspect-square cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !disabled && onClick(card.id)}
    >
      <Card className={`w-full h-full border-2 transition-all duration-300 ${
        card.isFlipped || card.isMatched 
          ? 'border-[#00D1FF]/50 bg-[#00D1FF]/10' 
          : 'border-white/20 bg-white/5 hover:border-[#00D1FF]/30'
      }`}>
        <CardContent className="flex items-center justify-center h-full p-0">
          <AnimatePresence mode="wait">
            {card.isFlipped || card.isMatched ? (
              <motion.div
                key="front"
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 180 }}
                transition={{ duration: 0.3 }}
              >
                <IconComponent className="w-6 h-6 text-[#00D1FF]" />
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 180 }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 rounded"
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GameCard;
