
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '@/components/games/GameCard';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

const Games = () => {
  const { getCurrentUser } = useAuthContext();
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  
  // Check if current user is admin (wikus77@hotmail.it)
  const currentUser = getCurrentUser();
  const isAdminUser = currentUser?.email === 'wikus77@hotmail.it';

  const games = [
    {
      title: "Memory Hack",
      description: "Metti alla prova la tua memoria visiva",
      difficulty: 'easy' as const,
      points: 100,
      icon: "🧠"
    },
    {
      title: "Disinnesca la Bomba",
      description: "Trova la sequenza corretta in tempo",
      difficulty: 'hard' as const,
      points: 300,
      icon: "💣"
    },
    {
      title: "Cracca la Combinazione",
      description: "Decifra il codice segreto",
      difficulty: 'medium' as const,
      points: 200,
      icon: "🔐"
    },
    {
      title: "Trova il Punto Mappa",
      description: "Localizza obiettivi segreti",
      difficulty: 'medium' as const,
      points: 250,
      icon: "📍"
    },
    {
      title: "Tracciamento Satellitare",
      description: "Intercetta segnali nascosti",
      difficulty: 'hard' as const,
      points: 350,
      icon: "🛰️"
    },
    {
      title: "Interrogatorio Lampo",
      description: "Rispondi velocemente alle domande",
      difficulty: 'easy' as const,
      points: 150,
      icon: "💬"
    }
  ];

  useEffect(() => {
    // If admin user, show some games as completed for demonstration
    if (isAdminUser) {
      setCompletedGames(['Memory Hack', 'Cracca la Combinazione']);
    }
  }, [isAdminUser]);

  const handlePlayGame = (gameTitle: string) => {
    if (isAdminUser) {
      toast.success(`Avvio ${gameTitle}`, {
        description: "Funzionalità completa attiva per admin"
      });
      
      // Simulate game completion for demo
      if (!completedGames.includes(gameTitle)) {
        setTimeout(() => {
          setCompletedGames(prev => [...prev, gameTitle]);
          toast.success(`${gameTitle} completato!`, {
            description: "Punti assegnati al tuo profilo"
          });
        }, 2000);
      }
    }
  };

  if (!isAdminUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-orbitron font-bold mb-4 text-white">
            M1SSION<span className="text-xs align-top">™</span> GAMES
          </h1>
          <p className="text-gray-400 mb-8">
            I giochi saranno disponibili presto per tutti gli agenti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-orbitron font-bold mb-4">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.5)"
            }}>M1</span>
            <span className="text-white">SSION<span className="text-xs align-top">™</span> GAMES</span>
          </h1>
          <p className="text-gray-400">
            Mini giochi quotidiani per veri agenti. Completa le missioni per guadagnare punti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              <GameCard
                game={game}
                isCompleted={completedGames.includes(game.title)}
                onPlay={() => handlePlayGame(game.title)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#00D1FF]/20 to-[#7B2EFF]/20 rounded-full border border-[#00D1FF]/30">
            <span className="text-[#00D1FF] font-medium">
              Punti totali: {completedGames.length * 200}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Games;
