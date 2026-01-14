/**
 * M1SSION™ — Pulse Bar Test Page
 * Pagina di test per verificare il flusso di progressione e video rank-up
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Zap, ChevronUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  HIERARCHY_LEVELS, 
  getCurrentLevel, 
  getNextLevel, 
  calculateProgress, 
  getPEToNextLevel,
  HierarchyLevel 
} from '@/config/hierarchyConfig';
import RankUpVideoModal from '@/components/rank/RankUpVideoModal';

export default function PulseBarTest() {
  // Stato PE simulato (parte da 0)
  const [simulatedPE, setSimulatedPE] = useState(0);
  const [previousLevel, setPreviousLevel] = useState<HierarchyLevel>(HIERARCHY_LEVELS[0]);
  
  // Stato per video rank-up
  const [showRankUpVideo, setShowRankUpVideo] = useState(false);
  const [newRankAchieved, setNewRankAchieved] = useState<HierarchyLevel | null>(null);
  
  // Storico rank sbloccati (per badge in home)
  const [unlockedRanks, setUnlockedRanks] = useState<HierarchyLevel[]>([]);

  // Calcola stato corrente
  const currentLevel = getCurrentLevel(simulatedPE);
  const nextLevel = getNextLevel(currentLevel);
  const progressPercent = calculateProgress(simulatedPE, currentLevel, nextLevel);
  const peToNext = getPEToNextLevel(simulatedPE, nextLevel);

  // Calcola PE per questo livello (visivamente si azzera ad ogni rank-up)
  const getPEInCurrentLevel = () => {
    if (currentLevel.level === 0) {
      return simulatedPE;
    }
    return simulatedPE - currentLevel.peThreshold;
  };

  const getPENeededForCurrentLevel = () => {
    if (!nextLevel) return 0;
    return nextLevel.peThreshold - currentLevel.peThreshold;
  };

  // Verifica se c'è stato un rank-up
  useEffect(() => {
    if (currentLevel.level > previousLevel.level && currentLevel.level > 0) {
      console.log(`🎖️ RANK UP! ${previousLevel.name} → ${currentLevel.name}`);
      setNewRankAchieved(currentLevel);
      setShowRankUpVideo(true);
      
      // Aggiungi ai rank sbloccati
      setUnlockedRanks(prev => {
        if (!prev.find(r => r.level === currentLevel.level)) {
          return [...prev, currentLevel];
        }
        return prev;
      });
    }
    setPreviousLevel(currentLevel);
  }, [currentLevel.level]);

  // Aggiungi 25% dei PE necessari per il prossimo livello
  const add25Percent = useCallback(() => {
    if (!nextLevel) return;
    
    const peNeeded = nextLevel.peThreshold - currentLevel.peThreshold;
    const peToAdd = Math.ceil(peNeeded * 0.25);
    
    setSimulatedPE(prev => prev + peToAdd);
  }, [currentLevel, nextLevel]);

  // Aggiungi PE custom
  const addCustomPE = (amount: number) => {
    setSimulatedPE(prev => prev + amount);
  };

  // Reset tutto
  const resetAll = () => {
    setSimulatedPE(0);
    setPreviousLevel(HIERARCHY_LEVELS[0]);
    setUnlockedRanks([]);
  };

  // Callback quando video rank-up termina
  const handleRankUpComplete = () => {
    setShowRankUpVideo(false);
    setNewRankAchieved(null);
  };

  // Formatta numeri
  const formatPE = (pe: number) => {
    if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
    if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
    return pe.toString();
  };

  const totalSegments = 24;
  const filledSegments = Math.floor((progressPercent / 100) * totalSegments);
  const rankColor = currentLevel.color || '#00e7ff';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          🧪 PULSE BAR TEST
        </h1>
        <p className="text-center text-white/60 text-sm">
          Pagina di test per verificare il flusso di progressione e video rank-up
        </p>
      </div>

      {/* Stats Panel */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">PE Totali</p>
            <p className="text-2xl font-bold text-cyan-400">{formatPE(simulatedPE)}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Livello</p>
            <p className="text-2xl font-bold" style={{ color: rankColor }}>{currentLevel.level}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Grado</p>
            <p className="text-lg font-bold" style={{ color: rankColor }}>{currentLevel.icon} {currentLevel.name}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Prossimo</p>
            <p className="text-lg font-bold text-white/60">
              {nextLevel ? `${nextLevel.icon} ${formatPE(peToNext)} PE` : '👑 MAX'}
            </p>
          </div>
        </div>
      </div>

      {/* PULSE BAR - Design migliorato */}
      <div className="max-w-2xl mx-auto mb-8">
        <motion.div
          className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-black/50 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Cerchio con icona rank */}
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Anello esterno */}
              <circle cx="40" cy="40" r="38" fill="none" stroke={rankColor} strokeWidth="1" opacity="0.3" />
              {/* Anello progresso background */}
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              {/* Anello progresso */}
              <motion.circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke={rankColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - progressPercent / 100)}
                transform="rotate(-90 40 40)"
                style={{ filter: `drop-shadow(0 0 6px ${rankColor})` }}
                initial={false}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - progressPercent / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            
            {/* Icona centrale */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl">{currentLevel.icon}</span>
              <span 
                className="font-bold font-mono text-xs"
                style={{ color: rankColor }}
              >
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          {/* Barra segmentata + info */}
          <div className="flex-1">
            {/* Header info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: rankColor }}
                >
                  {currentLevel.name}
                </span>
                <span className="text-xs text-white/40">
                  LVL {currentLevel.level}
                </span>
              </div>
              {nextLevel && (
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <ChevronUp className="w-3 h-3" />
                  <span>{nextLevel.icon} {formatPE(peToNext)} PE</span>
                </div>
              )}
            </div>

            {/* Barra segmentata */}
            <div 
              className="relative h-6 rounded-lg overflow-hidden"
              style={{
                background: 'rgba(0,20,30,0.9)',
                border: `1px solid ${rankColor}33`,
              }}
            >
              {/* Segmenti */}
              <div className="absolute inset-1 flex gap-1">
                {[...Array(totalSegments)].map((_, i) => {
                  const isFilled = i < filledSegments;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: isFilled 
                          ? `linear-gradient(180deg, ${rankColor} 0%, ${rankColor}99 50%, ${rankColor}66 100%)`
                          : 'rgba(255,255,255,0.05)',
                        boxShadow: isFilled ? `0 0 8px ${rankColor}` : 'none',
                      }}
                      initial={false}
                      animate={{ opacity: isFilled ? 1 : 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  );
                })}
              </div>

              {/* Scanning effect */}
              <motion.div
                className="absolute top-0 bottom-0 w-12 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${rankColor}44, transparent)`,
                }}
                animate={{ left: ['-15%', '115%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* PE in questo livello */}
            <div className="flex items-center justify-between mt-2 text-xs text-white/50">
              <span>{formatPE(getPEInCurrentLevel())} PE in questo livello</span>
              <span>{formatPE(getPENeededForCurrentLevel())} PE necessari</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controlli Test */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold mb-4 text-center">🎮 Controlli Test</h3>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Tasto +25% */}
          <Button
            onClick={add25Percent}
            disabled={!nextLevel}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            +25% ({nextLevel ? formatPE(Math.ceil((nextLevel.peThreshold - currentLevel.peThreshold) * 0.25)) : 0} PE)
          </Button>

          {/* Tasti PE fissi */}
          <Button
            onClick={() => addCustomPE(100)}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400"
          >
            +100 PE
          </Button>
          <Button
            onClick={() => addCustomPE(500)}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400"
          >
            +500 PE
          </Button>
          <Button
            onClick={() => addCustomPE(1000)}
            variant="outline"
            className="border-purple-500/50 text-purple-400"
          >
            +1K PE
          </Button>
          <Button
            onClick={() => addCustomPE(5000)}
            variant="outline"
            className="border-purple-500/50 text-purple-400"
          >
            +5K PE
          </Button>

          {/* Reset */}
          <Button
            onClick={resetAll}
            variant="destructive"
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Badge/Rank Sbloccati (simulazione Home) */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
          <Award className="w-5 h-5" />
          Badge Sbloccati
        </h3>
        
        {unlockedRanks.length === 0 ? (
          <p className="text-center text-white/40 text-sm">
            Nessun badge sbloccato. Raggiungi 1,000 PE per il primo rank!
          </p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {unlockedRanks.map((rank) => (
              <motion.div
                key={rank.level}
                className="flex flex-col items-center p-3 rounded-xl"
                style={{ 
                  background: `${rank.color}20`,
                  border: `1px solid ${rank.color}50`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <span className="text-4xl mb-1">{rank.icon}</span>
                <span 
                  className="text-xs font-bold uppercase"
                  style={{ color: rank.color }}
                >
                  {rank.name}
                </span>
                <span className="text-[10px] text-white/40">LVL {rank.level}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tabella Gerarchia */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold mb-4 text-center">📊 Gerarchia Completa</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="py-2 text-left">Lvl</th>
                <th className="py-2 text-left">Grado</th>
                <th className="py-2 text-right">PE Soglia</th>
                <th className="py-2 text-right">PE Incrementali</th>
                <th className="py-2 text-center">Stato</th>
              </tr>
            </thead>
            <tbody>
              {HIERARCHY_LEVELS.filter(l => l.code !== 'MCP').map((level) => {
                const isUnlocked = simulatedPE >= level.peThreshold;
                const isCurrent = currentLevel.level === level.level;
                
                return (
                  <tr 
                    key={level.level}
                    className={`border-b border-white/5 ${isCurrent ? 'bg-white/5' : ''}`}
                  >
                    <td className="py-2 font-bold" style={{ color: level.color }}>
                      {level.level}
                    </td>
                    <td className="py-2">
                      <span className="mr-2">{level.icon}</span>
                      <span style={{ color: isUnlocked ? level.color : 'rgba(255,255,255,0.3)' }}>
                        {level.name}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-white/60">
                      {formatPE(level.peThreshold)}
                    </td>
                    <td className="py-2 text-right font-mono text-white/40">
                      +{formatPE(level.peIncremental)}
                    </td>
                    <td className="py-2 text-center">
                      {isUnlocked ? (
                        <span className="text-green-400">✅</span>
                      ) : (
                        <span className="text-white/20">🔒</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Rank Up Modal */}
      {newRankAchieved && (
        <RankUpVideoModal
          isOpen={showRankUpVideo}
          newRank={newRankAchieved}
          onComplete={handleRankUpComplete}
        />
      )}
    </div>
  );
}

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

