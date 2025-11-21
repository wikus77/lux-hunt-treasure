
import React from 'react';
import CountUp from 'react-countup';

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
          <span>Tempo: <span className="text-[#00D1FF] font-bold text-glow">
            <CountUp end={timeLeft} duration={0.5} />s
          </span></span>
          <span>Errori: <span className={`font-bold text-glow ${errors > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
            <CountUp end={errors} duration={0.5} />/5
          </span></span>
        </div>
        <div>
          Coppie: <span className="text-green-400 font-bold text-glow">
            <CountUp end={matchedPairs} duration={0.5} />/<CountUp end={totalPairs} duration={0.5} />
          </span>
        </div>
      </div>
    );
  }

  // Otherwise use the moves/time elapsed display
  return (
    <div className="flex justify-between items-center mb-4 text-white font-sans">
      <div className="flex items-center gap-4">
        <span>Mosse: <span className="text-[#00D1FF] font-bold text-glow text-2xl">
          <CountUp end={moves} duration={1} />
        </span></span>
        <span>Tempo: <span className="text-yellow-400 font-bold text-glow">
          <CountUp end={Math.floor(timeElapsed / 60)} duration={0.5} />:
          <CountUp end={timeElapsed % 60} duration={0.5} preserveValue />
        </span></span>
      </div>
      <div>
        Punteggio: <span className="text-green-400 font-bold text-glow text-2xl">
          <CountUp end={score} duration={2} separator="." />
        </span>
      </div>
    </div>
  );
};

export default GameStats;
