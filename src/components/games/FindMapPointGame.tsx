
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { MapPin, CheckCircle, X, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

interface MapClue {
  text: string;
  target: {
    lat: number;
    lng: number;
  };
  area: string;
}

const mapClues: MapClue[] = [
  {
    text: "Dove incrociano le due torri principali",
    target: { lat: 45.4642, lng: 9.1900 },
    area: "Milano Centro"
  },
  {
    text: "Vicino alla grande piazza quadrata del centro",
    target: { lat: 41.9028, lng: 12.4964 },
    area: "Roma Centro"
  },
  {
    text: "Dove il fiume curva verso nord",
    target: { lat: 43.7696, lng: 11.2558 },
    area: "Firenze Centro"
  },
  {
    text: "Tra i portici e la torre più alta",
    target: { lat: 44.4949, lng: 11.3426 },
    area: "Bologna Centro"
  },
  {
    text: "Dove si riflette il palazzo antico",
    target: { lat: 45.4408, lng: 12.3155 },
    area: "Venezia Centro"
  }
];

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
  gameActive: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick, gameActive }) => {
  useMapEvents({
    click: (e) => {
      if (gameActive) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const FindMapPointGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'success' | 'failed'>('waiting');
  const [selectedClue, setSelectedClue] = useState<MapClue | null>(null);
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [distance, setDistance] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const initializeGame = useCallback(() => {
    const randomClue = mapClues[Math.floor(Math.random() * mapClues.length)];
    setSelectedClue(randomClue);
    setGameState('playing');
    setTimeLeft(30);
    setClickedPosition(null);
    setDistance(0);
    setIsCorrect(false);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const calculateDistance = (point1: LatLng, point2: { lat: number; lng: number }) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleMapClick = async (latlng: LatLng) => {
    if (!selectedClue || gameState !== 'playing') return;

    setClickedPosition(latlng);
    const dist = calculateDistance(latlng, selectedClue.target);
    setDistance(dist);

    const correct = dist <= 50; // 50 meters tolerance
    setIsCorrect(correct);

    if (correct) {
      setGameState('success');
      await saveGameProgress(true);
    } else {
      setGameState('failed');
      await saveGameProgress(false);
    }
  };

  const saveGameProgress = async (success: boolean) => {
    if (!user) return;

    try {
      // Save game progress
      const { error: gameError } = await supabase
        .from('user_minigames_progress')
        .upsert({
          user_id: user.id,
          game_key: 'map_target_game',
          completed: success,
          score: success ? 5 : 0,
          last_played: new Date().toISOString()
        });

      if (gameError) throw gameError;

      if (success) {
        // Add buzz bonus
        const { error: bonusError } = await supabase
          .from('user_buzz_bonuses')
          .insert({
            user_id: user.id,
            bonus_type: 'free_buzz',
            game_reference: 'map_target_game',
            awarded_at: new Date().toISOString()
          });

        if (!bonusError) {
          toast.success("PUNTO TROVATO!", {
            description: "Hai ottenuto un BUZZ gratuito!"
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setSelectedClue(null);
    setClickedPosition(null);
    setDistance(0);
    setIsCorrect(false);
    setTimeLeft(30);
  };

  const timerPercentage = (timeLeft / 30) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#00D1FF]/30 rounded-full animate-pulse" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1 h-1 bg-green-400/40 rounded-full animate-pulse" style={{ top: '60%', right: '15%', animationDelay: '1s' }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00D1FF]/20 rounded-full animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MapPin className="w-8 h-8 text-[#00D1FF]" />
          <h2 className="text-2xl font-orbitron font-bold tracking-widest">
            <span className="text-[#00D1FF] neon-text" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6)"
            }}>TROVA</span>{' '}
            <span className="text-white">IL PUNTO MAPPA</span>
          </h2>
        </div>
        <p className="text-[#00D1FF] font-sans text-sm mb-1">Individua il punto preciso seguendo l'indizio</p>
        <p className="text-white/60 font-sans text-xs">Un solo click disponibile</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center relative z-10">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            <MapPin className="w-5 h-5 mr-2" />
            INIZIA MISSIONE
          </Button>
        </div>
      )}

      {gameState === 'playing' && selectedClue && (
        <div className="space-y-6 relative z-10">
          {/* Timer */}
          <div className="flex justify-center items-center gap-4">
            <div className="relative inline-block">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={timeLeft > 10 ? "#00D1FF" : "#ff4d4d"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerPercentage / 100)}`}
                  className="transition-all duration-1000"
                  style={{
                    filter: timeLeft <= 10 ? 'drop-shadow(0 0 8px rgba(255, 77, 77, 0.8))' : 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.6))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-[#00D1FF]'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
            <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-[#00D1FF]'}`} />
          </div>

          {/* Clue */}
          <div className="text-center p-4 bg-gradient-to-r from-[#00D1FF]/10 via-[#00D1FF]/20 to-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl">
            <p className="text-yellow-300 font-bold font-sans text-lg mb-2">
              🔍 INDIZIO:
            </p>
            <p className="text-white font-sans text-base">
              {selectedClue.text}
            </p>
            <p className="text-[#00D1FF]/70 font-sans text-sm mt-2">
              Area: {selectedClue.area}
            </p>
          </div>

          {/* Map */}
          <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-[#00D1FF]/30 bg-gray-900">
            <MapContainer
              center={[selectedClue.target.lat, selectedClue.target.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler 
                onMapClick={handleMapClick} 
                gameActive={gameState === 'playing' && !clickedPosition}
              />
              
              {/* Show clicked position */}
              {clickedPosition && (
                <>
                  <Marker position={[clickedPosition.lat, clickedPosition.lng]} />
                  <Circle
                    center={[clickedPosition.lat, clickedPosition.lng]}
                    radius={20}
                    color={isCorrect ? "#22c55e" : "#ef4444"}
                    fillColor={isCorrect ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.3}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Success State */}
      {gameState === 'success' && (
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
            PUNTO TROVATO!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Distanza dal target: {distance.toFixed(0)} metri
            <span className="block text-yellow-400 font-bold mt-2">
              🏆 BUZZ GRATUITO ASSEGNATO!
            </span>
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            NUOVA MISSIONE
          </Button>
        </motion.div>
      )}

      {/* Failed State */}
      {gameState === 'failed' && (
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
            POSIZIONE ERRATA
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            {clickedPosition ? (
              <>Distanza dal target: {distance.toFixed(0)} metri<br />Troppo lontano dal punto esatto</>
            ) : (
              <>Tempo scaduto! Non hai cliccato sulla mappa</>
            )}
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

export default FindMapPointGame;
