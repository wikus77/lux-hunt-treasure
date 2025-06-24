
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';

interface LeaderboardEntry {
  id: string;
  agent_code: string;
  full_name: string;
  clues_found: number;
  score: number;
  position: number;
}

export const LeaderboardTable: React.FC = () => {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // CRITICAL FIX: Proper leaderboard calculation
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, agent_code, full_name')
          .not('agent_code', 'is', null);

        if (profileError) {
          throw profileError;
        }

        // CRITICAL FIX: Calculate scores based on user_clues
        const { data: clues, error: cluesError } = await supabase
          .from('user_clues')
          .select('user_id, clue_type, buzz_cost');

        if (cluesError) {
          throw cluesError;
        }

        // Calculate leaderboard entries
        const leaderboardData: LeaderboardEntry[] = profiles.map(profile => {
          const userClues = clues.filter(clue => clue.user_id === profile.id);
          const cluesFound = userClues.length;
          const score = userClues.reduce((total, clue) => {
            // Different scores for different clue types
            switch (clue.clue_type) {
              case 'precise': return total + 100;
              case 'vague': return total + 50;
              default: return total + 25;
            }
          }, 0);

          return {
            id: profile.id,
            agent_code: profile.agent_code || 'Unknown',
            full_name: profile.full_name || 'Agent',
            clues_found: cluesFound,
            score: score,
            position: 0 // Will be calculated after sorting
          };
        });

        // Sort by score and assign positions
        leaderboardData.sort((a, b) => b.score - a.score);
        leaderboardData.forEach((entry, index) => {
          entry.position = index + 1;
        });

        setEntries(leaderboardData);
        setError(null);
        
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
        setError('Errore nel caricamento della classifica');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" className="text-[#00D1FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">
        🏆 Classifica Agenti
      </h2>
      
      <div className="space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className={`p-4 rounded-lg border transition-colors ${
              entry.id === user?.id
                ? 'bg-[#00D1FF]/20 border-[#00D1FF]/50'
                : 'bg-black/40 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-[#00D1FF]">
                  #{entry.position}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {entry.agent_code}
                  </div>
                  <div className="text-sm text-gray-400">
                    {entry.full_name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {entry.score} pts
                </div>
                <div className="text-sm text-gray-400">
                  {entry.clues_found} indizi
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {entries.length === 0 && (
        <div className="text-center p-8 text-gray-400">
          Nessun dato disponibile per la classifica
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
