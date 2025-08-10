// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ

import React from 'react';
import { useQRMapIntegration } from '@/hooks/useQRMapIntegration';

export const QRMarkers = () => {
  const { qrMarkers, getQRMarkerStyle, getQRMarkerIcon, redeemQRCode } = useQRMapIntegration();

  const handleQRClick = async (code: string, isInRange: boolean) => {
    if (!isInRange) {
      alert('🚫 Devi essere più vicino al QR code per riscattarlo!');
      return;
    }

    try {
      const result = await redeemQRCode(code);
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert('❌ Errore nel riscatto del QR code');
    }
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
    </>
  );
};