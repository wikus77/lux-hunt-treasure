
import React from "react";
import { motion } from "framer-motion";
import { Brain, Bomb, Fingerprint, MapPin, Satellite, MessageSquare, LockKeyholeIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HomeLayout from "@/components/home/HomeLayout";
import { useProfileImage } from "@/hooks/useProfileImage";

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gameKey: string;
}

const GameCard = ({ title, description, icon, gameKey }: GameCardProps) => {
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
          disabled
          className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white" 
          size="sm"
        >
          <LockKeyholeIcon className="w-4 h-4 mr-2" />
          GIOCA
        </Button>
      </CardContent>
    </Card>
  );
};

const Games = () => {
  const { profileImage } = useProfileImage();

  const games = [
    {
      title: "Memory Hack",
      description: "Metti alla prova la tua memoria visiva",
      icon: <Brain className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "memory_hack"
    },
    {
      title: "Disinnesca la Bomba",
      description: "Trova la sequenza corretta in tempo",
      icon: <Bomb className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "bomb_defuse"
    },
    {
      title: "Cracca la Combinazione",
      description: "Decifra il codice segreto",
      icon: <Fingerprint className="text-[#00D1FF] w-5 h-5" />,
      gameKey: "crack_combination"
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
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default Games;
