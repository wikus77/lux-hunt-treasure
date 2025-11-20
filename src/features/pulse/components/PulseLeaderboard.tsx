// @ts-nocheck
/**
 * THE PULSE™ — Leaderboard Component
 * Leaderboard ottica su viste aggregate, opt-in privacy, ottimizzata per mobile
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  full_name: string;
  agent_code: string;
  event_count: number;
  total_contribution: number;
  last_contribution: string;
}

type LeaderboardPeriod = 'daily' | 'weekly';

export const PulseLeaderboard = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const viewName = period === 'daily' ? 'pulse_leaderboard_daily' : 'pulse_leaderboard_weekly';
        const { data, error } = await supabase.from(viewName).select('*').limit(50);

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Top Contributors</h3>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Oggi</TabsTrigger>
          <TabsTrigger value="weekly">Settimana</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Caricamento classifica...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nessun contributor ancora. Inizia tu!
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <motion.div
                    key={`${entry.agent_code}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < 3
                        ? 'bg-gradient-to-r from-primary/10 to-transparent'
                        : 'bg-muted/30'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {getRankIcon(index) || (
                        <span className="text-sm font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Agent info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {entry.full_name || 'Agent'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {entry.agent_code}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-primary tabular-nums">
                        {entry.total_contribution?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.event_count} azioni
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center">
        🔒 Privacy-safe: solo agenti che hanno dato consenso opt-in
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
