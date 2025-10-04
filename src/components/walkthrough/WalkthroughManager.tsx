// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useWalkthroughState } from '@/hooks/useWalkthroughState';
import { useAuthContext } from '@/contexts/auth';
import { InteractiveBuzzWalkthrough } from './InteractiveBuzzWalkthrough';
import { InteractiveBuzzMapWalkthrough } from './InteractiveBuzzMapWalkthrough';

interface WalkthroughManagerProps {
  onBuzzDemo?: () => void;
  onBuzzMapDemo?: () => void;
}

export function WalkthroughManager({ onBuzzDemo, onBuzzMapDemo }: WalkthroughManagerProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { buzzCompleted, buzzMapCompleted, loading } = useWalkthroughState();
  const [activeWalkthrough, setActiveWalkthrough] = useState<'buzz' | 'buzz_map' | null>(null);
  const [hasCheckedRoute, setHasCheckedRoute] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || loading) {
      setHasCheckedRoute(false);
      return;
    }

    // Check which walkthrough to show based on route
    if (location === '/buzz' && !buzzCompleted && !hasCheckedRoute) {
      setActiveWalkthrough('buzz');
      setHasCheckedRoute(true);
    } else if (location === '/map' && !buzzMapCompleted && !hasCheckedRoute) {
      setActiveWalkthrough('buzz_map');
      setHasCheckedRoute(true);
    } else if (location !== '/buzz' && location !== '/map') {
      setHasCheckedRoute(false);
    }
  }, [location, buzzCompleted, buzzMapCompleted, isAuthenticated, user, loading, hasCheckedRoute]);

  const handleBuzzComplete = () => {
    setActiveWalkthrough(null);
    setHasCheckedRoute(false);
  };

  const handleBuzzMapComplete = () => {
    setActiveWalkthrough(null);
    setHasCheckedRoute(false);
  };

  const handleBuzzDemoTrigger = () => {
    if (onBuzzDemo) {
      onBuzzDemo();
    }
  };

  const handleBuzzMapDemoTrigger = () => {
    if (onBuzzMapDemo) {
      onBuzzMapDemo();
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <>
      {activeWalkthrough === 'buzz' && (
        <InteractiveBuzzWalkthrough
          onComplete={handleBuzzComplete}
          onDemoTrigger={handleBuzzDemoTrigger}
        />
      )}
      {activeWalkthrough === 'buzz_map' && (
        <InteractiveBuzzMapWalkthrough
          onComplete={handleBuzzMapComplete}
          onDemoTrigger={handleBuzzMapDemoTrigger}
        />
      )}
    </>
  );
}
