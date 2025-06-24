
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamepadIcon, Zap, Lock, Play, Star, Trophy, Clock } from 'lucide-react';

const MissionGamesSection = () => {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  const missionGames = [
    {
      id: 1,
      title: "Memory Hack",
      subtitle: "Test di Memoria Visiva",
      description: "Memorizza sequenze di codici sempre più complesse per hackerare i sistemi di sicurezza.",
      difficulty: "PRINCIPIANTE",
      duration: "3-5 min",
      rewards: "+150 XP, +50 Crediti",
      unlocked: true,
      image: "🧠",
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-400/50",
      glowColor: "shadow-blue-400/30"
    },
    {
      id: 2,
      title: "Code Breaker",
      subtitle: "Decrittazione Avanzata",
      description: "Risolvi cifrari complessi e decodifica messaggi segreti per ottenere informazioni cruciali.",
      difficulty: "INTERMEDIO",
      duration: "5-8 min",
      rewards: "+250 XP, +100 Crediti",
      unlocked: true,
      image: "🔐",
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-400/50",
      glowColor: "shadow-purple-400/30"
    },
    {
      id: 3,
      title: "Quick Hack",
      subtitle: "Velocità e Precisione",
      description: "Infiltrati nei database nemici il più velocemente possibile prima che scatti l'allarme.",
      difficulty: "AVANZATO",
      duration: "2-4 min",
      rewards: "+300 XP, +150 Crediti",
      unlocked: false,
      requiredLevel: 15,
      image: "⚡",
      color: "from-yellow-500 to-orange-500",
      borderColor: "border-yellow-400/50",
      glowColor: "shadow-yellow-400/30"
    },
    {
      id: 4,
      title: "Neural Matrix",
      subtitle: "Sfida Finale",
      description: "Il test definitivo che combina tutti gli elementi: memoria, logica, velocità e intuizione.",
      difficulty: "ESPERTO",
      duration: "10-15 min",
      rewards: "+500 XP, +300 Crediti, Item Speciale",
      unlocked: false,
      requiredLevel: 25,
      image: "🧬",
      color: "from-red-500 to-pink-600",
      borderColor: "border-red-400/50",
      glowColor: "shadow-red-400/30"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "PRINCIPIANTE":
        return "text-green-400 bg-green-400/20";
      case "INTERMEDIO":
        return "text-yellow-400 bg-yellow-400/20";
      case "AVANZATO":
        return "text-orange-400 bg-orange-400/20";
      case "ESPERTO":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-white bg-white/20";
    }
  };

  return (
    <motion.section 
      className="py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-6">
          <GamepadIcon className="w-10 h-10 text-cyan-400" />
          <h2 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            MISSION GAMES
          </h2>
          <Zap className="w-10 h-10 text-yellow-400" />
        </div>
        <p className="text-xl text-white/70 font-orbitron max-w-3xl mx-auto leading-relaxed">
          Affronta sfide cognitive progettate per testare le tue abilità da agente segreto. 
          Memoria, logica e velocità saranno le tue armi.
        </p>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
        {missionGames.map((game, index) => (
          <motion.div
            key={game.id}
            className={`relative group cursor-pointer bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl border-2 ${game.borderColor} overflow-hidden transition-all duration-500`}
            style={{
              boxShadow: `0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${game.glowColor.replace('shadow-', 'rgba(').replace('/30', ', 0.3)')}`
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
            whileHover={{ 
              scale: 1.02,
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px ${game.glowColor.replace('shadow-', 'rgba(').replace('/30', ', 0.5)')}`
            }}
          >
            {/* Lock Overlay for Locked Games */}
            {!game.unlocked && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                <Lock className="w-16 h-16 text-red-400 mb-4" />
                <span className="text-white font-orbitron font-bold mb-2">LIVELLO {game.requiredLevel} RICHIESTO</span>
                <span className="text-white/70 text-sm">Completa più missioni per sbloccare</span>
              </div>
            )}

            {/* Game Icon */}
            <div className="absolute top-6 left-6 z-10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${game.color} flex items-center justify-center text-3xl`}>
                {game.image}
              </div>
            </div>

            {/* Difficulty Badge */}
            <div className="absolute top-6 right-6 z-10">
              <span className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold ${getDifficultyColor(game.difficulty)}`}>
                {game.difficulty}
              </span>
            </div>

            {/* Game Content */}
            <div className="p-8 pt-24">
              <h3 className="text-2xl font-orbitron font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {game.title}
              </h3>
              
              <p className="text-cyan-400 font-orbitron text-sm mb-4">
                {game.subtitle}
              </p>
              
              <p className="text-white/70 leading-relaxed mb-6">
                {game.description}
              </p>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-orbitron text-blue-400">DURATA</span>
                  </div>
                  <span className="text-sm font-orbitron text-white font-bold">
                    {game.duration}
                  </span>
                </div>

                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-orbitron text-yellow-400">RICOMPENSE</span>
                  </div>
                  <span className="text-xs font-orbitron text-white">
                    {game.rewards}
                  </span>
                </div>
              </div>

              {/* Play Button */}
              {game.unlocked && (
                <motion.button
                  className={`w-full bg-gradient-to-r ${game.color} text-white font-orbitron font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 group`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Play className="w-5 h-5" />
                    <span>INIZIA PARTITA</span>
                    <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                </motion.button>
              )}
            </div>

            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none`} />
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Teaser */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-2xl border border-cyan-400/30 p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-gold-400" />
            <h3 className="text-2xl font-orbitron font-bold text-white">
              Competizione Globale
            </h3>
          </div>
          <p className="text-white/70 text-lg leading-relaxed mb-6">
            Sfida agenti da tutto il mondo e scala la classifica globale. 
            I migliori punteggi vengono premiati con bonus esclusivi.
          </p>
          
          <motion.button
            className="bg-gradient-to-r from-gold-500 to-yellow-600 text-black font-orbitron font-bold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-gold-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>VEDI CLASSIFICA</span>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default MissionGamesSection;
