// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface UserClue {
  clue_id: string;
  title_it: string;
  description_it: string;
  created_at: string;
  clue_type: string;
}

export const CluesList = () => {
  const [clues, setClues] = useState<UserClue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchClues = async () => {
      try {
        const { data, error } = await supabase
          .from('user_clues')
          .select('clue_id, title_it, description_it, created_at, clue_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching clues:', error);
          return;
        }

        setClues(data || []);
      } catch (err) {
        console.error('Exception fetching clues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClues();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-3">🧩 Indizi Trovati</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="glass-card p-4 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-white mb-3">🧩 Indizi Trovati {clues.length > 0 && `(${clues.length})`}</h3>
      
      {clues.length === 0 ? (
        <div className="text-center text-white/60 py-8">
          <p>Nessun indizio trovato oggi.</p>
          <p className="text-sm mt-2">Premi BUZZ per scoprire nuovi indizi!</p>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-300">💡 Gli indizi BUZZ verranno visualizzati qui dopo ogni utilizzo</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {clues.map((clue, index) => (
            <motion.div
              key={clue.clue_id}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{clue.title_it}</h4>
                <span className="text-xs text-white/50">
                  {new Date(clue.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {clue.description_it}
              </p>
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                  {clue.clue_type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};