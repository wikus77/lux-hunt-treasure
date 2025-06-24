
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Eye, Sparkles, Zap, Star } from 'lucide-react';

const MysteryPrizesSection = () => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealedPrizes, setRevealedPrizes] = useState<Set<number>>(new Set());

  const mysteryPrizes = [
    {
      id: 1,
      tier: "BRONZE",
      progress: 25,
      unlockLevel: 20,
      revealedPrize: "Apple MacBook Pro 16\"",
      hint: "Strumento professionale per creativi",
      value: "€ 3.000",
      rarity: "COMUNE"
    },
    {
      id: 2,
      tier: "SILVER", 
      progress: 60,
      unlockLevel: 50,
      revealedPrize: "Rolex Submariner",
      hint: "Simbolo di eleganza senza tempo",
      value: "€ 8.000",
      rarity: "RARO"
    },
    {
      id: 3,
      tier: "GOLD",
      progress: 15,
      unlockLevel: 75,
      revealedPrize: "Vacanza Maldive",
      hint: "Paradiso tropicale esclusivo",
      value: "€ 15.000",
      rarity: "EPICO"
    },
    {
      id: 4,
      tier: "PLATINUM",
      progress: 5,
      unlockLevel: 90,
      revealedPrize: "???",
      hint: "Il premio definitivo ti aspetta",
      value: "INCALCOLABILE",
      rarity: "LEGGENDARIO"
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE":
        return {
          gradient: "from-amber-700 to-amber-500",
          border: "border-amber-500/50",
          glow: "shadow-amber-400/30",
          text: "text-amber-400"
        };
      case "SILVER":
        return {
          gradient: "from-gray-700 to-gray-400",
          border: "border-gray-400/50", 
          glow: "shadow-gray-400/30",
          text: "text-gray-300"
        };
      case "GOLD":
        return {
          gradient: "from-yellow-700 to-yellow-400",
          border: "border-yellow-400/50",
          glow: "shadow-yellow-400/30",
          text: "text-yellow-400"
        };
      case "PLATINUM":
        return {
          gradient: "from-purple-700 to-pink-500",
          border: "border-purple-400/50",
          glow: "shadow-purple-400/30",
          text: "text-purple-400"
        };
      default:
        return {
          gradient: "from-gray-700 to-gray-500",
          border: "border-gray-500/50",
          glow: "shadow-gray-400/30",
          text: "text-gray-400"
        };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "COMUNE":
        return "text-green-400 bg-green-400/20";
      case "RARO":
        return "text-blue-400 bg-blue-400/20";
      case "EPICO":
        return "text-purple-400 bg-purple-400/20";
      case "LEGGENDARIO":
        return "text-orange-400 bg-orange-400/20";
      default:
        return "text-white bg-white/20";
    }
  };

  const handleRevealPrize = (prizeId: number) => {
    setRevealedPrizes(prev => new Set([...prev, prizeId]));
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
          <Gift className="w-10 h-10 text-purple-400" />
          <h2 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            MYSTERY VAULT
          </h2>
          <Sparkles className="w-10 h-10 text-pink-400" />
        </div>
        <p className="text-xl text-white/70 font-orbitron max-w-3xl mx-auto leading-relaxed">
          Scrigni misteriosi che si sbloccano con i tuoi progressi. Più avanzi, più premi incredibili ti aspettano.
        </p>
      </motion.div>

      {/* Prizes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
        {mysteryPrizes.map((prize, index) => {
          const tierColors = getTierColor(prize.tier);
          const isUnlocked = prize.progress >= prize.unlockLevel;
          const isRevealed = revealedPrizes.has(prize.id);
          
          return (
            <motion.div
              key={prize.id}
              className={`relative group cursor-pointer bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl border-2 ${tierColors.border} overflow-hidden transition-all duration-500 hover:scale-105`}
              style={{
                boxShadow: `0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${tierColors.glow.replace('shadow-', 'rgba(').replace('/30', ', 0.3)')}`
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedBox(selectedBox === prize.id ? null : prize.id)}
              whileHover={{ 
                boxShadow: `0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px ${tierColors.glow.replace('shadow-', 'rgba(').replace('/30', ', 0.5)')}`
              }}
            >
              {/* Tier Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold bg-gradient-to-r ${tierColors.gradient} text-black`}>
                  {prize.tier}
                </span>
              </div>

              {/* Rarity Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-orbitron font-bold ${getRarityColor(prize.rarity)}`}>
                  {prize.rarity}
                </span>
              </div>

              {/* Prize Content */}
              <div className="p-8 h-80 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {!isUnlocked ? (
                    <motion.div
                      key="locked"
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Lock className={`w-16 h-16 ${tierColors.text} mb-4`} />
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        BLOCCATO
                      </h3>
                      <p className="text-sm text-white/70 mb-4">
                        {prize.hint}
                      </p>
                      <div className="w-full">
                        <div className="flex justify-between text-xs font-orbitron text-white/50 mb-2">
                          <span>Progresso</span>
                          <span>{prize.progress}% / {prize.unlockLevel}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${tierColors.gradient}`}
                            style={{ width: `${(prize.progress / prize.unlockLevel) * 100}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(prize.progress / prize.unlockLevel) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : !isRevealed ? (
                    <motion.div
                      key="unlocked"
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <motion.div
                        className={`w-20 h-20 rounded-full bg-gradient-to-r ${tierColors.gradient} flex items-center justify-center mb-4 cursor-pointer`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevealPrize(prize.id);
                        }}
                      >
                        <Eye className="w-8 h-8 text-black" />
                      </motion.div>
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        SBLOCCATO!
                      </h3>
                      <p className="text-sm text-white/70 mb-4">
                        Clicca per rivelare il premio
                      </p>
                      <span className={`text-sm font-orbitron font-bold ${tierColors.text}`}>
                        Valore: {prize.value}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed"
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Star className={`w-16 h-16 ${tierColors.text} mb-4`} />
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        {prize.revealedPrize}
                      </h3>
                      <p className="text-sm text-white/70 mb-4">
                        {prize.hint}
                      </p>
                      <span className={`text-lg font-orbitron font-bold ${tierColors.text}`}>
                        {prize.value}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tierColors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none`} />
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Info */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-400/30 p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-orbitron font-bold text-white">
              Come Funziona
            </h3>
          </div>
          <p className="text-white/70 text-lg leading-relaxed">
            Completa missioni, risolvi enigmi e accumula punti per sbloccare scrigni misteriosi. 
            Ogni tier offre premi sempre più esclusivi e di valore crescente.
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default MysteryPrizesSection;
