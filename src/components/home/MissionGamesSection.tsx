
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockKeyholeIcon, Brain, Bomb, Fingerprint, MapPin, Satellite, MessageSquare } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GameCard = ({ title, description, icon }: GameCardProps) => {
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

export default function MissionGamesSection() {
  const games = [
    {
      title: "Memory Hack",
      description: "Metti alla prova la tua memoria visiva",
      icon: <Brain className="text-[#00D1FF] w-5 h-5" />
    },
    {
      title: "Disinnesca la Bomba",
      description: "Trova la sequenza corretta in tempo",
      icon: <Bomb className="text-[#00D1FF] w-5 h-5" />
    },
    {
      title: "Cracca la Combinazione",
      description: "Decifra il codice segreto",
      icon: <Fingerprint className="text-[#00D1FF] w-5 h-5" />
    },
    {
      title: "Trova il Punto sulla Mappa",
      description: "Localizza obiettivi segreti",
      icon: <MapPin className="text-[#00D1FF] w-5 h-5" />
    },
    {
      title: "Tracciamento Satellitare",
      description: "Intercetta segnali nascosti",
      icon: <Satellite className="text-[#00D1FF] w-5 h-5" />
    },
    {
      title: "Interrogatorio Lampo",
      description: "Rispondi velocemente alle domande",
      icon: <MessageSquare className="text-[#00D1FF] w-5 h-5" />
    }
  ];

  return (
    <motion.section
      className="w-full mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-2 text-center">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.5)"
          }}>M1</span>
          <span className="text-white">SSION GAMES</span>
        </h2>
        
        <p className="text-center text-white/70 mb-6">
          Mini giochi quotidiani per veri agenti.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              <GameCard 
                title={game.title} 
                description={game.description} 
                icon={game.icon} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
