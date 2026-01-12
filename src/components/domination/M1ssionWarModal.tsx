/**
 * M1SSION WAR — Modal con statistiche dominio dettagliate
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Globe, Swords, Crown, Target, Shield, 
  TrendingUp, MapPin, Users, Zap, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRY_NAMES, CONTINENT_NAMES, COUNTRY_TO_CONTINENT } from '@/lib/domination/continentMapping';

interface M1ssionWarModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface BattleHistory {
  id: string;
  country_code: string;
  won_at: string;
  is_pvp: boolean;
}

interface CountryProgress {
  country_code: string;
  country_name: string;
  continent: string;
  win_progress: number;
  conquest_threshold: number;
  status: 'neutral' | 'contested' | 'conquered';
  owner_id: string | null;
  owner_name: string | null;
  is_mine: boolean;
  attacks_needed: number;
  progress_percent: number;
}

interface UserStats {
  countries_owned: number;
  countries_contested: number;
  total_wins: number;
  continents_owned: string[];
}

export const M1ssionWarModal: React.FC<M1ssionWarModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [loading, setLoading] = useState(true);
  const [battleHistory, setBattleHistory] = useState<BattleHistory[]>([]);
  const [countryProgress, setCountryProgress] = useState<CountryProgress[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'leaderboard'>('progress');

  // Fetch data when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user stats (from RPC + battle_sessions fallback)
        let finalStats: UserStats = {
          countries_owned: 0,
          countries_contested: 0,
          total_wins: 0,
          continents_owned: []
        };
        
        // Prova RPC (nuovo sistema)
        try {
          const { data: statsData } = await supabase.rpc('get_user_domination_stats', {
            p_user_id: userId
          });
          if (statsData && statsData.length > 0) {
            finalStats = statsData[0];
          }
        } catch (rpcErr) {
          console.log('[M1ssionWar] RPC not available, using fallback');
        }
        
        // Aggiungi vittorie da battle_sessions (vecchio Tron Battle)
        const { data: sessionWins, count: sessionCount } = await supabase
          .from('battle_sessions')
          .select('id', { count: 'exact' })
          .eq('winner_id', userId)
          .eq('status', 'resolved');
        
        if (sessionCount && sessionCount > 0) {
          finalStats.total_wins += sessionCount;
        }
        
        setUserStats(finalStats);

        // 2. Fetch battle history (from country_battle_wins + battle_sessions)
        let allBattles: BattleHistory[] = [];
        
        // Prima prova country_battle_wins (nuovo sistema)
        const { data: domBattles } = await supabase
          .from('country_battle_wins')
          .select('id, country_code, won_at, is_pvp')
          .eq('winner_id', userId)
          .order('won_at', { ascending: false })
          .limit(20);
        
        if (domBattles && domBattles.length > 0) {
          allBattles = domBattles;
        }
        
        // Poi aggiungi da battle_sessions (vecchio sistema Tron Battle)
        const { data: sessionBattles } = await supabase
          .from('battle_sessions')
          .select('id, status, resolved_at, creator_id, defender_id')
          .or(`creator_id.eq.${userId},defender_id.eq.${userId}`)
          .eq('status', 'resolved')
          .not('resolved_at', 'is', null)
          .order('resolved_at', { ascending: false })
          .limit(20);
        
        if (sessionBattles && sessionBattles.length > 0) {
          // Converti in formato BattleHistory
          const sessionHistory: BattleHistory[] = sessionBattles.map(b => ({
            id: b.id,
            country_code: 'IT', // Default Italy se non abbiamo coordinate
            won_at: b.resolved_at || new Date().toISOString(),
            is_pvp: true
          }));
          
          // Combina e ordina per data
          allBattles = [...allBattles, ...sessionHistory]
            .sort((a, b) => new Date(b.won_at).getTime() - new Date(a.won_at).getTime())
            .slice(0, 20);
        }
        
        setBattleHistory(allBattles);

        // 3. Fetch country progress (countries user has attacked)
        const { data: progressData } = await supabase
          .from('country_domination')
          .select('country_code, win_progress, conquest_threshold, status, owner_id');

        // Get unique countries from battle history
        const attackedCountries = new Set(
          (historyData || []).map(b => b.country_code)
        );

        // Map to progress format
        const mappedProgress: CountryProgress[] = (progressData || [])
          .filter(p => attackedCountries.has(p.country_code) || p.owner_id === userId)
          .map(p => ({
            country_code: p.country_code,
            country_name: COUNTRY_NAMES[p.country_code] || p.country_code,
            continent: CONTINENT_NAMES[COUNTRY_TO_CONTINENT[p.country_code]] || 'Unknown',
            win_progress: p.win_progress,
            conquest_threshold: p.conquest_threshold,
            status: p.status as 'neutral' | 'contested' | 'conquered',
            owner_id: p.owner_id,
            owner_name: null, // Will be populated below
            is_mine: p.owner_id === userId,
            attacks_needed: Math.max(0, p.conquest_threshold - p.win_progress),
            progress_percent: Math.min(100, (p.win_progress / p.conquest_threshold) * 100)
          }));

        setCountryProgress(mappedProgress);

      } catch (err) {
        console.error('[M1ssionWar] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{ zIndex: 999998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-4 right-4 bg-gradient-to-b from-gray-900/98 to-black/98 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              zIndex: 999999,
              top: 'calc(60px + env(safe-area-inset-top, 0px))',
              bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
              maxWidth: '600px',
              margin: '0 auto',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-red-500/30 bg-gradient-to-r from-red-950/50 to-orange-950/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-400">M1SSION WAR</h2>
                  <p className="text-xs text-muted-foreground">Domina il mondo</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-red-500/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Stats Summary */}
            {userStats && (
              <div className="p-4 border-b border-red-500/20 bg-black/30">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{userStats.countries_owned}</div>
                    <div className="text-[10px] text-green-300/70">Conquistati</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{userStats.countries_contested}</div>
                    <div className="text-[10px] text-amber-300/70">Contesi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{userStats.total_wins}</div>
                    <div className="text-[10px] text-cyan-300/70">Vittorie</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{userStats.continents_owned?.length || 0}</div>
                    <div className="text-[10px] text-purple-300/70">Continenti</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-red-500/20">
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'progress'
                    ? 'text-red-400 border-b-2 border-red-400 bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Target className="inline w-3.5 h-3.5 mr-1" />
                Conquiste
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-red-400 border-b-2 border-red-400 bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Swords className="inline w-3.5 h-3.5 mr-1" />
                Battaglie
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'text-red-400 border-b-2 border-red-400 bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Crown className="inline w-3.5 h-3.5 mr-1" />
                Classifica
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100%-220px)]">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
                  </div>
                ) : activeTab === 'progress' ? (
                  <CountryProgressTab 
                    countryProgress={countryProgress} 
                    userId={userId}
                  />
                ) : activeTab === 'history' ? (
                  <BattleHistoryTab battleHistory={battleHistory} />
                ) : (
                  <LeaderboardTab />
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Tab: Country Progress
const CountryProgressTab: React.FC<{ countryProgress: CountryProgress[]; userId: string }> = ({ 
  countryProgress,
  userId 
}) => {
  if (countryProgress.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 mx-auto text-red-500/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          Nessuna conquista in corso.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Attacca agenti in altri paesi per iniziare a conquistare!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {countryProgress.map((country) => (
        <div
          key={country.country_code}
          className={`p-3 rounded-xl border ${
            country.status === 'conquered'
              ? 'bg-green-950/30 border-green-500/30'
              : country.status === 'contested'
              ? 'bg-amber-950/30 border-amber-500/30'
              : 'bg-gray-900/50 border-gray-700/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flag className={`w-4 h-4 ${
                country.status === 'conquered' ? 'text-green-400' :
                country.status === 'contested' ? 'text-amber-400' : 'text-gray-400'
              }`} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {country.country_name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {country.continent}
                </p>
              </div>
            </div>
            <div className="text-right">
              {country.status === 'conquered' ? (
                <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {country.is_mine ? 'TUO' : 'Conquistato'}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {country.attacks_needed} attacchi
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress 
              value={country.progress_percent} 
              className={`h-2 ${
                country.status === 'conquered' ? 'bg-green-950' :
                country.status === 'contested' ? 'bg-amber-950' : 'bg-gray-800'
              }`}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{country.win_progress} / {country.conquest_threshold}</span>
              <span>{Math.round(country.progress_percent)}%</span>
            </div>
          </div>

          {/* Status badge */}
          {country.status !== 'neutral' && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                country.status === 'conquered'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {country.status === 'conquered' ? '✅ CONQUISTATO' : '⚔️ CONTESO'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Tab: Battle History
const BattleHistoryTab: React.FC<{ battleHistory: BattleHistory[] }> = ({ battleHistory }) => {
  if (battleHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Swords className="w-12 h-12 mx-auto text-red-500/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          Nessuna battaglia registrata.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Le tue vittorie appariranno qui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {battleHistory.map((battle) => (
        <div
          key={battle.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700/30"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              battle.is_pvp ? 'bg-red-500/20' : 'bg-gray-500/20'
            }`}>
              <Swords className={`w-4 h-4 ${battle.is_pvp ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {COUNTRY_NAMES[battle.country_code] || battle.country_code}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {battle.is_pvp ? '⚔️ PvP' : '🤖 vs NPC'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-400 font-medium">+1 conquista</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(battle.won_at).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Tab: Leaderboard (placeholder)
const LeaderboardTab: React.FC = () => {
  const [leaders, setLeaders] = useState<Array<{
    id: string;
    full_name: string;
    agent_code: string;
    countries_count: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data } = await supabase
          .from('country_domination')
          .select('owner_id, profiles(id, full_name, agent_code)')
          .eq('status', 'conquered')
          .not('owner_id', 'is', null);

        // Group by owner
        const ownerCounts: Record<string, { full_name: string; agent_code: string; count: number }> = {};
        (data || []).forEach((d: any) => {
          if (d.owner_id && d.profiles) {
            if (!ownerCounts[d.owner_id]) {
              ownerCounts[d.owner_id] = {
                full_name: d.profiles.full_name || 'Agent',
                agent_code: d.profiles.agent_code || '',
                count: 0
              };
            }
            ownerCounts[d.owner_id].count++;
          }
        });

        const sorted = Object.entries(ownerCounts)
          .map(([id, data]) => ({
            id,
            full_name: data.full_name,
            agent_code: data.agent_code,
            countries_count: data.count
          }))
          .sort((a, b) => b.countries_count - a.countries_count)
          .slice(0, 10);

        setLeaders(sorted);
      } catch (err) {
        console.error('[M1ssionWar] Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="w-12 h-12 mx-auto text-red-500/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          Nessun conquistatore ancora.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Sii il primo a conquistare un paese!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaders.map((leader, index) => (
        <div
          key={leader.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            index === 0 ? 'bg-yellow-950/30 border-yellow-500/30' :
            index === 1 ? 'bg-gray-800/50 border-gray-500/30' :
            index === 2 ? 'bg-orange-950/30 border-orange-700/30' :
            'bg-gray-900/50 border-gray-700/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-yellow-500 text-black' :
              index === 1 ? 'bg-gray-400 text-black' :
              index === 2 ? 'bg-orange-600 text-white' :
              'bg-gray-700 text-gray-300'
            }`}>
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{leader.full_name}</p>
              <p className="text-[10px] text-muted-foreground">{leader.agent_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">{leader.countries_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default M1ssionWarModal;

