/**
 * M1SSION WAR — Modal con statistiche dominio dettagliate
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  is_win: boolean; // true = vittoria, false = sconfitta
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
  const { t } = useTranslation();
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

        // 2. Fetch battle history da country_battle_wins (ha country_code corretto!)
        // Include sia vittorie che sconfitte (campo is_win)
        const { data: allBattlesData } = await supabase
          .from('country_battle_wins')
          .select('id, country_code, won_at, is_pvp, winner_id, is_win')
          .eq('winner_id', userId)  // winner_id è sempre chi ha combattuto
          .order('won_at', { ascending: false })
          .limit(50);
        
        const allBattles: BattleHistory[] = (allBattlesData || []).map(b => ({
          id: b.id,
          country_code: b.country_code,
          won_at: b.won_at,
          is_pvp: b.is_pvp,
          // is_win viene dal DB (nuova colonna), fallback a winner_id check per vecchi record
          is_win: b.is_win !== undefined ? b.is_win : (b.winner_id === userId)
        }));
        
        setBattleHistory(allBattles);

        // 3. Fetch country progress
        // Conta le VITTORIE dell'utente da country_battle_wins (is_win = true!)
        // RIMOSSO filtro is_valid_for_domination - tutte le vittorie contano
        const { data: userWinsByCountry } = await supabase
          .from('country_battle_wins')
          .select('country_code')
          .eq('winner_id', userId)
          .eq('is_win', true);  // SOLO VITTORIE!
        
        // Conta vittorie per paese
        const winsPerCountry: Record<string, number> = {};
        (userWinsByCountry || []).forEach(w => {
          winsPerCountry[w.country_code] = (winsPerCountry[w.country_code] || 0) + 1;
        });
        
        // Se non ci sono vittorie in country_battle_wins, conta da battle_sessions (Italia default)
        const { count: sessionWinsCount } = await supabase
          .from('battle_sessions')
          .select('id', { count: 'exact' })
          .eq('winner_id', userId)
          .eq('status', 'resolved');
        
        // Se ha vittorie in battle_sessions ma non in country_battle_wins, aggiungi a Italia
        if (sessionWinsCount && sessionWinsCount > 0 && Object.keys(winsPerCountry).length === 0) {
          winsPerCountry['IT'] = sessionWinsCount;
        }
        
        // Fetch stato dominio per tutti i paesi dove l'utente ha vinto
        const countryCodes = Object.keys(winsPerCountry);
        if (countryCodes.length === 0) {
          // Aggiungi Italia di default se ha fatto battaglie
          if (allBattles.length > 0) {
            countryCodes.push('IT');
            winsPerCountry['IT'] = allBattles.length;
          }
        }
        
        let mappedProgress: CountryProgress[] = [];
        
        if (countryCodes.length > 0) {
          const { data: progressData } = await supabase
            .from('country_domination')
            .select('country_code, win_progress, conquest_threshold, status, owner_id')
            .in('country_code', countryCodes);
          
          // Map to progress format con vittorie utente
          mappedProgress = (progressData || []).map(p => {
            const userWins = winsPerCountry[p.country_code] || 0;
            return {
              country_code: p.country_code,
              country_name: COUNTRY_NAMES[p.country_code] || p.country_code,
              continent: CONTINENT_NAMES[COUNTRY_TO_CONTINENT[p.country_code]] || 'Unknown',
              win_progress: userWins, // Vittorie DELL'UTENTE, non globali
              conquest_threshold: p.conquest_threshold,
              status: p.status as 'neutral' | 'contested' | 'conquered',
              owner_id: p.owner_id,
              owner_name: null,
              is_mine: p.owner_id === userId,
              attacks_needed: Math.max(0, p.conquest_threshold - userWins),
              progress_percent: Math.min(100, (userWins / p.conquest_threshold) * 100)
            };
          });
          
          // Se un paese non è nel DB, crealo con valori default
          countryCodes.forEach(code => {
            if (!mappedProgress.find(p => p.country_code === code)) {
              const userWins = winsPerCountry[code] || 0;
              const threshold = code === 'IT' ? 21 : 15; // Default threshold
              mappedProgress.push({
                country_code: code,
                country_name: COUNTRY_NAMES[code] || code,
                continent: CONTINENT_NAMES[COUNTRY_TO_CONTINENT[code]] || 'Unknown',
                win_progress: userWins,
                conquest_threshold: threshold,
                status: 'neutral',
                owner_id: null,
                owner_name: null,
                is_mine: false,
                attacks_needed: Math.max(0, threshold - userWins),
                progress_percent: Math.min(100, (userWins / threshold) * 100)
              });
            }
          });
        }
        
        // Ordina per progresso (più avanzati prima)
        mappedProgress.sort((a, b) => b.progress_percent - a.progress_percent);

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
                  <h2 className="text-lg font-bold text-red-400">{t('mapPills.missionWar.title')}</h2>
                  <p className="text-xs text-muted-foreground">{t('mapPills.missionWar.subtitle')}</p>
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
                    <div className="text-[10px] text-green-300/70">{t('mapPills.missionWar.conquered')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{userStats.countries_contested}</div>
                    <div className="text-[10px] text-amber-300/70">{t('mapPills.missionWar.contested')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{userStats.total_wins}</div>
                    <div className="text-[10px] text-cyan-300/70">{t('mapPills.missionWar.wins')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{userStats.continents_owned?.length || 0}</div>
                    <div className="text-[10px] text-purple-300/70">{t('mapPills.missionWar.continents')}</div>
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
                {t('mapPills.missionWar.tabConquests')}
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
                {t('mapPills.missionWar.tabBattles')}
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
                {t('mapPills.missionWar.tabLeaderboard')}
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
              {country.status === 'conquered' && country.is_mine ? (
                <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  TUO!
                </span>
              ) : (
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-400">
                    {country.win_progress}/{country.conquest_threshold}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {country.attacks_needed > 0 ? `${country.attacks_needed} mancanti` : 'Completato!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress 
              value={country.progress_percent} 
              className={`h-3 ${
                country.status === 'conquered' ? 'bg-green-950' :
                country.status === 'contested' ? 'bg-amber-950' : 'bg-gray-800'
              }`}
            />
            <div className="flex justify-between text-[10px]">
              <span className={`font-semibold ${
                country.progress_percent >= 80 ? 'text-amber-400' :
                country.progress_percent >= 50 ? 'text-cyan-400' : 'text-muted-foreground'
              }`}>
                {country.win_progress} vittorie su {country.conquest_threshold}
              </span>
              <span className={`font-bold ${
                country.progress_percent >= 100 ? 'text-green-400' :
                country.progress_percent >= 80 ? 'text-amber-400' : 'text-muted-foreground'
              }`}>
                {Math.round(country.progress_percent)}%
              </span>
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
          Le tue battaglie appariranno qui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {battleHistory.map((battle) => (
        <div
          key={battle.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            battle.is_win 
              ? 'bg-green-950/20 border-green-500/30' 
              : 'bg-red-950/20 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              battle.is_win ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <Swords className={`w-4 h-4 ${battle.is_win ? 'text-green-400' : 'text-red-400'}`} />
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
            <p className={`text-xs font-medium ${battle.is_win ? 'text-green-400' : 'text-red-400'}`}>
              {battle.is_win ? '+1 conquista' : 'Sconfitta'}
            </p>
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
        // Query country_domination (no join per evitare RLS issues)
        const { data: conquests } = await supabase
          .from('country_domination')
          .select('owner_id')
          .eq('status', 'conquered')
          .not('owner_id', 'is', null);

        // Conta paesi per owner
        const ownerIds = [...new Set((conquests || []).map(c => c.owner_id))];
        const ownerCounts: Record<string, { full_name: string; agent_code: string; count: number }> = {};
        
        // Conta per ogni owner
        (conquests || []).forEach((c: any) => {
          if (c.owner_id) {
            if (!ownerCounts[c.owner_id]) {
              ownerCounts[c.owner_id] = { full_name: 'Agent', agent_code: '', count: 0 };
            }
            ownerCounts[c.owner_id].count++;
          }
        });
        
        // Fetch profile info separatamente da public_profiles
        if (ownerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('public_profiles')
            .select('id, full_name, agent_code, nickname')
            .in('id', ownerIds);
          
          (profiles || []).forEach((p: any) => {
            if (ownerCounts[p.id]) {
              ownerCounts[p.id].full_name = p.full_name || p.nickname || 'Agent';
              ownerCounts[p.id].agent_code = p.agent_code || '';
            }
          });
        }

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

