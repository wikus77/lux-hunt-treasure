
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';

interface Game {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  icon: string;
}

interface GameCardProps {
  game: Game;
  isCompleted: boolean;
  onPlay: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isCompleted, onPlay }) => {
  const { getCurrentUser } = useAuthContext();
  
  const currentUser = getCurrentUser();
  const isSpecialUser = currentUser?.email === 'wikus77@hotmail.it';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card border-white/10 hover:border-[#00D1FF]/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{game.icon}</div>
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">{game.title}</h3>
          <p className="text-gray-400 text-sm mb-4">{game.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <Badge className={getDifficultyColor(game.difficulty)}>
              {game.difficulty.toUpperCase()}
            </Badge>
            <span className="text-[#00D1FF] font-semibold">{game.points} pts</span>
          </div>
          
          <Button 
            onClick={onPlay}
            className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:opacity-90"
            disabled={!isSpecialUser && isCompleted}
          >
            {isCompleted ? 'Completato' : 'Gioca'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
