
import React from 'react';
import { ClueBox } from './ClueBox';
import { TimeBox } from './TimeBox';
import { MissionStatusBox } from './MissionStatusBox';

export const TreasureHuntPanel: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text-cyan mb-2">Caccia al Tesoro Urbano</h2>
        <p className="text-white/70 text-sm">Tocca ogni box per vedere i dettagli</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ClueBox />
        <TimeBox />
        <MissionStatusBox />
      </div>
    </div>
  );
};
