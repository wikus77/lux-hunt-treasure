
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Lock, Trophy } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  isLocked: boolean;
  progress?: number;
  onPlay: () => void;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  rewards: string;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  isLocked,
  progress = 0,
  onPlay,
  difficulty,
  rewards
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile': return 'text-green-400';
      case 'Medio': return 'text-yellow-400';
      case 'Difficile': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 hover:border-blue-500 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            {title}
          </CardTitle>
          <div className={`text-sm ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </div>
        </div>
        <CardDescription className="text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progresso</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Trophy className="w-4 h-4" />
            <span>Ricompensa: {rewards}</span>
          </div>
          
          <Button
            onClick={onPlay}
            disabled={isLocked}
            className="w-full"
            variant={isLocked ? "secondary" : "default"}
          >
            <Play className="w-4 h-4 mr-2" />
            {isLocked ? 'Bloccato' : 'Gioca'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
