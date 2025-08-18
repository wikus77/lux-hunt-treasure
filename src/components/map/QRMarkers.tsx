// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ

import React, { useState, Suspense } from 'react';
import { useQRMapIntegration } from '@/hooks/useQRMapIntegration';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';

// Lazy load ClaimRewardModal for performance
const ClaimRewardModal = React.lazy(() => import('@/components/marker-rewards/ClaimRewardModal'));

export const QRMarkers = () => {
  const { qrMarkers, getQRMarkerStyle, getQRMarkerIcon } = useQRMapIntegration();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const { rewards, fetchRewards } = useMarkerRewards();
  
  // Fetch rewards when marker is selected
  React.useEffect(() => {
    if (selectedMarkerId) {
      fetchRewards(selectedMarkerId);
    }
  }, [selectedMarkerId, fetchRewards]);

  const handleQRClick = (code: string, isInRange: boolean) => {
    console.log('M1QR-TRACE:', { step: 'qr_click', code, isInRange });
    
    if (!isInRange) {
      alert('🚫 Devi essere più vicino al QR code per riscattarlo!');
      return;
    }

    // Check if this marker has configured rewards
    setSelectedMarkerId(code);
  };

  const handleClaimSuccess = (nextRoute?: string) => {
    if (nextRoute) {
      window.location.href = nextRoute;
    }
    setSelectedMarkerId(null);
  };

  const handleModalClose = () => {
    setSelectedMarkerId(null);
  };

  return (
    <>
      {qrMarkers.map((marker) => {
        const top = Number.isFinite((marker as any)?.lat) ? (marker as any).lat : null;
        const left = Number.isFinite((marker as any)?.lng) ? (marker as any).lng : null;
        const inRange = Boolean((marker as any)?.isInRange);
        if (top === null || left === null) {
          if (import.meta.env.DEV) {
            console.groupCollapsed('[MAP] invalid lat/lng filtered in QRMarkers');
            console.log(marker);
            console.groupEnd();
          }
          return null;
        }
        return (
          <div
            key={marker.id}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              ...getQRMarkerStyle(marker)
            }}
            onClick={() => handleQRClick(marker.code, inRange)}
            title={`QR: ${marker.location_name} (${marker.distance}m)`}
          >
            {getQRMarkerIcon(marker.reward_type)}
          </div>
        );
      })}
      
      {/* Claim Reward Modal */}
      {selectedMarkerId && rewards.length > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <ClaimRewardModal
            isOpen={true}
            onClose={handleModalClose}
            markerId={selectedMarkerId}
            rewards={rewards}
            onSuccess={handleClaimSuccess}
          />
        </Suspense>
      )}
    </>
  );
};