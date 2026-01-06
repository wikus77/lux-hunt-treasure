// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Spectator Mode - LIVE Public Preview (No Auth Required)

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Eye, Trophy, Users, MapPin, Zap, ChevronRight, Clock, 
  Activity, Radio, TrendingUp, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

interface SpectatorData {
  missionCountdown: { targetDate: string; state: string };
  missionProgress: number;
  participantsCount: number;
  activePlayersReal: number;
  areasConsumed: number;
  cluesReleased: number;
  lastBuzzAgoSec: number;
  activityFeed: Array<{ type: string; ts: string; text: string; icon: string }>;
  winners: Array<{ ts: string; prize: string; winner: string }>;
  timestamp: string;
}

// Format time ago
const formatTimeAgo = (seconds: number): string => {
  if (seconds < 60) return `${seconds} sec fa`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore fa`;
  return `${Math.floor(seconds / 86400)} giorni fa`;
};

// Format countdown
const formatCountdown = (targetDate: string): { days: number; hours: number; minutes: number; seconds: number } => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  };
};

const SpectatorPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<SpectatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-spectator-summary`);
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Spectator fetch error:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    if (!data?.missionCountdown?.targetDate) return;
    
    const updateCountdown = () => {
      setCountdown(formatCountdown(data.missionCountdown.targetDate));
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.missionCountdown?.targetDate]);

  const handleJoinMission = () => {
    setLocation('/register');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-cyan-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Eye className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">
              <span className="text-cyan-400">SPECTATOR</span> MODE
            </span>
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-2">
              LIVE
            </span>
          </div>
          <Button
            onClick={handleJoinMission}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xs font-bold px-4 py-2 rounded-full"
          >
            ENTRA NELLA MISSIONE
          </Button>
        </div>
      </header>

      {/* Hero Section - LIVE Countdown */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-green-400 animate-pulse" />
              <p className="text-green-400 text-xs font-bold uppercase tracking-[0.3em]">
                LIVE • TEMPO REALE
              </p>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-2">
              <span className="text-cyan-400">M1</span>SSION™
            </h1>
            
            <p className="text-white/60 text-sm mb-6">
              Stai guardando la missione in tempo reale.
            </p>

            {/* Countdown */}
            <div className="mb-6">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Prossima Missione tra
              </p>
              <div className="flex justify-center gap-3">
                {[
                  { value: countdown.days, label: 'Giorni' },
                  { value: countdown.hours, label: 'Ore' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' }
                ].map((item, i) => (
                  <div key={i} className="bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Progresso Missione</span>
                <span>{data?.missionProgress || 0}%</span>
              </div>
              <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/20">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${data?.missionProgress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Participants */}
            <motion.div 
              className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {data?.participantsCount?.toLocaleString() || '---'}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Partecipanti</div>
              {data?.activePlayersReal && data.activePlayersReal > 0 && (
                <div className="text-[10px] text-green-400 mt-1">
                  +{data.activePlayersReal} attivi ora
                </div>
              )}
            </motion.div>

            {/* Areas */}
            <motion.div 
              className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <MapPin className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {data?.areasConsumed || 0}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Aree Generate</div>
            </motion.div>

            {/* Last Buzz */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {data?.lastBuzzAgoSec ? formatTimeAgo(data.lastBuzzAgoSec) : '---'}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Ultimo Buzz</div>
            </motion.div>

            {/* Clues */}
            <motion.div 
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {data?.cluesReleased || 0}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Indizi Rilasciati</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Attività Live</h2>
            </div>
            <button 
              onClick={handleRefresh}
              className="text-cyan-400 text-xs flex items-center gap-1 hover:text-cyan-300"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </button>
          </div>
          
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Caricamento...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : data?.activityFeed && data.activityFeed.length > 0 ? (
              <div className="space-y-2">
                {data.activityFeed.map((item, index) => (
                  <motion.div 
                    key={`${item.ts}-${index}`}
                    className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1 text-sm text-gray-300">{item.text}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(Math.floor((Date.now() - new Date(item.ts).getTime()) / 1000))}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Nessuna attività recente</div>
            )}
          </div>
        </div>
      </section>

      {/* Prize Section */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 border border-yellow-500/30 rounded-xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-7 h-7 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">Premio in Palio</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Un solo vincitore. Un premio reale. Nessuna simulazione.
                </p>
                <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400 mb-1">PREMIO ATTUALE</p>
                  <p className="text-lg font-bold text-white">Supercar + Esperienze Esclusive</p>
                  <p className="text-xs text-red-400 mt-2">
                    Ogni premio esiste una sola volta. Quando viene vinto, sparisce.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hall of Winners */}
      {data?.winners && data.winners.length > 0 && (
        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Hall of Winners
            </h2>
            <div className="space-y-2">
              {data.winners.map((winner, index) => (
                <div key={index} className="bg-black/40 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-mono text-yellow-400">{winner.winner}</span>
                    <span className="text-xs text-gray-500 ml-2">{winner.prize}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(winner.ts).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-white/50 text-sm mb-4">
              Smetti di guardare. Inizia a giocare.
            </p>
            <Button
              onClick={handleJoinMission}
              className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black text-lg font-black px-10 py-5 rounded-full hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all duration-300"
            >
              ENTRA NELLA MISSIONE
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Registrazione gratuita. Nessuna carta richiesta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer - Different from main footer */}
      <footer className="py-6 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2025 M1SSION™ — Spectator Preview
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SpectatorPage;
