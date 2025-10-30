/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural HUD
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Undo2, Target } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { NeuralGameState } from './types';

interface UiHUDProps {
  gameState: NeuralGameState | null;
  onReset: () => void;
  onUndo: () => void;
  onRecenter?: () => void;
}

export const UiHUD: React.FC<UiHUDProps> = ({
  gameState,
  onReset,
  onUndo,
  onRecenter
}) => {
  const [isMuted, setIsMuted] = useState(audioEngine.isMutedState());
  const [elapsed, setElapsed] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const total = Math.floor((now - gameState.startedAt) / 1000) + gameState.elapsedSeconds;
      setElapsed(total);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    // Hide tooltip after 5 seconds
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioEngine.setMuted(newMuted);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState) return null;

  const pairsTotal = new Set(gameState.nodes.map(n => n.pairId)).size;
  const pairsConnected = gameState.links.length;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Seed:</span>
            <span className="text-sm font-mono text-primary">{gameState.seed.slice(0, 6)}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mosse:</span>
            <span className="text-sm font-semibold text-foreground">{gameState.moves}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tempo:</span>
            <span className="text-sm font-mono text-foreground">{formatTime(elapsed)}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Collegamenti:</span>
            <span className="text-sm font-semibold text-foreground">
              {pairsConnected}/{pairsTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-primary" />
          )}
        </button>
        
        {onRecenter && (
          <button
            onClick={onRecenter}
            className="w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
            title="Recenter View"
          >
            <Target className="w-4 h-4 text-foreground" />
          </button>
        )}
        
        <button
          onClick={onUndo}
          disabled={gameState.links.length === 0}
          className="w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo Last Connection"
        >
          <Undo2 className="w-4 h-4 text-foreground" />
        </button>
        
        <button
          onClick={onReset}
          className="w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-destructive/20 transition-colors"
          title="Reset Game"
        >
          <RotateCcw className="w-4 h-4 text-destructive" />
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && !gameState.solved && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm text-foreground text-center">
              <span className="font-semibold">Trascina su una sfera</span> per collegarla alla coppia · 
              <span className="font-semibold ml-1">Niente intersezioni!</span>
            </p>
          </div>
        </div>
      )}

      {/* Victory Banner with neural surge animation */}
      {gameState.solved && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="relative bg-primary/20 backdrop-blur-md border-2 border-primary rounded-xl px-8 py-6 shadow-2xl animate-in zoom-in-95 duration-500">
            {/* Neural surge glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl animate-pulse blur-xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary mb-2 text-center flex items-center justify-center gap-2">
                <span className="animate-pulse">⚡</span>
                DNA Sinaptico Allineato
                <span className="animate-pulse">⚡</span>
              </h2>
              <p className="text-foreground text-center mb-4">
                Completato in {gameState.moves} mosse · {formatTime(elapsed)}
              </p>
              <button
                onClick={onReset}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Nuova Partita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
