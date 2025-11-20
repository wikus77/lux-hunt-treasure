// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, MapPin, Gift } from 'lucide-react';
import { useLocation } from 'wouter';
import { useXpSystem } from '@/hooks/useXpSystem';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export const RewardBadgeCard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { xpStatus, consumeCredit } = useXpSystem();
  const { user } = useAuthContext();

  const handleBuzzReward = async () => {
    if (!user?.id) return;

    try {
      // Create badge in user_badges if doesn't exist
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'xp_reward_buzz')
        .single();

      if (!existingBadge) {
        // Find or create the buzz reward badge
        let { data: buzzBadge } = await supabase
          .from('badges')
          .select('*')
          .eq('name', 'BUZZ Gratuito')
          .single();

        if (!buzzBadge) {
          const { data: newBadge } = await supabase
            .from('badges')
            .insert({
              name: 'BUZZ Gratuito',
              description: 'Hai guadagnato un BUZZ gratuito con gli XP!',
              icon: 'zap'
            })
            .select()
            .single();
          
          buzzBadge = newBadge;
        }

        if (buzzBadge) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: buzzBadge.badge_id,
              source: 'xp_reward_buzz'
            });
        }
      }

      // Redirect to buzz page
      setLocation('/buzz?free=1&reward=1');
    } catch (error) {
      console.error('Error handling buzz reward:', error);
      toast.error('Errore nel riscattare il premio');
    }
  };

  const handleBuzzMapReward = async () => {
    if (!user?.id) return;

    try {
      // Create badge in user_badges if doesn't exist
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'xp_reward_buzz_map')
        .single();

      if (!existingBadge) {
        // Find or create the buzz map reward badge
        let { data: mapBadge } = await supabase
          .from('badges')
          .select('*')
          .eq('name', 'BUZZ MAPPA Gratuito')
          .single();

        if (!mapBadge) {
          const { data: newBadge } = await supabase
            .from('badges')
            .insert({
              name: 'BUZZ MAPPA Gratuito',
              description: 'Hai guadagnato un BUZZ MAPPA gratuito con gli XP!',
              icon: 'target'
            })
            .select()
            .single();
          
          mapBadge = newBadge;
        }

        if (mapBadge) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: mapBadge.badge_id,
              source: 'xp_reward_buzz_map'
            });
        }
      }

      // Redirect to map page
      setLocation('/map?free=1&reward=1');
    } catch (error) {
      console.error('Error handling buzz map reward:', error);
      toast.error('Errore nel riscattare il premio');
    }
  };

  if (xpStatus.free_buzz_credit === 0 && xpStatus.free_buzz_map_credit === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Gift className="w-6 h-6 text-yellow-400" />
          🎖️ BADGE SBLOCCATI!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {xpStatus.free_buzz_credit > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuzzReward}
            className="w-full p-4 bg-gradient-to-r from-purple-900/60 to-purple-700/60 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/70 rounded-full">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-white">BUZZ Gratuito Sbloccato!</p>
                  <p className="text-sm text-purple-200">
                    Hai guadagnato un BUZZ gratuito ({xpStatus.free_buzz_credit} disponibili)
                  </p>
                </div>
              </div>
              <div className="text-3xl">🎁</div>
            </div>
          </motion.button>
        )}

        {xpStatus.free_buzz_map_credit > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuzzMapReward}
            className="w-full p-4 bg-gradient-to-r from-cyan-900/60 to-cyan-700/60 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-600/70 rounded-full">
                  <MapPin className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-white">BUZZ MAPPA Gratuito Sbloccato!</p>
                  <p className="text-sm text-cyan-200">
                    Hai guadagnato un BUZZ MAPPA gratuito ({xpStatus.free_buzz_map_credit} disponibili)
                  </p>
                </div>
              </div>
              <div className="text-3xl">🗺️</div>
            </div>
          </motion.button>
        )}
      </CardContent>
    </Card>
  );
};
