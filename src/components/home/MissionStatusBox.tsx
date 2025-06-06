
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Target, CheckCircle, AlertCircle } from 'lucide-react';

interface MissionProgress {
  cluesFound: number;
  totalClues: number;
  gamesCompleted: number;
  totalGames: number;
  status: 'active' | 'completed' | 'failed';
}

const MissionStatusBox = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<MissionProgress>({
    cluesFound: 0,
    totalClues: 12,
    gamesCompleted: 0,
    totalGames: 6,
    status: 'active'
  });

  useEffect(() => {
    if (isFlipped) {
      fetchMissionProgress();
    }
  }, [isFlipped]);

  const fetchMissionProgress = async () => {
    try {
      // Fetch clues count
      const { data: cluesData } = await supabase
        .from('user_clues')
        .select('clue_id');

      // Fetch completed games
      const { data: gamesData } = await supabase
        .from('user_minigames_progress')
        .select('*')
        .eq('completed', true);

      setProgress(prev => ({
        ...prev,
        cluesFound: cluesData?.length || 0,
        gamesCompleted: gamesData?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching mission progress:', error);
    }
  };

  const overallProgress = Math.round(
    ((progress.cluesFound / progress.totalClues) * 0.7 + 
     (progress.gamesCompleted / progress.totalGames) * 0.3) * 100
  );

  const getStatusIcon = () => {
    if (overallProgress >= 100) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (overallProgress >= 50) return <Target className="w-5 h-5 text-blue-400" />;
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  const getStatusText = () => {
    if (overallProgress >= 100) return "Completata";
    if (overallProgress >= 75) return "Quasi Completa";
    if (overallProgress >= 50) return "In Corso";
    if (overallProgress >= 25) return "Iniziata";
    return "Da Iniziare";
  };

  return (
    <motion.div
      className="flip-box relative h-32 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Front */}
      <div className="flip-box-front bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 flex items-center justify-between text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <h3 className="font-bold text-lg">Stato Missione</h3>
          </div>
          <p className="text-2xl font-bold text-green-200">{overallProgress}%</p>
        </div>
        <div className="text-4xl opacity-30">🛰️</div>
      </div>

      {/* Back */}
      <div className="flip-box-back bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 text-white">
        <h3 className="font-bold text-lg mb-3 text-center">Progresso Dettagliato</h3>
        
        <div className="space-y-3">
          <div className="bg-green-700/50 rounded-lg p-2">
            <div className="text-sm text-green-300">Stato Generale</div>
            <div className="font-bold text-lg flex items-center gap-2">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>

          <div className="bg-green-700/50 rounded-lg p-2">
            <div className="text-sm text-green-300">Indizi Raccolti</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-900 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.cluesFound / progress.totalClues) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold">{progress.cluesFound}/{progress.totalClues}</span>
            </div>
          </div>

          <div className="bg-green-700/50 rounded-lg p-2">
            <div className="text-sm text-green-300">Giochi Completati</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-900 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.gamesCompleted / progress.totalGames) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold">{progress.gamesCompleted}/{progress.totalGames}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{overallProgress}%</div>
            <div className="text-xs text-green-300">Completamento Totale</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionStatusBox;
