
import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameState } from './gameData';

interface GameControlsProps {
  gameState: GameState;
  errors: number;
  onStartGame: () => void;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ gameState, errors, onStartGame, onResetGame }) => {
  if (gameState === 'waiting') {
    return (
      <Button 
        onClick={onStartGame}
        className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
      >
        INIZIA MEMORY HACK
      </Button>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-green-400 mb-2 font-orbitron">
          {errors <= 3 ? 'MISSIONE COMPLETATA!' : 'COMPLETATO'}
        </h3>
        <p className="text-white/70 mb-4 font-sans">
          {errors <= 3 
            ? `Errori: ${errors}/3 - Hai guadagnato 10 crediti!`
            : `Troppi errori (${errors}) - Riprova per ottenere i crediti`
          }
        </p>
        <Button 
          onClick={onResetGame}
          className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
        >
          GIOCA ANCORA
        </Button>
      </div>
    );
  }

  if (gameState === 'failed') {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2 font-orbitron">TEMPO SCADUTO!</h3>
        <p className="text-white/70 mb-4 font-sans">Riprova per completare la missione</p>
        <Button 
          onClick={onResetGame}
          className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
        >
          RIPROVA
        </Button>
      </div>
    );
  }

  return null;
};

export default GameControls;
