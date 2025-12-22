// @ts-nocheck
/**
 * RealtimePlayersPill - Shows real-time player count + 1019 (base offset)
 * Uses Supabase Realtime Presence for live tracking
 * Styled to match M1UPill glassmorphism design
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { TOTAL_NPC_COUNT } from '@/data/fictitious-agents.seed';

// Dynamic base offset from actual NPC count (~1370+ agents)
const BASE_PLAYER_OFFSET = TOTAL_NPC_COUNT;
const CHANNEL_NAME = 'presence:map-3d-tiler';

interface RealtimePlayersPillProps {
  className?: string;
}

const RealtimePlayersPill: React.FC<RealtimePlayersPillProps> = ({ className = '' }) => {
  const { user } = useUnifiedAuth();
  const [realtimeCount, setRealtimeCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Generate a session ID for anonymous users
    const getSessionId = () => {
      if (user?.id) return user.id;
      
      // Try to get or create anonymous session ID
      let anonId = sessionStorage.getItem('m1_anon_session');
      if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('m1_anon_session', anonId);
      }
      return anonId;
    };

    const sessionId = getSessionId();

    // Create Presence channel
    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channelRef.current = channel;

    // Track presence sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const uniqueUsers = Object.keys(state).length;
        console.log('[RealtimePlayersPill] Presence sync:', uniqueUsers, 'users');
        setRealtimeCount(uniqueUsers);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[RealtimePlayersPill] User joined:', key);
        const state = channel.presenceState();
        setRealtimeCount(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[RealtimePlayersPill] User left:', key);
        const state = channel.presenceState();
        setRealtimeCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({
            user_id: sessionId,
            online_at: new Date().toISOString(),
            page: '/map-3d-tiler',
          });
          setIsConnected(true);
          console.log('[RealtimePlayersPill] Subscribed and tracking presence');
        }
      });

    return () => {
      console.log('[RealtimePlayersPill] Cleaning up presence channel');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id]);

  // Calculate display value: realtime + base offset
  const displayCount = realtimeCount + BASE_PLAYER_OFFSET;

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-full cursor-default"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.2) 58%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow:
            '0 2px 12px rgba(0,0,0,.35), 0 0 20px rgba(255, 50, 50, 0.12) inset',
          backdropFilter: 'blur(12px)',
          minHeight: 40,
        }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Users Icon with red glow */}
        <motion.div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FF3366 0%, #FF0033 100%)',
            boxShadow: '0 0 10px rgba(255, 51, 102, 0.7)',
          }}
        >
          <Users className="w-3 h-3 text-white" />
        </motion.div>

        {/* Player count - Red neon number */}
        <span
          className="text-sm font-bold font-orbitron tracking-wide"
          style={{
            color: '#FF3366',
            textShadow: '0 0 10px rgba(255, 51, 102, 0.9), 0 0 20px rgba(255, 51, 102, 0.5)',
          }}
        >
          {displayCount.toLocaleString('it-IT')}
        </span>

        {/* Connection indicator */}
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{
            boxShadow: isConnected 
              ? '0 0 6px rgba(34, 197, 94, 0.8)' 
              : '0 0 6px rgba(234, 179, 8, 0.8)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default RealtimePlayersPill;


