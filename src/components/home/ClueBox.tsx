
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface Clue {
  clue_id: string;
  title_it: string;
  description_it: string;
  created_at: string;
  clue_type: string;
}

const ClueBox = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFlipped && clues.length === 0) {
      fetchClues();
    }
  }, [isFlipped]);

  const fetchClues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_clues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setClues(data);
      }
    } catch (error) {
      console.error('Error fetching clues:', error);
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
    <motion.div
      className="flip-box relative h-32 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Front */}
      <div className="flip-box-front bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 flex items-center justify-between text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5" />
            <h3 className="font-bold text-lg">Indizi Trovati</h3>
          </div>
          <p className="text-2xl font-bold text-blue-200">{clues.length}</p>
        </div>
        <div className="text-4xl opacity-30">🔍</div>
      </div>

      {/* Back */}
      <div className="flip-box-back bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 text-white overflow-y-auto">
        <h3 className="font-bold text-lg mb-3 text-center">Indizi Raccolti</h3>
        {loading ? (
          <div className="text-center">Caricamento...</div>
        ) : clues.length > 0 ? (
          <div className="space-y-2">
            {clues.map((clue) => (
              <div key={clue.clue_id} className="bg-blue-700/50 rounded-lg p-2">
                <div className="font-semibold text-sm">{clue.title_it}</div>
                <div className="text-xs text-blue-200 truncate">{clue.description_it}</div>
                <div className="text-xs text-blue-300 mt-1">
                  {formatDate(clue.created_at)} • {clue.clue_type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-blue-300">Nessun indizio trovato</div>
        )}
      </div>
    </motion.div>
  );
};

export default ClueBox;
