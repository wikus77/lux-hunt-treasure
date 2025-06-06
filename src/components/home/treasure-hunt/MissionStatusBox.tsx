
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";

interface MissionProgress {
  tasksCompleted: number;
  totalTasks: number;
  cluesFound: number;
  status: string;
  alerts: string[];
}

export const MissionStatusBox: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<MissionProgress>({
    tasksCompleted: 0,
    totalTasks: 10,
    cluesFound: 0,
    status: 'in_progress',
    alerts: []
  });
  const { getCurrentUser } = useAuthContext();

  useEffect(() => {
    fetchMissionProgress();
  }, []);

  const fetchMissionProgress = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // Fetch user clues count
      const { data: cluesData } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', user.id);

      // Fetch user minigames progress
      const { data: gamesData } = await supabase
        .from('user_minigames_progress')
        .select('*')
        .eq('user_id', user.id);

      const completedGames = gamesData?.filter(game => game.completed).length || 0;
      const cluesCount = cluesData?.length || 0;
      
      // Calculate alerts based on user activity
      const alerts = [];
      if (cluesCount === 0) alerts.push('Nessun indizio trovato');
      if (completedGames === 0) alerts.push('Nessun minigioco completato');
      
      setProgress({
        tasksCompleted: completedGames + Math.floor(cluesCount / 2),
        totalTasks: 10,
        cluesFound: cluesCount,
        status: cluesCount > 5 ? 'on_track' : 'needs_attention',
        alerts
      });
    } catch (error) {
      console.error('Error fetching mission progress:', error);
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'on_track':
        return <Target className="h-8 w-8 text-blue-400" />;
      case 'needs_attention':
        return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
      default:
        return <Activity className="h-8 w-8 text-cyan-400" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'completed':
        return 'Completata';
      case 'on_track':
        return 'In corso';
      case 'needs_attention':
        return 'Attenzione';
      default:
        return 'Attiva';
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'from-green-900/40 to-emerald-900/40';
      case 'on_track':
        return 'from-blue-900/40 to-cyan-900/40';
      case 'needs_attention':
        return 'from-yellow-900/40 to-orange-900/40';
      default:
        return 'from-gray-900/40 to-slate-900/40';
    }
  };

  const getBorderColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'border-green-500/30';
      case 'on_track':
        return 'border-blue-500/30';
      case 'needs_attention':
        return 'border-yellow-500/30';
      default:
        return 'border-gray-500/30';
    }
  };

  return (
    <div className="flip-card-container perspective-1000 h-32 w-full">
      <motion.div
        className="flip-card transform-style-3d relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Front */}
        <div className={`flip-card-front backface-hidden absolute inset-0 bg-gradient-to-br ${getStatusColor()} rounded-lg p-4 border ${getBorderColor()}`}>
          <div className="flex items-center justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-cyan-400">Stato Missione</h3>
              <p className="text-xl font-bold text-white">{getStatusText()}</p>
            </div>
            {getStatusIcon()}
          </div>
        </div>

        {/* Back */}
        <div className={`flip-card-back backface-hidden absolute inset-0 bg-gradient-to-br ${getStatusColor()} rounded-lg p-4 border ${getBorderColor()} rotate-y-180 overflow-y-auto`}>
          <h3 className="text-sm font-bold text-cyan-400 mb-3">Progresso Dettagliato</h3>
          <div className="space-y-3">
            <div className="bg-black/20 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70">Task Completati</span>
                <span className="text-sm font-bold text-white">{progress.tasksCompleted}/{progress.totalTasks}</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.tasksCompleted / progress.totalTasks) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-xs text-white/70">Indizi Trovati</p>
                <p className="text-sm font-semibold text-white">{progress.cluesFound}</p>
              </div>
            </div>

            {progress.alerts.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-yellow-400 font-semibold">Alert:</p>
                {progress.alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-white/60">{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
