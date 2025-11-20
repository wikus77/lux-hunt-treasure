/**
 * TRON BATTLE - Ghost Mode Indicator
 * Phase 1.1: Shows when user is in ghost mode (3 losses = 24h protection)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */
// @ts-nocheck


import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function GhostModeIndicator() {
  const [ghostMode, setGhostMode] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadGhostMode(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('ghost_mode')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_ghost_mode',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadGhostMode(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadGhostMode = async (uid: string) => {
    const { data } = await supabase
      .from('battle_ghost_mode')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (data?.ghost_mode_active && data?.ghost_until && new Date(data.ghost_until) > new Date()) {
      setGhostMode(data);
    } else {
      setGhostMode(null);
    }
  };

  const getTimeRemaining = () => {
    if (!ghostMode?.ghost_until) return '';
    const remaining = new Date(ghostMode.ghost_until).getTime() - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <AnimatePresence>
      {ghostMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50"
        >
          <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-500/50 shadow-2xl shadow-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Ghost className="w-8 h-8 text-purple-400" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-green-400" />
                    <p className="text-white font-bold text-sm">Ghost Mode Active</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeRemaining()} remaining</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Protected from challenges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
