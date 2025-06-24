
import { motion } from "framer-motion";
import { Gamepad2, Zap, Brain, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const games = [
  {
    id: "memory-hack",
    title: "Memory Hack",
    description: "Testa la tua memoria con sequenze sempre più complesse",
    icon: Brain,
    difficulty: "Medio",
    reward: "10-25 crediti",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "code-crack",
    title: "Code Crack", 
    description: "Decifra codici segreti prima che scada il tempo",
    icon: Code,
    difficulty: "Difficile",
    reward: "20-40 crediti",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "reflex-challenge",
    title: "Reflex Challenge",
    description: "Metti alla prova i tuoi riflessi in sfide cronometrate",
    icon: Zap,
    difficulty: "Facile",
    reward: "5-15 crediti",
    color: "from-yellow-500 to-orange-500"
  }
];

const MissionGamesSection = () => {
  return (
    <div className="mt-8 px-4">
      <motion.h2 
        className="text-xl font-bold text-center mb-4 text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-cyan-400">M1SSION</span> GAMES
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${game.color}`}>
                    <game.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{game.title}</h3>
                    <span className="text-xs text-cyan-400">{game.difficulty}</span>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4">{game.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-yellow-400 font-medium">
                    {game.reward}
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    ATTIVO
                  </span>
                </div>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white font-medium`}
                  size="sm"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Gioca Ora
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MissionGamesSection;
