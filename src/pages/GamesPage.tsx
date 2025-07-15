// M1SSION™ - Games Page for iOS Capacitor
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Target, 
  Zap, 
  Brain, 
  Timer, 
  Trophy,
  Lock,
  Play,
  Star,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedNavigation } from '@/hooks/useEnhancedNavigation';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: string;
  isLocked: boolean;
  comingSoon?: boolean;
  estimatedTime: string;
}

const gamesList: GameCard[] = [
  {
    id: 'memory-hack',
    title: 'Memory Hack',
    description: 'Memorizza sequenze di codici per hackerare i sistemi di sicurezza',
    icon: Brain,
    difficulty: 'medium',
    reward: '+15 crediti',
    isLocked: false,
    estimatedTime: '3-5 min'
  },
  {
    id: 'satellite-tracking',
    title: 'Satellite Tracking',
    description: 'Traccia satelliti in movimento per intercettare segnali segreti',
    icon: Target,
    difficulty: 'hard',
    reward: '+25 crediti',
    isLocked: false,
    estimatedTime: '5-8 min'
  },
  {
    id: 'flash-interrogation',
    title: 'Flash Interrogation',
    description: 'Rispondi rapidamente alle domande per ottenere informazioni cruciali',
    icon: Zap,
    difficulty: 'easy',
    reward: '+10 crediti',
    isLocked: false,
    estimatedTime: '2-3 min'
  },
  {
    id: 'crack-combination',
    title: 'Crack the Combination',
    description: 'Decifra combinazioni numeriche usando indizi logici',
    icon: Timer,
    difficulty: 'medium',
    reward: '+20 crediti',
    isLocked: true,
    estimatedTime: '4-6 min'
  },
  {
    id: 'disarm-bomb',
    title: 'Disarm the Bomb',
    description: 'Disinnesca una bomba virtuale seguendo le istruzioni',
    icon: Trophy,
    difficulty: 'hard',
    reward: '+30 crediti',
    isLocked: true,
    comingSoon: true,
    estimatedTime: '6-10 min'
  },
  {
    id: 'find-map-point',
    title: 'Find Map Point',
    description: 'Individua punti nascosti sulla mappa usando coordinate crittografate',
    icon: Target,
    difficulty: 'medium',
    reward: '+18 crediti',
    isLocked: true,
    comingSoon: true,
    estimatedTime: '4-7 min'
  }
];

export const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const { navigateWithFeedback } = useEnhancedNavigation();
  const { vibrate } = useCapacitorHardware();

  // Handle game selection
  const handleGameSelect = preserveFunctionName(async (game: GameCard) => {
    await vibrate(30);

    if (game.isLocked) {
      toast.error('Questo gioco non è ancora disponibile');
      return;
    }

    if (game.comingSoon) {
      toast.info('Prossimamente disponibile!');
      return;
    }

    setSelectedGame(game);
  }, 'handleGameSelect');

  // Start game
  const startGame = preserveFunctionName(async (gameId: string) => {
    await vibrate(50);
    toast.success(`Avviando ${selectedGame?.title}...`);
    
    // Navigate to specific game route
    navigateWithFeedback(`/games/${gameId}`);
  }, 'startGame');

  // Get difficulty styling
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'hard':
        return { color: 'text-red-400', bg: 'bg-red-500/10' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden p-4 space-y-6" style={{
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
      paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
      paddingRight: 'max(16px, env(safe-area-inset-right, 16px))'
    }}>
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 className="w-8 h-8 text-[#00D1FF]" />
          <h1 className="text-3xl font-bold text-white">Mini Games</h1>
        </div>
        <p className="text-gray-400 max-w-md mx-auto">
          Completa i mini-giochi per guadagnare crediti extra e migliorare le tue abilità da agente
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-xl font-bold text-[#00D1FF]">6</div>
            <div className="text-xs text-gray-500">Giochi Totali</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">3</div>
            <div className="text-xs text-gray-500">Disponibili</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">85</div>
            <div className="text-xs text-gray-500">Crediti Possibili</div>
          </div>
        </div>
      </motion.div>

      {/* Games Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {gamesList.map((game, index) => {
          const GameIcon = game.icon;
          const difficultyStyle = getDifficultyStyle(game.difficulty);
          
          return (
            <motion.div
              key={game.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: game.isLocked ? 1 : 1.02 }}
              whileTap={{ scale: game.isLocked ? 1 : 0.98 }}
            >
              <Card 
                className={`glass-card cursor-pointer transition-all duration-300 ${
                  game.isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:ring-2 hover:ring-[#00D1FF]'
                } ${
                  selectedGame?.id === game.id ? 'ring-2 ring-[#00D1FF]' : ''
                }`}
                onClick={() => handleGameSelect(game)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        game.isLocked ? 'bg-gray-600' : 'bg-[#00D1FF]/20'
                      }`}>
                        {game.isLocked ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : (
                          <GameIcon className="w-6 h-6 text-[#00D1FF]" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          {game.title}
                          {game.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Soon
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`text-xs ${difficultyStyle.bg} ${difficultyStyle.color}`}
                          >
                            {game.difficulty.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {game.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm font-semibold">{game.reward}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!game.isLocked && (
                        <>
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-gray-500">
                            Best: 0 (Non giocato)
                          </span>
                        </>
                      )}
                    </div>

                    <Button
                      size="sm"
                      disabled={game.isLocked}
                      className={
                        game.isLocked 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : selectedGame?.id === game.id
                          ? 'bg-[#00D1FF] text-black'
                          : ''
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!game.isLocked) {
                          startGame(game.id);
                        }
                      }}
                    >
                      {game.isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Bloccato
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Gioca
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Coming Soon Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card bg-gradient-to-r from-[#F059FF]/20 to-[#00D1FF]/20 border-[#F059FF]/30">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-[#F059FF]" />
            <h3 className="text-xl font-bold text-white mb-2">
              Modalità Competitiva
            </h3>
            <p className="text-gray-300 mb-4">
              Sfida altri agenti in tempo reale e scala la classifica globale!
            </p>
            <Badge className="bg-[#F059FF] text-white">
              Prossimamente
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center py-4"
      >
        <p className="text-sm text-gray-500">
          Completa i giochi per sbloccare nuove sfide e guadagnare crediti bonus
        </p>
      </motion.div>
    </div>
  );
};

export default GamesPage;