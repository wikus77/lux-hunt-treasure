
import React, { useState } from "react";
import { Mission } from "@/data/commandCenterData";
import { motion } from "framer-motion";
import { Map, AlertTriangle, Clock, Target, Tag, Settings } from "lucide-react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { NotifierDebugPanel } from "@/components/mission/NotifierDebugPanel";
import { RecentSuggestionsTab } from "@/components/mission/RecentSuggestionsTab";

interface MissionPanelProps {
  mission: Mission;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({ mission }) => {
  const { navigate } = useWouterNavigation();
  const [activeTab, setActiveTab] = useState<'mission' | 'suggestions' | 'debug'>('mission');
  
  // 🔥 Check admin status for Push Test access
  const { getCurrentUser } = useUnifiedAuth();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email === 'wikus77@hotmail.it';
  
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getThreatLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-emerald-500";
      case 2: return "bg-amber-500";
      case 3: return "bg-red-500";
      default: return "bg-emerald-500";
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-emerald-500";
      case "danger": return "text-red-500";
      case "completed": return "text-blue-500";
      default: return "text-emerald-500";
    }
  };

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-5 shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-300 flex items-center">
          <Target className="inline mr-2 h-5 w-5" />
          Missione: {mission.name}
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMissionStatusColor(mission.status)}`}>
          {mission.status === 'active' ? 'Attiva' : 
           mission.status === 'danger' ? 'Pericolo' : 'Completata'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center transition-colors ${
            activeTab === 'mission' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <Target className="w-4 h-4 mr-1" />
          Missione
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center transition-colors ${
            activeTab === 'suggestions' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <Tag className="w-4 h-4 mr-1" />
          Suggerimenti
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('debug')}
            className={`px-3 py-1 rounded-lg text-sm flex items-center transition-colors ${
              activeTab === 'debug' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Settings className="w-4 h-4 mr-1" />
            Debug
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'mission' && (
        <>
          <p className="text-white/80 mb-4">{mission.description}</p>
          
          <div className="flex items-center mb-3">
            <Map className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-white/90">{mission.location} - {mission.activeArea}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
              <span className="text-white/90">Livello minaccia:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((level) => (
                <div 
                  key={level} 
                  className={`w-3 h-3 rounded-full ${level <= mission.threatLevel ? getThreatLevelColor(mission.threatLevel) : 'bg-gray-700'}`} 
                />
              ))}
            </div>
          </div>
          
          {mission.timeRemaining && (
            <div className="flex items-center mb-4">
              <Clock className="h-4 w-4 text-cyan-400 mr-2" />
              <span className="text-white/90">Tempo rimanente: {formatTimeRemaining(mission.timeRemaining)}</span>
            </div>
          )}

          <h3 className="text-md font-bold text-white mb-2">Obiettivi</h3>
          <div className="space-y-2">
            {mission.objectives.map((objective) => (
              <div key={objective.id} className="flex items-center">
                <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                  objective.completed ? 'bg-cyan-500' : 'border border-cyan-500/50'
                }`}>
                  {objective.completed && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${objective.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {objective.description}
                </span>
                {!objective.completed && objective.priority === 'high' && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                    Priorità alta
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <motion.button
              className="bg-cyan-800/30 hover:bg-cyan-700/50 text-cyan-300 px-4 py-2 rounded-lg text-sm flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/map-3d-tiler")}
            >
              <Map className="mr-2 h-4 w-4" />
              Visualizza mappa
            </motion.button>
            
            {/* 🔥 PUSH TEST BUTTON - Solo per Admin AG-X0197 */}
            {isAdmin && (
              <motion.button
                className="bg-gradient-to-r from-orange-600/30 to-red-600/30 hover:from-orange-500/50 hover:to-red-500/50 text-orange-300 px-4 py-2 rounded-lg text-sm flex items-center border border-orange-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/push-test', '_blank')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Push Test
              </motion.button>
            )}
          </div>
        </>
      )}

      {activeTab === 'suggestions' && <RecentSuggestionsTab />}
      
      {activeTab === 'debug' && isAdmin && <NotifierDebugPanel />}
    </motion.div>
  );
};
