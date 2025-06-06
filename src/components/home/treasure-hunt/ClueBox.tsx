
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";

interface UserClue {
  clue_id: string;
  title_it: string;
  description_it: string;
  created_at: string;
  clue_type: string;
}

export const ClueBox: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [clues, setClues] = useState<UserClue[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser } = useAuthContext();

  useEffect(() => {
    fetchUserClues();
  }, []);

  const fetchUserClues = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_clues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clues:', error);
        return;
      }

      setClues(data || []);
    } catch (error) {
      console.error('Error in fetchUserClues:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flip-card-front backface-hidden absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-cyan-400">Indizi Trovati</h3>
              <p className="text-2xl font-bold text-white">{loading ? '...' : clues.length}</p>
            </div>
            <Search className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back backface-hidden absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-lg p-4 border border-purple-500/30 rotate-y-180 overflow-y-auto">
          <h3 className="text-sm font-bold text-purple-400 mb-2">Dettagli Indizi</h3>
          {loading ? (
            <p className="text-white/70 text-sm">Caricamento...</p>
          ) : clues.length === 0 ? (
            <p className="text-white/70 text-sm">Nessun indizio trovato ancora</p>
          ) : (
            <div className="space-y-2">
              {clues.slice(0, 3).map((clue, index) => (
                <div key={clue.clue_id} className="bg-black/20 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-semibold text-white">{clue.title_it}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">{clue.description_it}</p>
                  <p className="text-xs text-cyan-400 mt-1">{formatDate(clue.created_at)}</p>
                </div>
              ))}
              {clues.length > 3 && (
                <p className="text-xs text-white/50 text-center">+{clues.length - 3} altri indizi</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
