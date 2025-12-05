// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Dynamic Island Context Manager - Updates content based on current page

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useDynamicIsland, DynamicIslandPage } from '@/contexts/DynamicIslandContext';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useNotifications } from '@/hooks/useNotifications';
import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard';
import { useBuzzMapPricingNew } from '@/hooks/useBuzzMapPricingNew';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useBuzzGrants } from '@/hooks/useBuzzGrants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// Map route paths to Dynamic Island pages
const getPageFromPath = (path: string): DynamicIslandPage => {
  const normalizedPath = path.toLowerCase();
  
  if (normalizedPath === '/' || normalizedPath === '/home' || normalizedPath === '/app-home') {
    return 'home';
  }
  if (normalizedPath.includes('/sandbox') || normalizedPath.includes('/buzz-map') || normalizedPath.includes('/map')) {
    return 'buzz-map';
  }
  if (normalizedPath === '/buzz' || normalizedPath.includes('/buzz-page')) {
    return 'buzz';
  }
  if (normalizedPath.includes('/intelligence') || normalizedPath.includes('/norah') || normalizedPath.includes('/aion')) {
    return 'intelligence';
  }
  if (normalizedPath.includes('/notification') || normalizedPath.includes('/notice')) {
    return 'notifications';
  }
  if (normalizedPath.includes('/leaderboard') || normalizedPath.includes('/winners') || normalizedPath.includes('/hall')) {
    return 'leaderboard';
  }
  if (normalizedPath.includes('/profile')) {
    return 'profile';
  }
  
  return 'default';
};

const DynamicIslandContextManager: React.FC = () => {
  const [location] = useLocation();
  const { isActive, setPage, updateData } = useDynamicIsland();
  const { missionStatus } = useMissionStatus();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  
  // REAL leaderboard data (not random!)
  const { currentUserRank } = useRealtimeLeaderboard({ 
    scope: 'global', 
    limit: 50,
    enableNotifications: false 
  });
  
  // BUZZ MAP pricing from server (for /sandbox page)
  const { nextCostM1U: buzzMapCost } = useBuzzMapPricingNew(user?.id);
  
  // BUZZ NORMAL pricing (for /buzz page)
  const { getCurrentBuzzCostM1U } = useBuzzCounter(user?.id);
  const { hasFreeBuzz } = useBuzzGrants();
  
  // Use refs to track previous values and prevent unnecessary updates
  const prevLocationRef = useRef<string>('');
  const prevMissionRef = useRef<string>('');
  const prevUnreadRef = useRef<number>(-1);
  const prevLeaderboardRef = useRef<number>(-1);
  const prevBuzzCostRef = useRef<string>('');
  const loadedRewardsRef = useRef<boolean>(false);

  // Load reward markers stats (only once per session)
  const loadRewardStats = useCallback(async () => {
    if (!user?.id || loadedRewardsRef.current) return;
    
    try {
      loadedRewardsRef.current = true;
      
      const { count: totalCount } = await supabase
        .from('markers')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      
      const { count: claimedCount } = await supabase
        .from('marker_claims')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      const total = totalCount ?? 99;
      const claimed = claimedCount ?? 0;
      const available = Math.max(0, total - claimed);
      
      updateData({
        rewardsAvailable: available,
        totalRewards: total
      });
      
      console.log('🎵 Dynamic Island: Reward stats loaded', { available, total });
    } catch (error) {
      console.warn('🎵 Dynamic Island: Failed to load reward stats', error);
      loadedRewardsRef.current = false; // Allow retry
    }
  }, [user?.id, updateData]);

  // Update page when route changes
  useEffect(() => {
    if (!isActive) return;
    if (location === prevLocationRef.current) return;
    
    prevLocationRef.current = location;
    const newPage = getPageFromPath(location);
    
    console.log('🎵 Dynamic Island Context: Route →', newPage);
    setPage(newPage);
    
    // Load reward stats when on buzz-map
    if (newPage === 'buzz-map') {
      loadRewardStats();
    }
  }, [location, isActive, setPage, loadRewardStats]);

  // Update HOME data (only when data actually changes)
  useEffect(() => {
    if (!isActive || !missionStatus) return;
    
    const missionKey = `${missionStatus.cluesFound}-${missionStatus.totalClues}-${missionStatus.daysRemaining}`;
    if (missionKey === prevMissionRef.current) return;
    
    prevMissionRef.current = missionKey;
    
    updateData({
      cluesFound: missionStatus.cluesFound,
      totalClues: missionStatus.totalClues,
      daysRemaining: missionStatus.daysRemaining
    });
  }, [isActive, missionStatus?.cluesFound, missionStatus?.totalClues, missionStatus?.daysRemaining, updateData]);

  // Update NOTIFICATIONS data (only when count changes)
  useEffect(() => {
    if (!isActive) return;
    if (unreadCount === prevUnreadRef.current) return;
    
    prevUnreadRef.current = unreadCount;
    updateData({ unreadCount });
  }, [isActive, unreadCount, updateData]);

  // Update LEADERBOARD data with REAL position from useRealtimeLeaderboard
  useEffect(() => {
    if (!isActive || !currentUserRank) return;
    
    const realRank = currentUserRank.rank;
    if (realRank === prevLeaderboardRef.current) return;
    
    prevLeaderboardRef.current = realRank;
    
    console.log('🎵 Dynamic Island: REAL leaderboard rank →', realRank);
    updateData({
      currentPosition: realRank,
      positionChange: currentUserRank.change || 0
    });
  }, [isActive, currentUserRank?.rank, currentUserRank?.change, updateData]);

  // Update BUZZ cost based on CURRENT PAGE
  // - /buzz → use normal BUZZ cost from useBuzzCounter
  // - /sandbox (buzz-map) → use BUZZ MAP cost from useBuzzMapPricingNew
  useEffect(() => {
    if (!isActive) return;
    
    const currentPage = getPageFromPath(location);
    let costToShow: number;
    
    if (currentPage === 'buzz-map') {
      // BUZZ MAP page → use server pricing
      costToShow = buzzMapCost;
      console.log('🎵 Dynamic Island: BUZZ MAP cost →', costToShow, 'M1U');
    } else if (currentPage === 'buzz') {
      // Regular BUZZ page → use buzz counter pricing
      costToShow = hasFreeBuzz ? 0 : getCurrentBuzzCostM1U();
      console.log('🎵 Dynamic Island: BUZZ cost →', costToShow, 'M1U', hasFreeBuzz ? '(FREE)' : '');
    } else {
      // Other pages → don't update buzz cost
      return;
    }
    
    // Create unique key to prevent duplicate updates
    const costKey = `${currentPage}-${costToShow}`;
    if (costKey === prevBuzzCostRef.current) return;
    
    prevBuzzCostRef.current = costKey;
    updateData({ buzzCost: costToShow });
  }, [isActive, location, buzzMapCost, getCurrentBuzzCostM1U, hasFreeBuzz, updateData]);

  // Set AION status when on intelligence page
  useEffect(() => {
    if (!isActive) return;
    
    const currentPage = getPageFromPath(location);
    if (currentPage === 'intelligence') {
      updateData({ aionStatus: 'active' });
    }
  }, [isActive, location, updateData]);

  return null;
};

export default DynamicIslandContextManager;
