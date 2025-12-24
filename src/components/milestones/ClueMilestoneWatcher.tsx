/**
 * CLUE MILESTONE WATCHER™ — Global watcher per milestone indizi
 * Montato in App.tsx per monitorare i milestone ovunque nell'app
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useClueMilestones, CLUE_MILESTONES } from '@/hooks/useClueMilestones';
import { ClueMilestoneModal } from './ClueMilestoneModal';

// Intervallo di polling per controllare gli indizi (in ms)
const POLL_INTERVAL = 5000; // 5 secondi

// 🔥 LOG ALL'ESTERNO DEL COMPONENTE
console.log('[ClueMilestoneWatcher] 📦 MODULE LOADED');

export const ClueMilestoneWatcher: React.FC = () => {
  // 🔥 LOG IMMEDIATO AL RENDER
  console.log('[ClueMilestoneWatcher] 🎬 RENDER START');
  
  const { user } = useAuth();
  const [clueCount, setClueCount] = useState(0);
  const prevClueCountRef = useRef(0);
  const lastCheckRef = useRef(0);
  const hasInitializedRef = useRef(false);
  
  // 🔥 DEBUG: Log mount IMMEDIATO
  console.log('[ClueMilestoneWatcher] 👤 User:', user?.id?.slice(0, 8) || 'NO USER');
  
  const {
    pendingMilestone,
    checkAndClaimMilestones,
    dismissMilestone,
    claimedKeys,
    isLoading
  } = useClueMilestones();
  
  // 🔥 DEBUG: Log hook state IMMEDIATO
  console.log('[ClueMilestoneWatcher] 📦 Hook state:', {
    isLoading,
    claimedKeysCount: claimedKeys.size,
    claimedKeys: Array.from(claimedKeys),
    pendingMilestone: pendingMilestone?.key || null,
    clueCount
  });

  // Fetch clue count from database - PIÙ ROBUSTO
  const fetchClueCount = useCallback(async () => {
    if (!user?.id) {
      console.log('[ClueMilestoneWatcher] ⚠️ fetchClueCount: No user ID');
      return;
    }
    
    // Throttle: non più di una chiamata ogni 3 secondi
    const now = Date.now();
    if (now - lastCheckRef.current < 3000) {
      return; // Skip throttled calls silently
    }
    lastCheckRef.current = now;

    console.log('[ClueMilestoneWatcher] 🔄 Fetching clue count...');

    try {
      // 1. ✅ Leggi da user_mission_status
      const { data: missionStatus, error } = await supabase
        .from('user_mission_status')
        .select('clues_found')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.log('[ClueMilestoneWatcher] ⚠️ user_mission_status error:', error.message);
      }
      
      if (missionStatus?.clues_found !== undefined && missionStatus.clues_found !== null) {
        const count = missionStatus.clues_found;
        console.log('[ClueMilestoneWatcher] ✅ Clues found:', count);
        
        if (count !== clueCount) {
          console.log('[ClueMilestoneWatcher] 📈 Clue count changed:', clueCount, '->', count);
          setClueCount(count);
        }
        return;
      }

      // 2. Fallback: conta le notifiche buzz
      console.log('[ClueMilestoneWatcher] 📡 Fallback: counting notifications...');
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'buzz');
      
      if (notifCount !== null) {
        console.log('[ClueMilestoneWatcher] ✅ Clues from notifications:', notifCount);
        if (notifCount !== clueCount) {
          setClueCount(notifCount);
        }
      }
    } catch (err) {
      console.error('[ClueMilestoneWatcher] ❌ Error:', err);
    }
  }, [user?.id, clueCount]);

  // 🔥 EFFETTO 1: Inizializzazione e polling
  useEffect(() => {
    console.log('[ClueMilestoneWatcher] 🚀 useEffect[polling] - user:', user?.id?.slice(0, 8) || 'none');
    
    if (!user?.id) {
      console.log('[ClueMilestoneWatcher] ⏸️ No user, skipping polling setup');
      return;
    }

    // Fetch iniziale
    console.log('[ClueMilestoneWatcher] 🎯 Starting initial fetch...');
    fetchClueCount();

    // Poll ogni N secondi
    const interval = setInterval(() => {
      fetchClueCount();
    }, POLL_INTERVAL);

    // Ascolta eventi custom di nuovi indizi
    const handleNewClue = () => {
      console.log('[ClueMilestoneWatcher] 🎯 New clue event!');
      setTimeout(fetchClueCount, 500);
    };

    window.addEventListener('buzzClueCreated', handleNewClue);
    window.addEventListener('buzzCompleted', handleNewClue);
    window.addEventListener('clue-found', handleNewClue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('buzzClueCreated', handleNewClue);
      window.removeEventListener('buzzCompleted', handleNewClue);
      window.removeEventListener('clue-found', handleNewClue);
    };
  }, [user?.id, fetchClueCount]);

  // 🔥 EFFETTO 2: Check milestones quando cambia clueCount O al primo load
  useEffect(() => {
    console.log('[ClueMilestoneWatcher] 🔍 useEffect[milestones] - checking...', {
      isLoading,
      clueCount,
      prevCount: prevClueCountRef.current,
      hasInitialized: hasInitializedRef.current
    });
    
    if (isLoading) {
      console.log('[ClueMilestoneWatcher] ⏳ Still loading, skipping check');
      return;
    }
    
    if (clueCount <= 0) {
      console.log('[ClueMilestoneWatcher] ⏳ No clues yet, skipping check');
      return;
    }

    // ✅ FIX: Trova TUTTI i milestone non reclamati
    const unclaimedMilestones = CLUE_MILESTONES.filter(m => 
      clueCount >= m.threshold && !claimedKeys.has(m.key)
    );

    console.log('[ClueMilestoneWatcher] 📊 Milestone check:', {
      clueCount,
      totalMilestones: CLUE_MILESTONES.length,
      claimedCount: claimedKeys.size,
      unclaimedCount: unclaimedMilestones.length,
      unclaimed: unclaimedMilestones.map(m => m.key)
    });

    if (unclaimedMilestones.length > 0) {
      console.log('[ClueMilestoneWatcher] 🏆🏆🏆 FOUND UNCLAIMED MILESTONES!', unclaimedMilestones.map(m => m.key));
      
      // Reclama!
      checkAndClaimMilestones(clueCount);
    } else {
      console.log('[ClueMilestoneWatcher] ✅ All eligible milestones already claimed');
    }

    prevClueCountRef.current = clueCount;
    hasInitializedRef.current = true;

  }, [clueCount, checkAndClaimMilestones, claimedKeys, isLoading]);

  // 🔥 LOG finale prima del render
  console.log('[ClueMilestoneWatcher] 🎬 RENDER - pendingMilestone:', pendingMilestone?.key || 'none');

  // Render solo il modal (il watcher gira in background)
  return (
    <ClueMilestoneModal
      milestone={pendingMilestone}
      onClose={dismissMilestone}
    />
  );
};

export default ClueMilestoneWatcher;

