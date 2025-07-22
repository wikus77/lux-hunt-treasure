// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDailySpin } from '@/hooks/useDailySpin';
import { useLocation } from 'wouter';

const SEGMENTS = [
  'BUZZ x1',
  'BUZZ x2', 
  'Indizio Extra',
  'Missione Fallita',
  'Missione Fallita',
  'Nessun premio',
  'Clue di Settimana 4',
  'Missione Fallita',
  'BUZZ MAPPA gratis',
  '3h senza blocchi BUZZ',
  'Missione Fallita',
  'Premio Random'
];

// Probabilità ridotta: solo 25% di vincita
const WINNING_SEGMENTS = [0, 1, 2, 6, 8, 9, 11]; // 7 su 12 = 58%, ma con logica 25%
const LOSING_SEGMENTS = [3, 4, 5, 7, 10]; // Missione Fallita e Nessun premio

export const DailySpinWheel: React.FC = () => {
  const [, setLocation] = useLocation();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { spinWheel, isSpinning, spinResult, error } = useDailySpin();

  const getRandomSegment = () => {
    const random = Math.random();
    
    // Solo 25% di possibilità di vincere
    if (random <= 0.25) {
      // Vince: prende un segmento vincente
      const winningIndex = Math.floor(Math.random() * WINNING_SEGMENTS.length);
      return WINNING_SEGMENTS[winningIndex];
    } else {
      // Perde: prende un segmento perdente
      const losingIndex = Math.floor(Math.random() * LOSING_SEGMENTS.length);
      return LOSING_SEGMENTS[losingIndex];
    }
  };

  const handleSpin = async () => {
    if (isSpinning || isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);
    
    // Calcola il segmento vincente
    const winningSegment = getRandomSegment();
    const segmentAngle = 360 / 12; // 30 gradi per segmento
    const targetAngle = (winningSegment * segmentAngle) + (segmentAngle / 2);
    
    // Aggiunge giri extra per l'animazione (3-5 giri completi)
    const extraSpins = (Math.floor(Math.random() * 3) + 3) * 360;
    const finalRotation = extraSpins + (360 - targetAngle); // Inverso perché la ruota gira al contrario
    
    setRotation(prev => prev + finalRotation);
    
    // Invia il risultato al server
    const prize = SEGMENTS[winningSegment];
    const result = await spinWheel(prize, finalRotation);
    
    // Fine animazione dopo 4 secondi
    setTimeout(() => {
      setIsAnimating(false);
      if (result && result.success) {
        setShowResult(true);
      }
    }, 4000);
  };

  const handleRedirect = () => {
    if (spinResult?.reroute_path) {
      setLocation(spinResult.reroute_path);
    }
  };

  // Auto-close effect for losing prizes
  useEffect(() => {
    if (spinResult && showResult) {
      const losingPrizes = ['Missione Fallita', 'Nessun premio'];
      if (losingPrizes.includes(spinResult.prize)) {
        const timer = setTimeout(() => {
          setLocation('/home');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [spinResult, showResult, setLocation]);

  const segmentAngle = 360 / 12;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      {/* Titolo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
          DAILY SPIN M1SSION™
        </h1>
        <p className="text-muted-foreground">Una sola possibilità al giorno!</p>
      </div>

      {/* Container ruota */}
      <div className="relative mb-8">
        {/* Ago fisso */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-accent animate-pulse"></div>
        </div>

        {/* Ruota */}
        <div className="relative w-80 h-80">
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className={`transform transition-transform duration-[4000ms] ease-out ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Segmenti */}
            {SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              
              // Calcola le coordinate del settore
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              const x1 = 160 + 150 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 160 + 150 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 160 + 150 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 160 + 150 * Math.sin((endAngle * Math.PI) / 180);

              const pathData = [
                `M 160 160`,
                `L ${x1} ${y1}`,
                `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              // Colori alternati con tema neon
              const isWinning = WINNING_SEGMENTS.includes(index);
              const colors = isWinning 
                ? ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))']
                : ['hsl(var(--muted))', 'hsl(var(--muted-foreground))', 'hsl(var(--border))'];
              
              const color = colors[index % colors.length];

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={color}
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    className={isWinning ? 'drop-shadow-lg' : ''}
                  />
                  
                  {/* Testo del segmento */}
                  <text
                    x={160 + 100 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                    y={160 + 100 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-background text-xs font-bold"
                    transform={`rotate(${(startAngle + endAngle) / 2} ${
                      160 + 100 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)
                    } ${160 + 100 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)})`}
                  >
                    {segment}
                  </text>
                </g>
              );
            })}
            
            {/* Centro della ruota */}
            <circle
              cx="160"
              cy="160"
              r="20"
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              className="drop-shadow-lg"
            />
          </svg>
        </div>
      </div>

      {/* Pulsante GIRA ORA */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || isAnimating || !!error}
        size="lg"
        className="relative px-8 py-4 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-background shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        {isSpinning || isAnimating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
            GIRANDO...
          </div>
        ) : error ? (
          'ERRORE - RIPROVA'
        ) : (
          'GIRA ORA'
        )}
      </Button>

      {/* Errore */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Risultato */}
      {spinResult && showResult && !isAnimating && (
        <div 
          className="mt-8 p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20 text-center animate-fade-in"
        >
          <h3 className="text-2xl font-bold text-primary mb-2">🎉 RISULTATO 🎉</h3>
          <p className="text-lg text-foreground mb-4">{spinResult.message}</p>
          
          {/* Buttons based on prize type */}
          {spinResult.reroute_path ? (
            <div className="space-y-3">
              <Button 
                onClick={handleRedirect}
                className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80"
              >
                Riscatta Ora
              </Button>
              <p className="text-sm text-muted-foreground">
                Torna domani per un nuovo giro!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {['Missione Fallita', 'Nessun premio'].includes(spinResult.prize) 
                  ? 'Riprova domani per un nuovo tentativo!'
                  : 'Torna domani per un nuovo giro!'
                }
              </p>
              {['Missione Fallita', 'Nessun premio'].includes(spinResult.prize) && (
                <p className="text-xs text-muted-foreground/60">
                  Chiusura automatica tra 3 secondi...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};