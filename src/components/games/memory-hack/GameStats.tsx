import React from 'react';

interface GameStatsProps {
  moves: number;
  timeElapsed: number;
  score?: number;
  timeLeft?: number;
  errors?: number;
  matchedPairs?: number;
  totalPairs?: number;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  moves, 
  timeElapsed, 
  score = 0,
  timeLeft,
  errors = 0,
  matchedPairs = 0,
  totalPairs = 8 
}) => {
  // If timeLeft is provided, use the original time-based display
  if (timeLeft !== undefined) {
    return (
      <div className="flex justify-between items-center mb-4 text-white font-sans">
        <div className="flex items-center gap-4">
          <span>Tempo: <span className="text-[#00D1FF] font-bold">{timeLeft}s</span></span>
          <span>Errori: <span className={`font-bold ${errors > 5 ? 'text-red-400' : 'text-yellow-400'}`}>{errors}/5</span></span>
        </div>
        <div>
          Coppie: <span className="text-green-400 font-bold">{matchedPairs}/{totalPairs}</span>
        </div>
      </div>
    );
  }

  // Otherwise use the moves/time elapsed display
  return (
    <div className="flex justify-between items-center mb-4 text-white font-sans">
      <div className="flex items-center gap-4">
        <span>Mosse: <span className="text-[#00D1FF] font-bold">{moves}</span></span>
        <span>Tempo: <span className="text-yellow-400 font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span></span>
      </div>
      <div>
        Punteggio: <span className="text-green-400 font-bold">{score}</span>
      </div>
    </div>
  );
};

export default GameStats;
