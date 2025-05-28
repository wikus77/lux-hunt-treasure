
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Satellite, CheckCircle, X, RotateCcw, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClickResult {
  accuracy: number;
  targetPosition: { x: number; y: number };
  clickPosition: { x: number; y: number };
  timestamp: number;
}

const SatelliteTrackingGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'success' | 'failed'>('waiting');
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [sweepAngle, setSweepAngle] = useState(0);
  const [clickResult, setClickResult] = useState<ClickResult | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [targetSpeed, setTargetSpeed] = useState(1);
  const radarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const RADAR_SIZE = 300;
  const TARGET_SIZE = 8;
  const PRECISION_THRESHOLD = 10; // pixels
  const PERFECT_THRESHOLD = 5; // pixels

  const initializeGame = useCallback(() => {
    setGameState('playing');
    setGameStartTime(Date.now());
    setTargetSpeed(1);
    setClickResult(null);
    setSweepAngle(0);
    
    // Start target movement and radar sweep
    startAnimation();
  }, []);

  const startAnimation = useCallback(() => {
    const animate = (timestamp: number) => {
      if (!gameStartTime) return;
      
      const elapsed = (timestamp - gameStartTime) / 1000;
      
      // Increase speed after 2 seconds
      const currentSpeed = elapsed > 2 ? 1.5 : 1;
      setTargetSpeed(currentSpeed);
      
      // Update target position (elliptical movement)
      const centerX = RADAR_SIZE / 2;
      const centerY = RADAR_SIZE / 2;
      const radiusX = 100;
      const radiusY = 80;
      const angle = elapsed * currentSpeed * 0.8;
      
      const newTargetX = centerX + Math.cos(angle) * radiusX;
      const newTargetY = centerY + Math.sin(angle * 1.3) * radiusY;
      
      setTargetPosition({ x: newTargetX, y: newTargetY });
      
      // Update radar sweep
      setSweepAngle((elapsed * 60) % 360);
      
      if (gameState === 'playing') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [gameStartTime, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && gameStartTime) {
      startAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameStartTime, startAnimation]);

  const handleRadarClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !radarRef.current) return;
    
    const rect = radarRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Calculate distance from target center
    const distance = Math.sqrt(
      Math.pow(clickX - targetPosition.x, 2) + 
      Math.pow(clickY - targetPosition.y, 2)
    );
    
    const result: ClickResult = {
      accuracy: distance,
      targetPosition: { ...targetPosition },
      clickPosition: { x: clickX, y: clickY },
      timestamp: Date.now()
    };
    
    setClickResult(result);
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Determine success
    const isSuccess = distance <= PRECISION_THRESHOLD;
    const isPerfect = distance <= PERFECT_THRESHOLD;
    
    setGameState(isSuccess ? 'success' : 'failed');
    
    await saveGameProgress(isSuccess, isPerfect, distance);
  };

  const saveGameProgress = async (success: boolean, perfect: boolean, accuracy: number) => {
    if (!user) return;

    try {
      // Save game progress
      const { error: gameError } = await supabase
        .from('user_minigames_progress')
        .upsert({
          user_id: user.id,
          game_key: 'satellite_tracking',
          completed: success,
          score: success ? 3 : 0,
          last_played: new Date().toISOString()
        });

      if (gameError) throw gameError;

      if (success) {
        if (perfect) {
          // Add special unlock for perfect shot
          const { error: unlockError } = await supabase
            .from('user_buzz_bonuses')
            .insert({
              user_id: user.id,
              bonus_type: 'radar_skin',
              game_reference: 'satellite_tracking',
              awarded_at: new Date().toISOString()
            });

          if (!unlockError) {
            toast.success("COLPO PERFETTO!", {
              description: "Hai sbloccato una skin radar speciale!"
            });
          }
        } else {
          toast.success("BERSAGLIO COLPITO!", {
            description: `Precisione: ${accuracy.toFixed(1)}px - 3 crediti assegnati!`
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setClickResult(null);
    setTargetPosition({ x: 0, y: 0 });
    setSweepAngle(0);
    setGameStartTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#00D1FF]/30 rounded-full animate-pulse" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1 h-1 bg-green-400/40 rounded-full animate-pulse" style={{ top: '60%', right: '15%', animationDelay: '1s' }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00D1FF]/20 rounded-full animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Satellite className="w-8 h-8 text-[#00D1FF]" />
          <h2 className="text-2xl font-orbitron font-bold tracking-widest">
            <span className="text-[#00D1FF] neon-text" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6)"
            }}>TRACCIAMENTO</span>{' '}
            <span className="text-white">SATELLITARE</span>
          </h2>
        </div>
        <p className="text-[#00D1FF] font-sans text-sm mb-1">Colpisci il bersaglio mobile sul radar</p>
        <p className="text-white/60 font-sans text-xs">Un solo colpo disponibile</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center relative z-10">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            <Satellite className="w-5 h-5 mr-2" />
            INIZIA TRACCIAMENTO
          </Button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-4 relative z-10">
          {/* Instructions */}
          <div className="text-center p-3 bg-gradient-to-r from-[#00D1FF]/10 via-[#00D1FF]/20 to-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl">
            <p className="text-yellow-300 font-bold font-sans text-sm mb-1">
              <Crosshair className="w-4 h-4 inline mr-2" />
              CLICCA SUL BERSAGLIO
            </p>
            <p className="text-white/70 font-sans text-xs">
              Velocità: {targetSpeed > 1 ? 'AUMENTATA' : 'NORMALE'}
            </p>
          </div>

          {/* Radar Display */}
          <div className="flex justify-center">
            <div 
              ref={radarRef}
              className="relative bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 rounded-full border-2 border-[#00D1FF]/50 cursor-crosshair"
              style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
              onClick={handleRadarClick}
            >
              {/* Radar Grid */}
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}>
                {/* Concentric circles */}
                {[75, 150, 225].map((radius, index) => (
                  <circle
                    key={index}
                    cx={RADAR_SIZE / 2}
                    cy={RADAR_SIZE / 2}
                    r={radius / 2}
                    fill="none"
                    stroke="rgba(0, 209, 255, 0.3)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Cross lines */}
                <line
                  x1={RADAR_SIZE / 2}
                  y1="0"
                  x2={RADAR_SIZE / 2}
                  y2={RADAR_SIZE}
                  stroke="rgba(0, 209, 255, 0.3)"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1={RADAR_SIZE / 2}
                  x2={RADAR_SIZE}
                  y2={RADAR_SIZE / 2}
                  stroke="rgba(0, 209, 255, 0.3)"
                  strokeWidth="1"
                />
                
                {/* Radar sweep */}
                <defs>
                  <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0, 209, 255, 0)" />
                    <stop offset="50%" stopColor="rgba(0, 209, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(0, 209, 255, 0.8)" />
                  </linearGradient>
                </defs>
                <line
                  x1={RADAR_SIZE / 2}
                  y1={RADAR_SIZE / 2}
                  x2={RADAR_SIZE / 2 + Math.cos((sweepAngle - 90) * Math.PI / 180) * (RADAR_SIZE / 2)}
                  y2={RADAR_SIZE / 2 + Math.sin((sweepAngle - 90) * Math.PI / 180) * (RADAR_SIZE / 2)}
                  stroke="url(#sweepGradient)"
                  strokeWidth="2"
                />
              </svg>

              {/* Moving Target */}
              <motion.div
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{
                  left: targetPosition.x - TARGET_SIZE / 2,
                  top: targetPosition.y - TARGET_SIZE / 2,
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
                  filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {gameState === 'success' && clickResult && (
        <motion.div 
          className="text-center space-y-4 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" style={{
              filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.6))'
            }} />
            
            {/* Success glow effect */}
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/20 blur-xl" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-green-400 font-orbitron tracking-widest">
            {clickResult.accuracy <= PERFECT_THRESHOLD ? 'COLPO PERFETTO!' : 'BERSAGLIO COLPITO!'}
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Precisione: {clickResult.accuracy.toFixed(1)} pixel
            {clickResult.accuracy <= PERFECT_THRESHOLD && (
              <span className="block text-yellow-400 font-bold mt-2">
                🏆 SKIN RADAR SBLOCCATA!
              </span>
            )}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            NUOVO TRACCIAMENTO
          </Button>
        </motion.div>
      )}

      {/* Failed State */}
      {gameState === 'failed' && clickResult && (
        <motion.div 
          className="text-center space-y-4 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" style={{
            filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))'
          }} />
          
          <h3 className="text-xl font-bold text-red-400 font-orbitron tracking-widest">
            BERSAGLIO NON COLPITO
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Precisione: {clickResult.accuracy.toFixed(1)} pixel<br />
            Troppo lontano dal bersaglio ({`>${PRECISION_THRESHOLD}`}px)
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            RIPROVA
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SatelliteTrackingGame;
