// © 2025 M1SSION™ - PWA Wrapper with Pull-to-Refresh
import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';

interface PWAWrapperProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const PWAWrapper: React.FC<PWAWrapperProps> = ({
  children,
  onRefresh
}) => {
  const { isPulling, pullDistance, isTriggered } = usePullToRefresh({
    threshold: 70,
    onRefresh,
    enabled: true
  });

  return (
    <>
      <PullToRefreshIndicator
        visible={isPulling}
        progress={pullDistance}
        triggered={isTriggered}
      />
      {children}
    </>
  );
};