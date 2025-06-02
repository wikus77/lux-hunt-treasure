
import { useState } from 'react';

export interface GameStats {
  gamesPlayed: number;
  totalPoints: number;
  averageScore: number;
}

export const useGameLogic = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalPoints: 0,
    averageScore: 0
  });

  const updateStats = (points: number) => {
    setScore(prev => prev + points);
    setGameStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      totalPoints: prev.totalPoints + points,
      averageScore: Math.round((prev.totalPoints + points) / (prev.gamesPlayed + 1))
    }));
    
    // Level up every 500 points
    const newLevel = Math.floor((score + points) / 500) + 1;
    setLevel(newLevel);
  };

  return {
    score,
    level,
    gameStats,
    updateStats
  };
};
