// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Display degli indizi trovati dall'utente (da user_clues)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Clock, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface FoundClue {
  clue_id: string;
  title_it: string;
  description_it: string;
  clue_type: string;
  created_at: string;
  week_number?: number;
  buzz_cost?: number;
}

export const FoundCluesDisplay: React.FC = () => {
  const { user } = useAuth();
  const [foundClues, setFoundClues] = useState<FoundClue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFoundClues = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [FOUND CLUES] Loading found clues for user:', user.id);
        
        // 🔄 QUERY FINALE GLOBAL SYNC - Tutti gli indizi trovati dall'utente
        const { data: clues, error } = await supabase
          .from("user_clues")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error('❌ [FOUND CLUES] Error loading found clues:', error);
          return;
        }

        console.log('✅ [FOUND CLUES] Found clues loaded:', clues?.length || 0, clues);
        
        // FORCE UPDATE UI - Ensure clues are displayed
        // Map DB data to FoundClue interface (add missing fields with defaults)
        const mappedClues = (clues || []).map((clue: any) => ({
          ...clue,
          description_it: clue.description_it || clue.title_it || 'Indizio trovato',
          clue_type: clue.clue_type || 'buzz'
        }));

        if (mappedClues.length > 0) {
          console.log('🎯 [FOUND CLUES] DISPLAYING CLUES:', mappedClues.map(c => ({ id: c.clue_id, title: c.title_it, type: c.clue_type })));
        } else {
          console.log('⚠️ [FOUND CLUES] NO CLUES FOUND IN DATABASE');
        }
        
        setFoundClues(mappedClues);
      } catch (error) {
        console.error('❌ [FOUND CLUES] Exception loading found clues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFoundClues();
    
    // AUTO-REFRESH ogni 5 secondi per sincronizzazione real-time
    const interval = setInterval(loadFoundClues, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const getClueIcon = (type: string) => {
    switch (type) {
      case 'buzz':
        return <Award className="w-4 h-4 text-yellow-400" />;
      case 'buzz_map':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'buzz':
        return 'BUZZ';
      case 'buzz_map':
        return 'BUZZ MAPPA';
      case 'qr':
        return 'QR CODE';
      default:
        return type?.toUpperCase() || 'INDIZIO';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0a0a0a] rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (foundClues.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Lightbulb className="w-12 h-12 text-gray-500 mx-auto" />
        </div>
        <p className="text-white/60 text-sm">
          Nessun indizio trovato. Prova con il BUZZ!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {foundClues.map((clue, index) => (
        <motion.div
          key={clue.clue_id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getClueIcon(clue.clue_type)}
              <span className="text-xs text-white/60 font-mono">
                {getTypeLabel(clue.clue_type)}
              </span>
              {clue.buzz_cost && (
                <span className="text-xs text-yellow-400">
                  €{clue.buzz_cost}
                </span>
              )}
            </div>
            <span className="text-xs text-white/40">
              {new Date(clue.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
          
          <h4 className="text-white font-medium text-sm mb-1">
            {clue.title_it}
          </h4>
          
          <p className="text-white/70 text-xs leading-relaxed">
            {clue.description_it}
          </p>
          
          {clue.week_number && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-xs text-white/50">
                Settimana {clue.week_number}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FoundCluesDisplay;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ - Container indizi trovati sincronizzato con user_clues database
 */