import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Bomb, Fingerprint, MapPin, Satellite, MessageSquare, LockKeyholeIcon, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HomeLayout from "@/components/home/HomeLayout";
import { useProfileImage } from "@/hooks/useProfileImage";
import MemoryHackGame from "@/components/games/MemoryHackGame";
import DisarmTheBombGame from "@/components/games/DisarmTheBombGame";
import CrackTheCombinationGame from "@/components/games/CrackTheCombinationGame";

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gameKey: string;
  isPlayable?: boolean;
  onPlay?: () => void;
}

const GameCard = ({ title, description, icon, gameKey, isPlayable = false, onPlay }: GameCardProps) => {
  return (
    <Card className="m1ssion-glass-card border border-white/10 bg-black/40 hover:shadow-[0_0_15px_rgba(0,209,255,0.2)] transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <CardTitle className="text-md font-orbitron mt-2">{title}</CardTitle>
        <CardDescription className="text-sm text-white/70">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          disabled={!isPlayable}
          onClick={onPlay}
          className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white" 
          size="sm"
        >
          {isPlayable ? (
            <>
              <Brain className="w-4 h-4 mr-2" />
              GIOCA
            </>
          ) : (
            <>
              <LockKeyholeIcon className="w-4 h-4 mr-2" />
              GIOCA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const Games = () => {
  const { profileImage } = useProfileImage();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      title: "Memory Hack",
      description: "Metti alla prova la tua memoria visiva",
      icon: <Brain className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "memory_hack",
      isPlayable: true
    },
    {
      title: "Disinnesca la Bomba",
      description: "Trova la sequenza corretta in tempo",
      icon: <Bomb className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "disarm_the_bomb",
      isPlayable: true
    },
    {
      title: "Cracca la Combinazione",
      description: "Decifra il codice segreto",
      icon: <Fingerprint className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "crack_combination",
      isPlayable: true
    },
    {
      title: "Trova il Punto sulla Mappa",
      description: "Localizza obiettivi segreti",
      icon: <MapPin className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "find_map_point"
    },
    {
      title: "Tracciamento Satellitare",
      description: "Intercetta segnali nascosti",
      icon: <Satellite className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "satellite_tracking"
    },
    {
      title: "Interrogatorio Lampo",
      description: "Rispondi velocemente alle domande",
      icon: <MessageSquare className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "flash_interrogation"
    }
  ];

  const handlePlayGame = (gameKey: string) => {
    setActiveGame(gameKey);
  };

  const closeGame = () => {
    setActiveGame(null);
  };

  return (
    <HomeLayout profileImage={profileImage}>
      <div className="min-h-screen bg-black text-white p-4 pt-20">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
              <span className="text-[#00D1FF]" style={{ 
                textShadow: "0 0 10px rgba(0, 209, 255, 0.5)"
              }}>M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span> GAMES</span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8">
              Mini giochi quotidiani per veri agenti.
            </p>
          </div>
          
          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.gameKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              >
                <GameCard 
                  title={game.title} 
                  description={game.description} 
                  icon={game.icon}
                  gameKey={game.gameKey}
                  isPlayable={game.isPlayable}
                  onPlay={() => handlePlayGame(game.gameKey)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Memory Hack Game Modal */}
        <Dialog open={activeGame === 'memory_hack'} onOpenChange={closeGame}>
          <DialogContent className="max-w-4xl w-full bg-black/95 border-white/10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-orbitron text-white">
                  <span className="text-[#00D1FF]">MEMORY</span> HACK
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeGame}
                  className="text-white hover:text-[#00D1FF]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <MemoryHackGame />
          </DialogContent>
        </Dialog>

        {/* Disarm The Bomb Game Modal */}
        <Dialog open={activeGame === 'disarm_the_bomb'} onOpenChange={closeGame}>
          <DialogContent className="max-w-4xl w-full bg-black/95 border-white/10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-orbitron text-white">
                  <span className="text-red-400">DISINNESCA</span> LA BOMBA
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeGame}
                  className="text-white hover:text-[#00D1FF]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <DisarmTheBombGame />
          </DialogContent>
        </Dialog>

        {/* Crack The Combination Game Modal */}
        <Dialog open={activeGame === 'crack_combination'} onOpenChange={closeGame}>
          <DialogContent className="max-w-4xl w-full bg-black/95 border-white/10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-orbitron text-white">
                  <span className="text-[#00D1FF]">CRACCA</span> LA COMBINAZIONE
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeGame}
                  className="text-white hover:text-[#00D1FF]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <CrackTheCombinationGame />
          </DialogContent>
        </Dialog>
      </div>
    </HomeLayout>
  );
};

export default Games;
