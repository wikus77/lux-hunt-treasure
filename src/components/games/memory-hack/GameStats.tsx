
import React from 'react';

interface GameStatsProps {
  timeLeft: number;
  errors: number;
  matchedPairs: number;
  totalPairs: number;
}

const GameStats: React.FC<GameStatsProps> = ({ timeLeft, errors, matchedPairs, totalPairs }) => {
  return (
    <div className="flex justify-between items-center mb-4 text-white">
      <div className="flex items-center gap-4">
        <span>Tempo: <span className="text-[#00D1FF] font-bold">{timeLeft}s</span></span>
        <span>Errori: <span className="text-red-400 font-bold">{errors}</span></span>
      </div>
      <div>
        Coppie: <span className="text-green-400 font-bold">{matchedPairs}/{totalPairs}</span>
      </div>
    </div>
  );
};

export default GameStats;
